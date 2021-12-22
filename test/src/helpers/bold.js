const Handlebars = require( 'handlebars' );

module.exports = function( text ) {
	const result = '<b>' + Handlebars.escapeExpression( text ) + '</b>';
	return new Handlebars.SafeString( result );
};
