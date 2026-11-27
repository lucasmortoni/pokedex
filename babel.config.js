module.exports = function (api) {
  const isTest = api.env('test');
  api.cache(() => (isTest ? 'test' : 'app'));

  return {
    presets: [
      isTest
        ? 'babel-preset-expo'
        : ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      ...(isTest ? [] : ['nativewind/babel']),
    ],
  };
};
