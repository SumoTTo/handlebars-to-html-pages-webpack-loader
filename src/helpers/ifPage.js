/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {import('handlebars')} Handlebars
 */

const { basename } = require( 'path' );

/**
 * Generates a Handlebars block helper called #iFpage for use in templates. This helper must be re-generated for every
 * page that's rendered, because the return value of the function is dependent on the name of the current page.
 *
 * @param {string} pageName - Name of the page to use in the helper function.
 * @return {Function} A Handlebars helper function.
 */
module.exports = function( pageName ) {
	/**
	 * Handlebars block helper that renders the content inside of it based on the current page.
	 *
	 * @example
	 * {{#ifPage 'index' 'about'}}This must be the index or about page.{{/ifPage}}
	 *
	 * @param {...string|Handlebars.HelperOptions} pages - One or more pages to check and last argument contains Handlebars helper options object.
	 *
	 * @return {string} The content inside the helper if a page matches. If not, the content inside the `{{else}}` block.
	 */
	return function( ...pages ) {
		/** @member {Handlebars.HelperOptions} */
		const options = pages[ pages.length - 1 ];

		pages = pages.slice( 0, -1 );

		let isPage = false;
		for ( const i in pages ) {
			if ( pages[ i ] === pageName || pages[ i ] === basename( pageName, '.hbs' ) ) {
				isPage = true;
				break;
			}
		}

		if ( isPage ) {
			return options.fn( this );
		}

		return options.inverse( this );
	};
};
