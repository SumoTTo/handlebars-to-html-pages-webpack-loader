const { existsSync, readFileSync, rmdirSync } = require( 'fs' );
const { join, relative } = require( 'path' );
const webpack = require( 'webpack' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const MultipleHtmlPagesPlugin = require( '@sumotto/multiple-html-pages-webpack-plugin' );
const dist = join( __dirname, 'dist' );
const src = join( __dirname, 'src' );
const pages = join( src, 'pages' );

let webpackConfigErrors, webpackStats, consoleInfoMock, consoleWarnMock, consoleErrorMock;

function runWebpack( entry, webpackConfig ) {
	Object.assign(
		webpackConfig,
		{
			entry: join( src, entry + '.js' ),
			output: {
				path: join( dist, entry ),
			},
			mode: 'none',
			cache: false,
			resolve: {
				roots: [ src ],
			},
		}
	);

	return new Promise( function( resolve ) {
		webpack( webpackConfig, function( err, stats ) {
			webpackConfigErrors = err;
			webpackStats = stats;

			resolve();
		} );
	} );
}

function consoleWebpackErrors() {
	/* eslint-disable no-console */
	if ( webpackConfigErrors ) {
		console.error( 'webpackConfigErrors', webpackConfigErrors );
	}
	if ( webpackStats.hasErrors() ) {
		// noinspection JSUnresolvedFunction
		console.error( 'webpackStats', webpackStats.toJson( 'errors-warnings' ) );
	}
	/* eslint-enable no-console */
}

function getConfig( entry ) {
	const webpackConfig = {
		module: {
			rules: [
				{
					test: /\.hbs$/,
					exclude: /node_modules/,
					use: [
						{
							loader: join( __dirname, '../src' ),
							options: {
								layoutsPaths: join( src, 'layouts' ),
								partialsPaths: [ join( src, 'blocks' ), join( src, 'partials' ) ],
								helpersPaths: join( src, 'helpers' ),
								contextsPaths: join( src, 'contexts' ),
								pagesFolderPaths: pages,
							},
						},
					],
				},
			],
		},
	};

	if ( 'plugin' === entry ) {
		// noinspection JSCheckFunctionSignatures
		webpackConfig.module.rules[ 0 ].use.unshift(
			{
				loader: 'html-loader',
				options: {
					sources: false,
					minimize: false,
				},
			},
		);
		webpackConfig.plugins = [
			new MultipleHtmlPagesPlugin(
				{
					pathsInfo: [
						{
							root: pages,
							glob: '**/[0-9][0-9]-*.hbs',
						},
					],
					htmlWebpackPluginOptions: { minify: false, cache: false },
					HtmlWebpackPlugin,
				},
			),
		];
	} else {
		// noinspection JSCheckFunctionSignatures
		webpackConfig.module.rules.unshift(
			{
				test: /\.hbs$/,
				type: 'asset/resource',
				generator: {
					filename: ( pathData ) => {
						return relative( pages, pathData.filename ).replace( /\.hbs$/, '.html' );
					},
				},
			}
		);
	}

	return webpackConfig;
}

const cases = [
	[ 'Loader', 'loader' ],
	[ 'Html Webpack Plugin', 'plugin' ],
];

const tests = [
	[ 'Introduction: Simple Expression', '01-introduction/01-simple-expressions.html' ],
	[ 'Introduction: Nested input objects', '01-introduction/02-nested-input-objects.html' ],
	[ 'Introduction: Evaluation context', '01-introduction/03-evaluation-context.html' ],
	[ 'Introduction: Template comments', '01-introduction/04-template-comments.html' ],
	[ 'Introduction: Custom Helpers', '01-introduction/05-custom-helpers.html' ],
	[ 'Introduction: Block Helpers', '01-introduction/06-block-helpers.html' ],
	[ 'Introduction: HTML Escaping', '01-introduction/07-html-escaping.html' ],
	[ 'Introduction: Partials', '01-introduction/08-partials.html' ],
	[ 'Expressions: Basic Usage', '02-expressions/01-basic-usage.html' ],
	[ 'Expressions: Path expressions', '02-expressions/02-path-expressions.html' ],
	[ 'Expressions: Changing the context', '02-expressions/03-changing-the-context.html' ],
	[ 'Expressions: Literal segments', '02-expressions/04-literal-segments.html' ],
	[ 'Expressions: HTML-escaping', '02-expressions/05-html-escaping.html' ],
	[ 'Expressions: Helpers', '02-expressions/06-helpers.html' ],
	[
		'Expressions: Prevent HTML-escaping of helper return values',
		'02-expressions/07-prevent-html-escaping-of-helper-return-values.html',
	],
	[ 'Expressions: Helpers with Multiple Parameters', '02-expressions/08-helpers-with-multiple-parameters.html' ],
	[ 'Expressions: Literal arguments', '02-expressions/09-literal-arguments.html' ],
	[ 'Expressions: Helpers with Hash arguments', '02-expressions/10-helpers-with-hash-arguments.html' ],
	[
		'Expressions: Disambiguating helpers calls and property lookup',
		'02-expressions/11-disambiguating-helpers-calls-and-property-lookup.html',
	],
	[ 'Expressions: Subexpressions', '02-expressions/12-subexpressions.html' ],
	[ 'Expressions: Whitespace Control', '02-expressions/13-whitespace-control.html' ],
	[ 'Expressions: Escaping Handlebars expressions', '02-expressions/14-escaping-handlebars-expressions.html' ],
	[ 'Partials: Basic Partials', '03-partials/01-basic-partials.html' ],
	[ 'Partials: Dynamic Partials', '03-partials/02-dynamic-partials.html' ],
	[ 'Partials: Partial Contexts', '03-partials/03-partial-contexts.html' ],
	[ 'Partials: Partial Parameters', '03-partials/04-partial-parameters.html' ],
	[ 'Partials: Partial Blocks', '03-partials/05-partial-blocks.html' ],
	[ 'Partials: Inline Partials', '03-partials/06-inline-partials.html' ],
	[ 'Block Helpers: Basic Blocks', '04-block-helpers/01-basic-blocks.html' ],
	[ 'Block Helpers: Basic Block Variation', '04-block-helpers/02-basic-block-variation.html' ],
	[ 'Block Helpers: The with helper', '04-block-helpers/03-the-with-helper.html' ],
	[ 'Block Helpers: Simple Iterators', '04-block-helpers/04-simple-iterators.html' ],
	[ 'Block Helpers: Conditionals', '04-block-helpers/05-conditionals.html' ],
	[ 'Block Helpers: Hash Arguments', '04-block-helpers/06-hash-arguments.html' ],
	[ 'Block Helpers: Block Parameters', '04-block-helpers/07-block-parameters.html' ],
	[ 'Block Helpers: Raw Blocks', '04-block-helpers/08-raw-blocks.html' ],
	[ 'Built-in Helpers: if', '05-builtin-helpers/01-if.html' ],
	[ 'Built-in Helpers: unless', '05-builtin-helpers/02-unless.html' ],
	[ 'Built-in Helpers: each', '05-builtin-helpers/03-each.html' ],
	[ 'Built-in Helpers: with', '05-builtin-helpers/04-with.html' ],
	[ 'Built-in Helpers: lookup', '05-builtin-helpers/05-lookup.html' ],
];

describe.each( cases )( '%s', function( caseName, entry ) {
	beforeAll( () => {
		consoleInfoMock = jest.spyOn( global.console, 'info' ).mockImplementation();
		consoleWarnMock = jest.spyOn( global.console, 'warn' ).mockImplementation();
		consoleErrorMock = jest.spyOn( global.console, 'error' ).mockImplementation();

		return runWebpack( entry, getConfig( entry ) );
	} );

	test( 'Check fatal webpack errors (wrong configuration, etc)', function() {
		expect( webpackConfigErrors ).toBeNull();
	} );

	test( 'Check compilation errors (missing modules, syntax errors, etc)', function() {
		expect( webpackStats.hasErrors() ).toBeFalsy();
	} );

	test.each( tests )( 'Check %s', ( testName, file ) => {
		file = join( dist, entry, file );
		expect( existsSync( file ) ).toBeTruthy();
		expect( readFileSync( file ).toString() ).toMatchSnapshot();
	} );

	test( 'Check Built-in Helpers: log', function() {
		expect( consoleInfoMock ).toHaveBeenCalledTimes( 4 );
		expect( consoleWarnMock ).toHaveBeenCalledTimes( 1 );
		expect( consoleErrorMock ).toHaveBeenCalledTimes( 1 );

		expect( consoleInfoMock.mock.calls ).toEqual( [
			[ 'this is a simple log output' ],
			[ 'firstname', 'Yehuda', 'lastname', 'Katz' ],
			[ 'info logging' ],
			[ 'info logging is the default' ],
		] );
		expect( consoleWarnMock.mock.calls ).toEqual( [ [ 'logging a warning' ] ] );
		expect( consoleErrorMock.mock.calls ).toEqual( [ [ 'logging an error' ] ] );
	} );

	afterAll( function() {
		consoleInfoMock.mockRestore();
		consoleWarnMock.mockRestore();
		consoleErrorMock.mockRestore();

		consoleWebpackErrors();

		if ( existsSync( dist ) ) {
			rmdirSync( dist, { recursive: true } );
		}
	} );
} );

const readmeExamplesCases = [
	[
		'Simple loader',
		{
			module: {
				rules: [
					{
						test: /\.hbs$/,
						use: [
							'html-loader',
							{
								loader: join( __dirname, '../src' ),
								options: {
									layoutsPaths: join( src, 'layouts' ),
									partialsPaths: [ join( src, 'partials' ), join( src, 'blocks' ) ],
									helpersPaths: join( src, 'helpers' ),
									contextsPaths: join( src, 'contexts' ),
									pagesFolderPaths: join( src, 'pages' ),
									root: src,
									defaultContext: {
										key: 'value',
									},
									debug: true,
								},
							},
						],
					},
				],
			},
		},
		1,
	],
	[
		'With Assets Resources',
		{
			module: {
				rules: [
					{
						test: /\.hbs$/,
						type: 'asset/resource',
						generator: {
							filename: ( pathData ) => {
								return relative( pages, pathData.filename ).replace( /\.hbs$/, '.html' );
							},
						},
					},
					{
						test: /\.hbs$/,
						use: [
							join( __dirname, '../src' ),
						],
					},
				],
			},
		},
		2,
	],
	[
		'With HTML Webpack plugin',
		{
			module: {
				rules: [
					{
						test: /\.hbs$/,
						use: [
							'html-loader',
							join( __dirname, '../src' ),
						],
					},
				],
			},
			plugins: [
				new HtmlWebpackPlugin( {
					filename: 'index.html',
					template: join( src, 'pages', 'index.hbs' ),
				} ),
				new HtmlWebpackPlugin( {
					filename: 'sub-page/some-page.html',
					template: join( src, 'pages', 'sub-page/some-page.hbs' ),
				} ),
			],
		},
		3,
	],
];

describe.each( readmeExamplesCases )( '%s', function( caseName, webpackConfig, index ) {
	beforeAll( () => {
		consoleInfoMock = jest.spyOn( global.console, 'info' ).mockImplementation();
		consoleWarnMock = jest.spyOn( global.console, 'warn' ).mockImplementation();
		consoleErrorMock = jest.spyOn( global.console, 'error' ).mockImplementation();

		return runWebpack( 'readme-' + index, webpackConfig );
	} );

	test( 'Check fatal webpack errors (wrong configuration, etc)', function() {
		expect( webpackConfigErrors ).toBeNull();
	} );

	test( 'Check compilation errors (missing modules, syntax errors, etc)', function() {
		expect( webpackStats.hasErrors() ).toBeFalsy();
	} );

	let readmeExamplesTests;
	if ( 1 === index ) {
		readmeExamplesTests = [
			[ 'Main JS', 'main.js' ],
		];
	} else if ( 2 === index ) {
		readmeExamplesTests = [
			[ 'Index', 'index.html' ],
			[ 'Sub Page', 'sub-page/some-page.html' ],
		];
	} else {
		readmeExamplesTests = [
			[ 'Index', 'index.html' ],
			[ 'Sub Page', 'sub-page/some-page.html' ],
		];
	}

	test.each( readmeExamplesTests )( 'Check %s', ( testName, file ) => {
		file = join( dist, 'readme-' + index, file );
		expect( existsSync( file ) ).toBeTruthy();
		expect( readFileSync( file ).toString() ).toMatchSnapshot();
	} );

	afterAll( function() {
		consoleInfoMock.mockRestore();
		consoleWarnMock.mockRestore();
		consoleErrorMock.mockRestore();

		consoleWebpackErrors();

		if ( existsSync( dist ) ) {
			rmdirSync( dist, { recursive: true } );
		}
	} );
} );
