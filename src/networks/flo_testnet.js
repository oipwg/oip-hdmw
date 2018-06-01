import InsightExplorer from 'insight-explorer'

var floFeePerKb = 100000

exports = {
	name: 'flo_testnet',
	displayName: 'Flo Testnet',
	ticker: 'tFLO',
	satPerCoin: 1e8,
	floFeePerKb: floFeePerKb,
	feePerByte: floFeePerKb / 1024,
	maxFeePerByte: 100,
	minFee: floFeePerKb,
	dust: 100000,

	txVersion: 2,

	explorers: [
		new InsightExplorer('https://testnet.flocha.in')
	],

	network: {
		bip32: {
			public: 0x013440e2,
			private: 0x01343c23
		},
		messagePrefix: '\x1bFlorincoin Signed Message:\n',
		pubKeyHash: 115,
		scriptHash: 58,
		wif: 239
	}
}