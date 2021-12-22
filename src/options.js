const { validate, ValidationError } = require( 'schema-utils' );

/**
 * Class for working with bootloader options.
 * Receives an object of options passed by the loader as an input and checks them against the scheme.
 * If the check is successful, it additionally formats the options.
 * If the check fails, an error will be thrown.
 */
class HandlebarsHtmlPagesWebpackLoaderOptions {
	layoutsPaths = [ 'layouts' ];
	partialsPaths = [ 'partials' ];
	helpersPaths = [ 'helpers' ];
	contextsPaths = [ 'contexts' ];
	pagesFolderPaths = [ 'pages' ];
	root = '';
	defaultContext = {};
	debug = false;

	#scheme = {
		type: 'object',
		properties: {
			pagesFolderPaths: {
				description: 'Paths to a folder of the containing pages files. They will only be used to correctly identify the page name.',
				anyOf: [ { type: 'string' }, { type: 'array' } ],
			},
			layoutsPaths: {
				description: 'Paths to a folders containing layouts files.',
				anyOf: [ { type: 'string' }, { type: 'array' } ],
			},
			partialsPaths: {
				description: 'Paths to a folder of the containing partials files.',
				anyOf: [ { type: 'string' }, { type: 'array' } ],
			},
			helpersPaths: {
				description: 'Paths to a folder of the containing helpers files.',
				anyOf: [ { type: 'string' }, { type: 'array' } ],
			},
			contextsPaths: {
				description: 'Paths to a folder of the containing context files.',
				anyOf: [ { type: 'string' }, { type: 'array' } ],
			},
			root: {
				description: 'Path for relative path resolution, by default it takes rootContext from webpack.',
				type: 'string',
			},
			defaultContext: {
				description: 'Default Context',
				type: 'object',
			},
			debug: {
				description: 'Outputs to the console information about all registered helpers, parts and contexts',
				anyOf: [ { type: 'string' }, { type: 'boolean' } ],
			},
		},
		additionalProperties: false,
	};

	/**
	 * Performs validation and results in the desired format.
	 *
	 * @throws {ValidationError} Will throw an error if options do not check the schema.
	 *
	 * @param {Object} loaderOptions - An array of options, will be checked against the scheme.
	 * @param {string} loaderName    - Loader name, will be displayed in error.
	 */
	constructor( loaderOptions, loaderName ) {
		this.#validateOptions( loaderOptions, loaderName );
		this.#setOptions( loaderOptions );
	}

	/**
	 * Performs a check.
	 *
	 * @throws {ValidationError} Will throw an error if options do not check the schema.
	 *
	 * @param {Object} loaderOptions - An object of options, will be checked against the scheme.
	 * @param {string} loaderName    - Loader name, will be displayed in error.
	 */
	#validateOptions( loaderOptions, loaderName ) {
		validate( this.#scheme, loaderOptions, { name: loaderName } );
	}

	/**
	 * Sets options in the desired format.
	 *
	 * @param {Object} loaderOptions - An object of loader options.
	 */
	#setOptions( loaderOptions ) {
		const toArrayOptions = [
			'layoutsPaths',
			'partialsPaths',
			'helpersPaths',
			'contextsPaths',
			'pagesFolderPaths',
		];

		for ( const optionKey in loaderOptions ) {
			if ( loaderOptions.hasOwnProperty( optionKey ) && this.hasOwnProperty( optionKey ) ) {
				const option = loaderOptions[ optionKey ];

				if ( toArrayOptions.indexOf( optionKey ) !== -1 ) {
					this[ optionKey ] = typeof option === 'string' ? Array( option ) : option;
				} else {
					this[ optionKey ] = option;
				}
			}
		}
	}
}

module.exports = HandlebarsHtmlPagesWebpackLoaderOptions;
