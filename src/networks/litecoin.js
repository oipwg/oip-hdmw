import { Insight } from '@oipwg/insight-explorer'
import coininfo from 'coininfo'
import bip44constants from 'bip44-constants'
import config from './config'

const litecoinFeePerKb = 100000

const n = coininfo.litecoin.main.toBitcoinJS()

module.exports = {
  name: 'litecoin',
  displayName: 'Litecoin',
  ticker: 'LTC',
  satPerCoin: 1e8,
  feePerKb: litecoinFeePerKb,
  feePerByte: litecoinFeePerKb / 1024,
  maxFeePerByte: 100,
  minFee: 0,
  dust: 54600,

  txVersion: 1,

  explorer: new Insight(config.defaultApiUrls.litecoin),

  network: {
    bip32: {
      public: n.bip32.public,
      private: n.bip32.private
    },
    slip44: bip44constants.LTC,
    messagePrefix: '\u0018Litecoin Signed Message:\n',
    pubKeyHash: n.pubKeyHash,
    scriptHash: n.scriptHash,
    wif: n.wif
  }
}
