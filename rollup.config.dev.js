import prodConfig from './rollup.config';

export default {
  ...prodConfig,

  output: {
    file: './out/extension.js',
    format: 'cjs',
    sourcemap: true,
    sourcemapFile: './out/extension.map.js',
  },
};
