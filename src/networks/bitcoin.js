import { Insight } from 'insight-explorer'
import { networks } from 'bitcoinjs-lib'

var bitcoinFeePerKb = 100000

exports = {
	name: 'bitcoin',
	displayName: 'Bitcoin',
	ticker: 'BTC',
	satPerCoin: 1e8,
	floFeePerKb: bitcoinFeePerKb,
	feePerByte: bitcoinFeePerKb / 1024,
	maxFeePerByte: 100,
	minFee: bitcoinFeePerKb,
	dust: 546,

	txVersion: 1,

	explorers: [
		new Insight('https://insight.bitpay.io')
	],

	network: networks.bitcoin
}