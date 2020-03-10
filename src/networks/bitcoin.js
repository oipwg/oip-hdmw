import { Insight } from '@oipwg/insight-explorer'
import { networks } from '@oipwg/bitcoinjs-lib'
import bip44constants from 'bip44-constants'
import config from './config'

const bitcoinFeePerKb = 100000

const n = networks.bitcoin

n.slip44 = bip44constants.BTC

module.exports = {
  name: 'bitcoin',
  displayName: 'Bitcoin',
  ticker: 'BTC',
  satPerCoin: 1e8,
  feePerKb: bitcoinFeePerKb,
  feePerByte: bitcoinFeePerKb / 1024,
  maxFeePerByte: 100,
  minFee: 0,
  dust: 546,

  txVersion: 1,

  explorer: new Insight(config.defaultApiUrls.bitcoin),

  network: n
}
