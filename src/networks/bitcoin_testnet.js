import { Insight } from 'insight-explorer'
import { networks } from 'bitcoinjs-lib'

var bitcoinFeePerKb = 100000

module.exports = {
	name: 'bitcoin_testnet',
	displayName: 'Bitcoin Testnet',
	ticker: 'tBTC',
	satPerCoin: 1e8,
	feePerKb: bitcoinFeePerKb,
	feePerByte: bitcoinFeePerKb / 1024,
	maxFeePerByte: 100,
	minFee: bitcoinFeePerKb,
	dust: 546,

	txVersion: 1,

	explorer: new Insight('https://test-insight.bitpay.com/api'),

	network: networks.testnet
}