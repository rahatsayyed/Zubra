module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      [
        'react-native-iconify/babel',
        {
          icons: [
            'famicons:share-outline',
            'mage:bookmark',
            'mage:bookmark-fill',
            'solar:add-square-linear',
          ],
        },
      ],
    ],
  };
};
