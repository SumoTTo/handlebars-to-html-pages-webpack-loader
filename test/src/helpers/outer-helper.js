const Handlebars = require( 'handlebars' );

module.exports = function( text1, text2 ) {
	return new Handlebars.SafeString( text1 + ' ' + text2 );
};
