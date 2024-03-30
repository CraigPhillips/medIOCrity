module.exports = {
  // ignore undefined jest methods 'test', 'expect', etc.
  env: { 'jest/globals': true },
  extends: [
    'semistandard'
  ],
  plugins: ['jest']
};
