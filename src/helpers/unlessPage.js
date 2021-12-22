/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {import('handlebars')} Handlebars
 */

/**
 * Generates a Handlebars block helper called #unlessPage for use in templates. This helper must be re-generated for
 * every page that's rendered, because the return value of the function is dependent on the name of the current page.
 *
 * @param {string} pageName - Name of the page to use in the helper function.
 *
 * @return {Function} A Handlebars helper function.
 */
module.exports = function( pageName ) {
	/**
	 * Handlebars block helper that renders the content inside of it based on the current page.
	 *
	 * @example
	 * {{#unlessPage 'index', 'about'}}This must NOT be the index or about page.{{/unlessPage}}
	 *
	 * @param {...string|Handlebars.HelperOptions} pages - One or more pages to check and last argument contains Handlebars helper options object.
	 *
	 * @return {string} The content inside the helper if no page matches, or an empty string if a page does match.
	 */
	return function( ...pages ) {
		/** @member {Handlebars.HelperOptions} */
		const options = pages[ pages.length - 1 ];

		pages = pages.slice( 0, -1 );

		let isPage = false;
		for ( const i in pages ) {
			if ( pages[ i ] === pageName ) {
				isPage = true;
				break;
			}
		}

		if ( isPage ) {
			return options.inverse( this );
		}

		return options.fn( this );
	};
};
