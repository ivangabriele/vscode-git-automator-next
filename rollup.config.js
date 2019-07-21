import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/extension.ts',

  output: {
    file: './out/extension.js',
    format: 'cjs',
  },

  external: ['buffer', 'child_process', 'fs', 'os', 'tty', 'util', 'vscode'],

  plugins: [
    resolve(),
    typescript({
      clean: true,
      rollupCommonJSResolveHack: true,
    }),
    commonjs(),
  ],
};
