const { lstatSync } = require( 'fs' );

class Cache {
	constructor() {
		this.status = '';
		this.files = {
			layouts: {},
			partials: {},
			helpers: {},
			contexts: {},
		};
	}

	getFileData( type, key, time ) {
		if ( typeof this.files[ type ][ key ] === 'undefined' ) {
			return null;
		}

		const fileData = this.files[ type ][ key ];
		if ( time !== fileData.time ) {
			return null;
		}

		return fileData;
	}

	startCollecting() {
		this.status = 'progress';
	}

	endCollecting() {
		this.status = '';
	}

	isProgress() {
		return this.status === 'progress';
	}

	deletingDeletedFiles( type ) {
		for ( const fileKey in this.files[ type ] ) {
			const fileData = this.files[ type ][ fileKey ];
			try {
				lstatSync( fileData.path );
			} catch ( e ) {
				delete this.files[ type ][ fileKey ];
			}
		}
	}
}

module.exports = new Cache();
