import { Insight } from 'insight-explorer'
import { networks } from 'bitcoinjs-lib'
import bip44constants from 'bip44-constants'

var bitcoinFeePerKb = 100000

var n = networks.bitcoin;

n.slip44 = bip44constants.BTC;

module.exports = {
	name: 'bitcoin',
	displayName: 'Bitcoin',
	ticker: 'BTC',
	satPerCoin: 1e8,
	feePerKb: bitcoinFeePerKb,
	feePerByte: bitcoinFeePerKb / 1024,
	maxFeePerByte: 100,
	minFee: bitcoinFeePerKb,
	dust: 546,

	txVersion: 1,

	explorer: new Insight('https://localbitcoinschain.com/api'),

	getExtraBytes: function(options){ return },

	network: n
}