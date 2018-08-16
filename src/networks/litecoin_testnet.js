import { Insight } from 'insight-explorer'

var litecoinFeePerKb = 100000

module.exports = {
	name: 'litecoin_testnet',
	displayName: 'Litecoin Testnet',
	ticker: 'tLTC',
	satPerCoin: 1e8,
	feePerKb: litecoinFeePerKb,
	feePerByte: litecoinFeePerKb / 1024,
	maxFeePerByte: 100,
	minFee: litecoinFeePerKb,
	dust: 54600,

	txVersion: 1,

	explorer: new Insight('https://litesight.mk1.alexandria.io/api'),

	getExtraBytes: function(options){ return },

	network: {
		messagePrefix: "\u0018Litecoin Signed Message:\n",
		bip32: {
			public: 0x0436ef7d,
			private: 0x0436f6e1
		},
		slip44: 1,
		pubKeyHash: 0x6f,
		scriptHash: 0xc4,
		wif: 0xef,
		dustThreshold: 100000,
	}
}