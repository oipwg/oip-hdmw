import { Insight } from 'insight-explorer'
import { varIntBuffer } from '../util'
import config from "./config";

var floFeePerKb = 100000

module.exports = {
	name: 'flo_testnet',
	displayName: 'Flo Testnet',
	ticker: 'tFLO',
	satPerCoin: 1e8,
	feePerKb: floFeePerKb,
	feePerByte: floFeePerKb / 1024,
	maxFeePerByte: 100,
	minFee: floFeePerKb,
	dust: 100000,

	txVersion: 2,

	explorer: new Insight(config.defaultApiUrls.flo_testnet),

	getExtraBytes: function(options){
		var fData = options.floData || ""

		var string_buffer = Buffer.from(fData, 'utf8')
		var length_buffer = varIntBuffer(string_buffer.length)

		var built_string = length_buffer.toString("hex") + string_buffer.toString("hex")

		return built_string
	},

	network: {
		bip32: {
			public: 0x013440e2,
			private: 0x01343c23
		},
		slip44: 1,
		messagePrefix: '\u001bFlorincoin Signed Message:\n',
		pubKeyHash: 115,
		scriptHash: 58,
		wif: 239
	}
}