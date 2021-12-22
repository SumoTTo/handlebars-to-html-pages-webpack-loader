const { minify } = require( 'terser' );
const { sync } = require( 'glob' );
const { dirname, relative, join, normalize } = require( 'path' );
const fs = require( 'fs' );

const options = {
	mangle: {
		properties: {
			regex: /^[#_]/,
			undeclared: true,
		},
	},
	module: true,
	nameCache: {},
};

const dist = './dist';

if ( ! fs.existsSync( dist ) ) {
	fs.mkdirSync( dist );
}

sync( './src/**/*.js' ).forEach( async function( path ) {
	const results = await minify( fs.readFileSync( path, 'utf8' ), options );
	if ( results.code ) {
		const file = relative( join( __dirname, 'src' ), path );
		const directory = join( dist, dirname( file ) );

		if ( directory && ! fs.existsSync( directory ) ) {
			fs.mkdirSync( directory );
		}

		fs.writeFileSync( join( dist, file ), results.code, 'utf8' );
	}
} );
