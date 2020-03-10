import { Insight } from '@oipwg/insight-explorer'
import config from './config'

const floFeePerKb = 100000

module.exports = {
  name: 'floTestnet',
  displayName: 'Flo Testnet',
  ticker: 'tFLO',
  satPerCoin: 1e8,
  feePerKb: floFeePerKb,
  feePerByte: floFeePerKb / 1024,
  maxFeePerByte: 100,
  minFee: 0,
  dust: 100000,

  txVersion: 2,

  explorer: new Insight(config.defaultApiUrls.floTestnet),

  hasFloData: true,

  network: {
    bip32: {
      public: 0x013440e2,
      private: 0x01343c23
    },
    slip44: 1,
    messagePrefix: '\u001bFlorincoin Signed Message:\n',
    pubKeyHash: 115,
    scriptHash: 58,
    wif: 239
  }
}
