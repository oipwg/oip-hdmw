import { Insight } from '@oipwg/insight-explorer'
import { networks } from 'bitcoinjs-lib'

import config from './config'

const bitcoinFeePerKb = 100000

const n = networks.testnet

n.slip44 = 1

module.exports = {
  name: 'bitcoinTestnet',
  displayName: 'Bitcoin Testnet',
  ticker: 'tBTC',
  satPerCoin: 1e8,
  feePerKb: bitcoinFeePerKb,
  feePerByte: bitcoinFeePerKb / 1024,
  maxFeePerByte: 100,
  minFee: bitcoinFeePerKb,
  dust: 546,

  txVersion: 1,

  explorer: new Insight(config.defaultApiUrls.bitcoinTestnet),

  getExtraBytes: function (options) { },

  network: n
}
