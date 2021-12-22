/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {import('handlebars')} Handlebars
 */

/**
 * Handlebars block helper that checks if two values are equal.
 *
 * @example
 * {{#ifEqual name 'Name'}}This will be displayed if the name context contains the string 'Name'{{/ifEqual}}
 *
 * @param {any}                      a       - First value to compare.
 * @param {any}                      b       - Second value to compare.
 * @param {Handlebars.HelperOptions} options - Handlebars helper options object.
 *
 * @return {string} If the values are equal, content inside of the helper. If not, the content inside the `{{else}}` block.
 */
module.exports = function( a, b, options ) {
	if ( a === b ) {
		return options.fn( this );
	}

	return options.inverse( this );
};
