import { Insight } from 'insight-explorer'
import coininfo from 'coininfo'
import bip44constants from 'bip44-constants'

var litecoinFeePerKb = 100000

var n = coininfo.litecoin.main.toBitcoinJS();

n.slip44 = bip44constants.LTC;

module.exports = {
	name: 'litecoin',
	displayName: 'Litecoin',
	ticker: 'LTC',
	satPerCoin: 1e8,
	feePerKb: litecoinFeePerKb,
	feePerByte: litecoinFeePerKb / 1024,
	maxFeePerByte: 100,
	minFee: litecoinFeePerKb,
	dust: 54600,

	txVersion: 1,

	explorer: new Insight('https://litesight.failover.alexandria.io/api'),

	getExtraBytes: function(options){ return },

	network: n
}