module.exports = {
  root: true,
  ignorePatterns: ['ios/', 'android/', 'docs/', 'dist/'],
  extends: ['universe/native', 'plugin:prettier/recommended'],
  rules: {
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'import/order': 'off',
  },
};
