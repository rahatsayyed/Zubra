// Returns a score > 0 if all query chars appear in order in target, else 0.
// Higher score = tighter match (fewer gaps between matched chars).
export function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  if (!q) return 1;
  let qi = 0;
  let score = 0;
  let consecutive = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      qi++;
      consecutive++;
      score += consecutive; // reward consecutive matches
    } else {
      consecutive = 0;
    }
  }
  return qi === q.length ? score : 0;
}
