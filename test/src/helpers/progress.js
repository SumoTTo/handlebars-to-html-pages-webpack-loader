module.exports = function( name, percent, stalled ) {
	const barWidth = percent / 5;
	const bar = '********************'.slice( 0, barWidth );
	return bar + ' ' + percent + '% ' + name + ' ' + ( stalled ? 'stalled' : '' );
};
