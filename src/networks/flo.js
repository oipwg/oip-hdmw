import { Insight } from 'insight-explorer'

var floFeePerKb = 100000

exports = {
	name: 'flo',
	displayName: 'Flo',
	ticker: 'FLO',
	satPerCoin: 1e8,
	floFeePerKb: floFeePerKb,
	feePerByte: floFeePerKb / 1024,
	maxFeePerByte: 100,
	minFee: floFeePerKb,
	dust: 100000,

	txVersion: 2,

	explorers: [
		new Insight('https://livenet.flocha.in')
	],

	network: {
		bip32: {
			public: 0x0134406b,
			private: 0x01343c31
		},
		messagePrefix: '\x1bFlorincoin Signed Message:\n',
		pubKeyHash: 35,
		scriptHash: 94,
		wif: 163
	}
}