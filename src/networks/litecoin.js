import { Insight } from 'insight-explorer'
import { networks } from 'bitcoinjs-lib'

var litecoinFeePerKb = 100000

exports = {
	name: 'litecoin',
	displayName: 'Litecoin',
	ticker: 'LTC',
	satPerCoin: 1e8,
	floFeePerKb: litecoinFeePerKb,
	feePerByte: litecoinFeePerKb / 1024,
	maxFeePerByte: 100,
	minFee: litecoinFeePerKb,
	dust: 54600,

	txVersion: 1,

	explorers: [
		new Insight('https://insight.litecore.io')
	],

	network: networks.litecoin
}