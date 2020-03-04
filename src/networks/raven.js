import { Insight } from '@oipwg/insight-explorer'
import * as coinInfo from 'coininfo'
import * as bip44constants from 'bip44-constants'
import config from './config'

const ravenFeePerKb = 100000

const n = coinInfo.ravencoin.main.toBitcoinJS()

module.exports = {
  name: 'raven',
  displayName: 'Ravencoin',
  ticker: 'RVN',
  satPerCoin: 1e8,
  feePerKb: ravenFeePerKb,
  feePerByte: ravenFeePerKb / 1024,
  maxFeePerByte: 100,
  minFee: ravenFeePerKb,
  dust: 54600,

  txVersion: 1,

  explorer: new Insight(config.defaultApiUrls.raven, false),

  network: {
    bip32: {
      public: n.bip32.public,
      private: n.bip32.private
    },
    slip44: bip44constants.RVN,
    messagePrefix: '\u0016Raven Signed Message:\n',
    pubKeyHash: n.pubKeyHash,
    scriptHash: n.scriptHash,
    wif: n.wif
  }
}
