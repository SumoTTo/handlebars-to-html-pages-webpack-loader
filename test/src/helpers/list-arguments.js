module.exports = function( context, options ) {
	const attrs = Object
		.keys( options.hash )
		.map( function( key ) {
			return key + '="' + options.hash[ key ] + '"';
		} )
		.join( ' ' );

	return (
		'<ul ' + attrs + '>' +
		context
			.map( function( item ) {
				return '<li>' + options.fn( item ) + '</li>';
			} )
			.join( '\n' ) +
		'</ul>'
	);
};
