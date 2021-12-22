const Handlebars = require( 'handlebars' );

module.exports = function( text ) {
	return new Handlebars.SafeString( text );
};
