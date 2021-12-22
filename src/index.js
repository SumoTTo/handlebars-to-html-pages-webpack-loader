/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {import('types')} loaderContext
 */

const handlebarsHtmlPagesWebpackLoaderCompile = require( './compile' );
const HandlebarsHtmlPagesWebpackLoaderOptions = require( './options' );

/**
 *
 * @param {string} content            - Content of the resource file
 * @param {Object} [loaderSourceMaps] - SourceMap data consumable by https://github.com/mozilla/source-map
 * @param {any}    [loaderMeta]       - Meta data, could be anything
 *
 * @this {loaderContext} The Loader Context
 */
module.exports = function( content, loaderSourceMaps, loaderMeta ) {
	const options = new HandlebarsHtmlPagesWebpackLoaderOptions( this.getOptions(), this.loaderName );
	const loaderCallback = this.async();

	handlebarsHtmlPagesWebpackLoaderCompile( content, options, this, loaderSourceMaps )
		.then( function( result ) {
			loaderCallback( null, result.content, result.loaderSourceMaps, loaderMeta );
		} )
		.catch( function( error ) {
			loaderCallback( error );
		} );
};
