const Handlebars = require( 'handlebars' );

module.exports = function( context, options ) {
	let out = '<ul>',
		data;

	if ( options.data ) {
		data = Handlebars.createFrame( options.data );
	}

	for ( let i = 0; i < context.length; i++ ) {
		if ( data ) {
			data.index = i;
		}

		out += '<li>' + options.fn( context[ i ], { data } ) + '</li>';
	}

	out += '</ul>';
	return out;
};
