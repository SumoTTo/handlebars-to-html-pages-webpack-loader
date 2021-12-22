/**
 * @typedef {Object} loaderContext - The Loader Context https://webpack.js.org/api/loaders/#the-loader-context
 * @property {string}   loaderName    - The Loader name.
 * @property {string}   context       - The directory of the module. Can be used as a context for resolving other stuff.
 * @property {string}   rootContext   - The formerly this.options.context is provided as this.rootContext.
 * @property {string}   resourcePath  - The resource file.
 * @property {Function} getOptions    - Extracts given loader options. Optionally, accepts JSON schema as an argument.
 * @property {Function} async         - Tells the loader-runner that the loader intends to call back asynchronously.
 * @property {boolean}  sourceMap     - Tells if source map should be generated.
 * @property {Function} addDependency - Add a file as dependency of the loader result in order to make them watchable.
 */
