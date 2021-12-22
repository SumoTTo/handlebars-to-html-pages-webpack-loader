/**
 * The class of error thrown if the required file is not found.
 */
class HandlebarsHtmlPagesWebpackLoaderNotFoundError extends Error {
	constructor( type, entry, patterns ) {
		const list = patterns.join( '\n - ' );
		const message = `${ type } "${ entry }" was not found for the following glob patterns:\n - ${ list }\n`;

		super( message );
		this.name = this.constructor.name;
	}
}

module.exports = HandlebarsHtmlPagesWebpackLoaderNotFoundError;
