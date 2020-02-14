import { Insight } from 'insight-explorer'
import { varIntBuffer } from '../util'
import config from './config'

const floFeePerKb = 100000

/**
 * An object that contains information about a coins Name, Network, and access to an explorer
 * @typedef {Object} CoinInfo
 * @property {string} name - All lowercase "name" of the CoinInfo, this is what is passed in to the `supportedCoins` check. This cannot include spaces.
 * @property {string} displayName - The Display Name for the Coin, this would be the full official name and can include spaces.
 * @property {string} ticker - The "Ticker" that is used to track the Coin on Exchanges
 * @property {number} satPerCoin - The number of satoshis per single coin
 * @property {number} feePerKb - The amount of fee in satoshis to pay per kilobyte of data being put into the blockchain
 * @property {number} feePerByte - The amount of fee in satoshis to pay per byte of data being put into the blockchain
 * @property {number} maxFeePerByte - The maximum fee to pay per byte of data being put into the blockchain
 * @property {number} minFee - The minimum fee that should ever be paid
 * @property {number} dust - Amount in Satoshis of the minimum value allowed to be sent around the network
 * @property {number} txVersion - The current TX version number for the coin
 * @property {InsightExplorer} explorer - An InsightExplorer for the current coin so that data can be retreived from the network
 * @property {function} getExtraBytes - A function that is passed options from TransactionBuilder when a transaction is being built/sent. You can use this to add custom logic/tx hex building.
 * @property {CoinNetwork} network - The specific coin network variables, same as used in bitcoinjs-lib
 *
 * @example
 * {
  name: 'flo',
  displayName: 'Flo',
  ticker: 'FLO',
  satPerCoin: 1e8,
  feePerKb: floFeePerKb,
  feePerByte: floFeePerKb / 1024,
  maxFeePerByte: 100,
  minFee: floFeePerKb,
  dust: 100000,

  txVersion: 2,

  explorer: new Insight('https://livenet.flocha.in/api'),

  getExtraBytes: function(options){
    let fData = options.floData || ""
    return varIntBuffer(fData.length).toString("hex") + Buffer.from(fData).toString("hex")
  },

  network: CoinNetwork
}
 */

/**
 * An object that contains version variables specific to the Coin
 * @typedef {Object} CoinNetwork
 * @property {Object} bip32 - BIP32 Variables
 * @property {number} bip32.public - The Extended Public Key version bytes
 * @property {number} bip32.private - The Extended Private Key version bytes
 * @property {number} slip44 - The `coinType` number for the coin, must match [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
 * @property {string} messagePrefix - The Prefix to add on when checking/signing a message
 * @property {number} pubKeyHash - The coin specific "version" used when creating a Public Key Hash (Public Address)
 * @property {number} scriptHash - The coin specific "version" used when creating a Script Hash
 * @property {number} wif - Wallet Import Format "version" for this specific coin
 *
 * @example
 * {
  bip32: {
    public: 0x0134406b,
    private: 0x01343c31
  },
  slip44: 216,
  messagePrefix: '\x1bFlorincoin Signed Message:\n',
  pubKeyHash: 35,
  scriptHash: 94,
  wif: 163
}
 */

module.exports = {
  name: 'flo',
  displayName: 'Flo',
  ticker: 'FLO',
  satPerCoin: 1e8,
  feePerKb: floFeePerKb,
  feePerByte: floFeePerKb / 1024,
  maxFeePerByte: 100,
  minFee: floFeePerKb,
  dust: 100000,

  txVersion: 2,

  explorer: new Insight(config.defaultApiUrls.flo),

  getExtraBytes: function (options) {
    const fData = options.floData || ''

    const stringBuffer = Buffer.from(fData, 'utf8')
    const lengthBuffer = varIntBuffer(stringBuffer.length)

    const builtString = lengthBuffer.toString('hex') + stringBuffer.toString('hex')

    return builtString
  },

  network: {
    bip32: {
      public: 0x0134406b,
      private: 0x01343c31
    },
    slip44: 216,
    messagePrefix: '\u001bFlorincoin Signed Message:\n',
    pubKeyHash: 35,
    scriptHash: 94,
    wif: 163
  }
}
