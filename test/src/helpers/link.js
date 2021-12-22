const Handlebars = require( 'handlebars' );

module.exports = function( text, url ) {
	const escapeUrl = Handlebars.escapeExpression( url );
	const escapeText = Handlebars.escapeExpression( text );

	return new Handlebars.SafeString( "<a href='" + escapeUrl + "'>" + escapeText + '</a>' );
};
