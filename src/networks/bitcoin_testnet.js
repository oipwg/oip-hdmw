import { Insight } from 'insight-explorer'
import { networks } from 'bitcoinjs-lib'

import config from './config'

var bitcoinFeePerKb = 100000

var n = networks.testnet

n.slip44 = 1

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

  explorer: new Insight(config.defaultApiUrls.bitcoin_testnet),

  getExtraBytes: function (options) { },

  network: n
}
