import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

let plugins = [
  babel(babelrc()),
];

export default {
  input: 'src/index.js',
  plugins: plugins,
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  external: ['lodash', 'get-parameter-names']
};