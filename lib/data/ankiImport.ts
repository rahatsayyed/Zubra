import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import JSZip from 'jszip';
import { executeSql, generateId, querySql } from './database';
import { createInitialCard, convertFSRSCardToDB } from './fsrs';

export const importAnkiDeck = async () => {
  try {
    // 1. Pick the .apkg file
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return { success: false, message: 'Import cancelled' };
    }

    const file = result.assets[0];
    const fileUri = file.uri;
    const fileName = file.name || 'Imported Deck';

    console.log(`Starting import of ${fileName}`);

    // Read the zip file into memory (works for small-medium decks, for huge decks might need chunking)
    const zipData = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const zip = new JSZip();
    await zip.loadAsync(zipData, { base64: true });

    // 2. Extract SQLite db from zip (usually collection.anki2 or collection.anki21)
    const dbFile = zip.file('collection.anki21') || zip.file('collection.anki2');
    if (!dbFile) {
      throw new Error('Could not find Anki database inside the archive.');
    }

    const dbBase64 = await dbFile.async('base64');
    
    // Write Anki db to native file system so expo-sqlite can read it
    const tempDbName = `temp_anki_${Date.now()}.db`;
    // expo-sqlite expects the db in its specific SQLite directory
    const sqliteDir = `${FileSystem.documentDirectory}SQLite`;
    await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true }).catch(() => {});
    const tempDbUri = `${sqliteDir}/${tempDbName}`;
    
    await FileSystem.writeAsStringAsync(tempDbUri, dbBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 3. Extract media file mapping
    const mediaFile = zip.file('media');
    let mediaMapping: Record<string, string> = {};
    if (mediaFile) {
      const mediaJson = await mediaFile.async('string');
      mediaMapping = JSON.parse(mediaJson);
    }

    // Process media files: Move them to app documents to be referenced by file:// URIs later
    const docDir = FileSystem.documentDirectory;
    const mediaUriMap: Record<string, string> = {}; // maps Anki's arbitrary filename -> local URI

    for (const [ankiKey, originalFilename] of Object.entries(mediaMapping)) {
      const zippedMediaFile = zip.file(ankiKey);
      if (zippedMediaFile) {
        const mediaBase64 = await zippedMediaFile.async('base64');
        const localMediaUri = `${docDir}${originalFilename}`;
        await FileSystem.writeAsStringAsync(localMediaUri, mediaBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        mediaUriMap[originalFilename] = localMediaUri;
      }
    }

    // 4. Open the temporary Anki SQLite DB
    const ankiDb = await SQLite.openDatabaseAsync(tempDbName);

    // Read models to understand fields
    // Anki models are stored as a JSON blob in the `models` column of the `col` table
    const colRows = await ankiDb.getAllAsync(`SELECT models FROM col LIMIT 1`) as any[];
    if (colRows.length === 0) {
      throw new Error('Invalid Anki database: no col table found.');
    }

    const modelsObj = JSON.parse(colRows[0].models);
    
    // Fetch notes (the fundamental content)
    // flds contains front and back separated by \x1f (ASCII unit separator)
    const notes = await ankiDb.getAllAsync(`SELECT id, mid, flds FROM notes`) as any[];
    
    // 5. Insert into Zubra DB
    // Create new deck for this import
    const newDeckId = generateId();
    await executeSql(`INSERT INTO decks (id, title) VALUES (?, ?)`, [newDeckId, fileName.replace('.apkg', '')]);

    let importedCount = 0;

    for (const note of notes) {
      const mid = String(note.mid);
      const model = modelsObj[mid];
      
      if (!model) continue;

      // Split fields by \x1f
      const fields = note.flds.split('\x1f');
      
      // Basic heuristic: assume first field is Question, second is Answer.
      // E.g. basic cards have front/back. Cloze has text/extra.
      let questionHtml = fields[0] || '';
      let answerHtml = fields.length > 1 ? fields[1] : '';

      // If Cloze, it usually has {{c1::...}} which needs specialized parsing, but we'll import as is for now.

      // Replace Anki media tags with our local file URIs
      // Ex: <img src="dog.jpg"> -> <img src="file:///.../dog.jpg">
      for (const [filename, fileUri] of Object.entries(mediaUriMap)) {
        const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`src=["']?${escapedFilename}["']?`, 'g');
        const replacement = `src="${fileUri}"`;
        questionHtml = questionHtml.replace(regex, replacement);
        answerHtml = answerHtml.replace(regex, replacement);
        
        // Also replace sound tags [sound:dog.mp3] -> <audio src="file:///.../dog.mp3" controls></audio>
        const soundRegex = new RegExp(`\\[sound:${escapedFilename}\\]`, 'g');
        const soundReplacement = `<audio src="${fileUri}" controls></audio>`;
        questionHtml = questionHtml.replace(soundRegex, soundReplacement);
        answerHtml = answerHtml.replace(soundRegex, soundReplacement);
      }

      // Create ts-fsrs card
      const fsrsCard = createInitialCard();
      const dbCardProps = convertFSRSCardToDB(fsrsCard);

      const cardId = generateId();
      await executeSql(`
        INSERT INTO cards (
          id, deck_id, question, answer, due, stability, difficulty, 
          elapsed_days, scheduled_days, reps, lapses, state, last_review
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        cardId, newDeckId, questionHtml, answerHtml,
        dbCardProps.due, dbCardProps.stability, dbCardProps.difficulty,
        dbCardProps.elapsed_days, dbCardProps.scheduled_days, dbCardProps.reps, dbCardProps.lapses, dbCardProps.state, dbCardProps.last_review
      ]);

      importedCount++;
    }

    // Update deck card count
    await executeSql(`UPDATE decks SET cards = ? WHERE id = ?`, [importedCount, newDeckId]);

    // Cleanup: close temp db and delete file
    await FileSystem.deleteAsync(tempDbUri, { idempotent: true });

    console.log(`Successfully imported ${importedCount} cards.`);
    return { success: true, count: importedCount, deckId: newDeckId };

  } catch (error: any) {
    console.error('Import failed:', error);
    return { success: false, message: error.message };
  }
};
