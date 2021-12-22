const presets = [
	[
		'@babel/preset-env',
		{
			targets: {
				node: 'current',
			},
		},
	],
];

const plugins = [
	'@babel/plugin-proposal-class-properties',
	'@babel/plugin-proposal-private-methods',
];

module.exports = { presets, plugins };
