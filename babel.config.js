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
            'proicons:search',
            'mynaui:chevron-down',
            'mynaui:chevron-left',
            'material-symbols-light:arrow-outward',
            'material-symbols-light:home-rounded',
            'iconoir:plus',
            'material-symbols-light:settings-outline-rounded',
            'ant-design:more-outlined',
            'fluent:dismiss-20-filled',
            'si:add-duotone',
            'si:bin-line',
            'iconamoon:edit-thin',
            'material-symbols-light:check-circle-outline',
            'material-symbols-light:edit-outline',
            'material-symbols-light:dashboard-2-edit-outline',
          ],
        },
      ],
    ],
  };
};
