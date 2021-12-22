module.exports = function( context, options ) {
	let ret = '<ul>';
	const j = context.length;
	for ( let i = 0; i < j; i++ ) {
		ret += '<li>' + options.fn( context[ i ] ) + '</li>';
	}

	return ret + '</ul>';
};
