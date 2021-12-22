// noinspection JSUnusedLocalSymbols

const Emitter = require( 'events' );
const Handlebars = require( 'handlebars' );
const cache = require( './cache' );
const HandlebarsHtmlPagesWebpackLoaderNotFoundError = require( './not-found-error' );
const HandlebarsHtmlPagesWebpackLoaderOptions = require( './options' );
const frontMatter = require( 'front-matter' );
const { readFileSync, lstatSync } = require( 'fs' );
const { sync } = require( 'glob' );
const path = require( 'path' );
const yaml = require( 'js-yaml' );

let collectingFiles;

const collectingEmitter = new Emitter();

collectingEmitter.setMaxListeners( 0 );

function stripBom( string ) {
	// noinspection JSUnresolvedFunction
	if ( string.charCodeAt( 0 ) === 0xFEFF ) {
		return string.slice( 1 );
	}

	return string;
}

async function collectingFilesFromFolders( ext, rootPath, type, options ) {
	const folderPaths = options[ type + 'Paths' ];

	cache.deletingDeletedFiles( type );
	for ( const folderPath of folderPaths ) {
		collectingFilesFromFolder( ext, rootPath, folderPath, type );
	}
}

function collectingFilesFromFolder( ext, rootPath, folderPath, type ) {
	if ( ! path.isAbsolute( folderPath ) ) {
		folderPath = path.join( rootPath, folderPath );
	}

	sync( path.join( folderPath, '/**/*.' + ext ) ).forEach( function( filePath ) {
		collectingFile( ext, rootPath, folderPath, filePath, type );
	} );
}

function collectingFile( ext, rootPath, folderPath, filePath, type ) {
	const stat = lstatSync( filePath );
	const key = getKey( ext, folderPath, filePath );
	if ( typeof collectingFiles[ type ][ key ] === 'undefined' ) {
		let fileData = cache.getFileData( type, key, filePath, stat.mtime.getTime() );

		if ( null === fileData ) {
			const fileContent = stripBom( ( readFileSync( filePath ) ).toString() );

			if ( 'partials' === type && Handlebars.partials[ key ] ) {
				Handlebars.unregisterPartial( key );
			} else if ( 'helpers' === type && Handlebars.helpers[ key ] ) {
				Handlebars.unregisterHelper( key );
			}

			fileData = {
				path: filePath,
				template: fileContent,
				time: stat.mtime.getTime(),
			};

			collectingFiles[ type ][ key ] = fileData;
			cache.files[ type ][ key ] = fileData;
		} else {
			collectingFiles[ type ][ key ] = fileData;
		}
	}
}

function getKey( ext, folderPath, filePath ) {
	const possibleFolder = path.normalize( folderPath.replace( /(\/\*\*)?\/\*\..*$/, '' ) );
	const isBlock = 'blocks' === path.basename( path.dirname( path.dirname( filePath ) ) );

	let key = path.normalize( filePath.replace( new RegExp( `([\/]index)?\.${ ext }$` ), '' ) );

	if ( filePath.indexOf( possibleFolder ) ) {
		key = path.relative( possibleFolder, key );
		if ( isBlock ) {
			key = 'block/' + path.basename( key );
		}
	} else {
		key = path.basename( key );
	}

	return key.toLowerCase().replace( /[^a-zA-Z0-9]+(.)/g, ( m, chr ) => chr.toUpperCase() );
}

function collectingPageContextAndRegisterBodyPartial( content, options, loaderContext ) {
	const pageData = frontMatter( stripBom( content ) );

	if ( Handlebars.partials.body ) {
		Handlebars.unregisterPartial( 'body' );
	}

	Handlebars.registerPartial( 'body', pageData.body );

	const ext = path.extname( loaderContext.resourcePath );
	let pageName = path.basename( loaderContext.resourcePath, ext );
	for ( const pagesFolderPath of options.pagesFolderPaths ) {
		if ( loaderContext.resourcePath.startsWith( pagesFolderPath ) ) {
			pageName = path
				.relative( pagesFolderPath, loaderContext.resourcePath )
				.replace( /\\/g, '/' )
				.replace( new RegExp( ext + '$' ), '' );
			break;
		}
	}

	let rootContext = {};
	const contextsData = options.defaultContext;
	if ( collectingFiles.contexts ) {
		for ( const contextName in collectingFiles.contexts ) {
			if ( collectingFiles.contexts.hasOwnProperty( contextName ) ) {
				const contextData = yaml.load( collectingFiles.contexts[ contextName ].template );
				contextsData[ contextName ] = contextData;
				if ( 'root' === contextName ) {
					rootContext = contextData;
				}
			}
		}
	}

	if ( typeof pageData.attributes.pageTitle === 'undefined' ) {
		const pageTitle = path.basename( pageName );

		pageData.attributes.pageTitle =
			pageTitle[ 0 ].toUpperCase() +
			pageTitle
				.slice( 1 )
				.toLowerCase()
				.replace( /[^a-zA-Z0-9]+(.)/g, ( m, chr ) => chr.toUpperCase() );
	}

	return Object.assign(
		{
			pageName,
		},
		contextsData,
		rootContext,
		pageData.attributes
	);
}

function selectTemplate( context, options ) {
	if ( ! context.layout ) {
		context.layout = 'default';
	}

	if ( ! collectingFiles.layouts.default ) {
		collectingFiles.layouts.default = {
			path: '',
			template:
				'<!doctype html>\n' +
				'<html lang="en">\n' +
				'<head>\n' +
				'\t<meta charset="UTF-8">\n' +
				'\t<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
				'\t<title>{{pageTitle}}</title>\n' +
				'</head>\n' +
				'<body>\n{{>body}}</body>\n' +
				'</html>',
		};
	}

	if ( ! collectingFiles.layouts[ context.layout ] ) {
		throw new HandlebarsHtmlPagesWebpackLoaderNotFoundError( 'Layout', context.layout, options.layoutsPaths );
	}

	return collectingFiles.layouts[ context.layout ].template;
}

async function registerPartials() {
	if ( collectingFiles.partials ) {
		for ( const partialName in collectingFiles.partials ) {
			if ( collectingFiles.partials.hasOwnProperty( partialName ) ) {
				if ( typeof Handlebars.partials[ partialName ] !== 'undefined' ) {
					Handlebars.unregisterPartial( partialName );
				}

				Handlebars.registerPartial( partialName, collectingFiles.partials[ partialName ].template );
			}
		}
	}
}

async function registerHelpers() {
	if ( collectingFiles.helpers ) {
		for ( const helperName in collectingFiles.helpers ) {
			if ( collectingFiles.helpers.hasOwnProperty( helperName ) && ! Handlebars.helpers[ helperName ] ) {
				if ( typeof Handlebars.helpers[ helperName ] !== 'undefined' ) {
					Handlebars.unregisterHelper( helperName );
				}

				Handlebars.registerHelper( helperName, require( collectingFiles.helpers[ helperName ].path ) );
			}
		}
	}
}

function registerDefaultHelpers( pageName ) {
	for ( const helperName of [ 'ifPage', 'unlessPage' ] ) {
		if ( typeof Handlebars.helpers[ helperName ] !== 'undefined' ) {
			Handlebars.unregisterHelper( helperName );
		}

		if ( collectingFiles.helpers[ helperName ] ) {
			Handlebars.registerHelper( helperName, require( collectingFiles.helpers[ helperName ] )( pageName ) );
		} else {
			Handlebars.registerHelper( helperName, require( './helpers/' + helperName )( pageName ) );
		}
	}

	for ( const helperName of [ 'ifEqual', 'repeat' ] ) {
		Handlebars.registerHelper( helperName, require( './helpers/' + helperName ) );
	}
}

function addDependencies( loaderContext, options ) {
	for ( const type in collectingFiles ) {
		const paths = collectingFiles[ type ];
		if ( paths ) {
			for ( const pathKey in paths ) {
				if ( paths.hasOwnProperty( pathKey ) ) {
					loaderContext.addDependency( path.normalize( path.resolve( paths[ pathKey ].path ) ) );
				}
			}
		}
	}

	for ( const option in options ) {
		if ( option.endsWith( 'Paths' ) ) {
			for ( const folderPath of options[ option ] ) {
				// noinspection JSUnresolvedFunction
				loaderContext.addContextDependency( path.normalize( folderPath ) );
			}
		}
	}
}

let debugShowed = false;

/**
 * Webpack loader for assembling HTML pages from Handlebars templates.
 *
 * @param {string|Buffer}                           content            - Content of the resource file
 * @param {HandlebarsHtmlPagesWebpackLoaderOptions} options
 * @param {loaderContext}                           loaderContext
 * @param {Object}                                  [loaderSourceMaps] SourceMap data consumable by https://github.com/mozilla/source-map
 *
 * @return {Promise<{content: string, loaderSourceMaps: Object}>} Возвращает объект который содержит
 */
module.exports = async function handlebarsHtmlPagesWebpackLoaderCompile( content, options, loaderContext, loaderSourceMaps ) {
	const root = options.root ? options.root : loaderContext.rootContext;

	if ( ! cache.isProgress() ) {
		cache.startCollecting();

		collectingFiles = {
			layouts: {},
			partials: {},
			helpers: {},
			contexts: {},
		};

		await Promise.all( [
			collectingFilesFromFolders( 'hbs', root, 'layouts', options ),
			collectingFilesFromFolders( 'hbs', root, 'partials', options ),
			collectingFilesFromFolders( 'js', root, 'helpers', options ),
			collectingFilesFromFolders( 'yaml', root, 'contexts', options ),
		] );

		await Promise.all( [
			registerPartials(),
			registerHelpers(),
		] );

		collectingEmitter.emit( 'handlebars:load' );

		cache.endCollecting();
	} else {
		await new Promise( function( resolve ) {
			collectingEmitter.on( 'handlebars:load', resolve );
		} );
	}

	const context = collectingPageContextAndRegisterBodyPartial( content, options, loaderContext );
	const template = selectTemplate( context, options );

	registerDefaultHelpers( context.pageName );
	addDependencies( loaderContext, options );

	if ( options.debug && ! debugShowed ) {
		if ( 'keys' === options.debug ) {
			// eslint-disable-next-line no-console
			console.info( 'helpers', Object.keys( Handlebars.helpers ) );
			// eslint-disable-next-line no-console
			console.info( 'partials', Object.keys( Handlebars.partials ) );
			// eslint-disable-next-line no-console
			console.info( 'context', Object.keys( context ) );
		} else {
			// eslint-disable-next-line no-console
			console.info( 'helpers', Handlebars.helpers );
			// eslint-disable-next-line no-console
			console.info( 'partials', Handlebars.partials );
			// eslint-disable-next-line no-console
			console.info( 'context', context );
		}
		debugShowed = true;
	}

	if ( loaderContext.sourceMap ) {
		// todo: it seems there is no point in this, perhaps it is worth somehow changing the logic
		const srcName = path.relative( root, loaderContext.resourcePath );
		const templateSpecification = Handlebars.precompile( template, { srcName } );

		// noinspection JSUnresolvedVariable
		const preCompilation = new Function( 'return ' + templateSpecification.code );

		content = Handlebars.template( preCompilation() )( context );

		// noinspection JSUnresolvedVariable
		loaderSourceMaps = JSON.parse( templateSpecification.map );
	} else {
		content = Handlebars.compile( template )( context );
	}

	return {
		content,
		loaderSourceMaps,
	};
};
