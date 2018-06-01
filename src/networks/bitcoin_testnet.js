import InsightExplorer from 'insight-explorer'
import { networks } from 'bitcoinjs-lib'

var bitcoinFeePerKb = 100000

exports = {
	name: 'bitcoin_testnet',
	displayName: 'Bitcoin Testnet',
	ticker: 'tBTC',
	satPerCoin: 1e8,
	floFeePerKb: bitcoinFeePerKb,
	feePerByte: bitcoinFeePerKb / 1024,
	maxFeePerByte: 100,
	minFee: bitcoinFeePerKb,
	dust: 546,

	txVersion: 1,

	explorers: [
		new InsightExplorer('https://test-insight.bitpay.com')
	],

	network: networks.testnet
}