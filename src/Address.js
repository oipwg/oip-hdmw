import bitcoin from 'bitcoinjs-lib'
import bitcoinMessage from 'bitcoinjs-message'
import EventEmitter from 'eventemitter3'

import { toBase58, isValidPublicAddress, isValidWIF } from './util'

const ECPair = bitcoin.ECPair

/**
 * [bitcoinjs-lib ECPair](https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/ecpair.js#L16)
 * @typedef {Object} ECPair
 */

/**
 * Contains information about an Unspent Transaction Output
 * @typedef {Object} utxo
 * @property {string} address - Base58 Public Address
 * @property {string} txid - The Transaction ID
 * @property {number} vout - The Index of this specific Output in its parent Transaction
 * @property {string} scriptPubKey - The Script Public Key Hash
 * @property {number} amount - Amount (in whole Coin) of this Output
 * @property {number} satoshis - Amount in Satoshis of this Output
 * @property {number} height - The Blockheight the Parent Transaction was confirmed in
 * @property {number} confirmations - The total number of Confirmations the Parent Transaction has received
 * @example
 * {
 *   address: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
 *   txid: '7687e361f00998f96b29938bf5b7d9003a15ec182c13b6ddbd5adc0f993cbf9c',
 *   vout: 1,
 *   scriptPubKey: '76a9141bfcff1731caf3a16225d3e78735ddc229e4fc6c88ac',
 *   amount: 0.001,
 *   satoshis: 100000,
 *   height: 2784696,
 *   confirmations: 6828
 * }
 */

/**
 * Contains information about an Unspent Transaction Output
 * @typedef {Object} AddressState
 * @property {string} addrStr - Base58 Public Address
 * @property {number} balanceSat - Balance of the Address in Satoshis
 * @property {number} totalReceivedSat - Total Recieved to the Address in Satoshis
 * @property {number} unconfirmedBalanceSat - Unconfirmed Balance of the Address in Satoshis
 * @property {Array.<string>} transactions - Array of `txids` that have been confirmed on the Network
 * @property {Array.<string>} spentTransactions - Array of `txids` that have been spent, but not yet confirmed on the Network
 * @property {number} lastUpdated - Timestamp of when the Address was last updated/synced with the Explorer
 * @example
 * {
 *   addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
 *   balanceSat: 0,
 *   totalReceivedSat: 0,
 *   unconfirmedBalanceSat: 0,
 *   transactions: [],
 *   spentTransactions: [],
 *   lastUpdated: 0
 * }
 */

/**
 * Manages information about a specific Address
 */
class Address {
  /**
   * Create a new Address based on either a bip32 node, WIF Private Key, or Public Address
   * ##### Examples
   * Create Address from bip32
   * ```
   * import * as bip32 from 'bip32';
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
   * let address = new Address(node, Networks.flo);
   * ```
   * Create Address from WIF
   * ```
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5", Networks.flo);
   * ```
   * Create Address from Base58 Public Address
   * ```
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo);
   * ```
   * @param  {bip32|string} address - The Public Address, Private Key (WIF), or bip32 Node that the Address is for.
   * @param  {CoinInfo} coin - CoinInfo for the specific Address
   * @param  {boolean|AddressState} [discover=true] - Either a `boolean` value for if the Address should auto-discover, or an AddressState object to load the Internal state from.
   * @return {Address}
   */
  constructor (address, coin, discover) {
    if (address.network !== undefined) {
      this.fromBIP32 = true

      if (address.address) {
        this.address = address.address
      } else if (address.index !== undefined && address.depth !== undefined) {
        this.address = address
      }

      // Make sure that the networks match and throw an error if they don't
      if (address.network.pubKeyHash !== coin.network.pubKeyHash) {
        throw new Error('Address Network and Coin Network DO NOT MATCH!!!!!')
      }
    } else {
      if (isValidPublicAddress(address, coin.network)) {
        this.fromBIP32 = false
        this.pubAddress = address
      } else if (isValidWIF(address, coin.network)) {
        this.fromBIP32 = true

        this.address = ECPair.fromWIF(address, coin.network)
      }
    }

    this.coin = coin || { satPerCoin: 1e8 }

    // Setup internal variables
    this.transactions = []

    this.balanceSat = 0
    this.totalReceivedSat = 0
    this.totalSentSat = 0
    this.unconfirmedBalanceSat = 0

    this.lastUpdated = 0

    this.spentTransactions = []

    // Setup EventEmitter to notify when we have changed
    this.eventEmitter = new EventEmitter()

    // Setup Websocket Address updates to keep us always up to date
    this.coin.explorer.onAddressUpdate(this.getPublicAddress(), this.ProcessWebsocketUpdate.bind(this))

    if (discover || discover === false) {
      // Load from serialized JSON
      this.deserialize(discover)
    } else {
      // Update the state from the explorer
      this.updateState()
    }
  }

  /**
   * Get the Base58 sharable Public Address
   * @example
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5", Networks.flo);
   * let pubAddr = address.getPublicAddress();
   * // pubAddr = F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp
   * @return {string}
   */
  getPublicAddress () {
    let publicKey

    if (this.fromBIP32 && this.address) {
      publicKey = this.address.publicKey

      if (!publicKey && this.address.getPublicKeyBuffer) { publicKey = this.address.getPublicKeyBuffer() }
    }

    return this.fromBIP32 ? toBase58(publicKey, this.coin.network.pubKeyHash) : this.pubAddress
  }

  /**
   * Get the Base58 sharable Private Address (WIF)
   * @example
   * import * as bip32 from 'bip32';
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
   * let address = new Address(node, Networks.flo);
   * let wif = address.getPrivateAddress();
   * // wif = RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5
   * @return {string}
   */
  getPrivateAddress () {
    return this.address ? this.address.toWIF() : undefined
  }

  /**
   * Get the internal ECPair. This is used when you need to Sign Transactions, or to access the raw public/private Buffers.
   * Please note that if you create the Address from a Public Key, you will not get back an ECPair, since we need access
   * to the Private Key in order to create/access the ECPair. When Address is created using a bip32 node or a Private Key (WIF)
   * the ECPair will exist.
   * @example
   * import * as bip32 from 'bip32';
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
   * let address = new Address(node, Networks.flo);
   * let ecpair = address.getECPair();
   * @return {ECPair}
   */
  getECPair () {
    return this.address
  }

  /**
   * Get the signature of a specific message that can be verified by others
   * @param  {String} message - The message you wish to get the signature for
   * @return {String} Returns the base64 string of the created Signature
   */
  signMessage (message) {
    if (!message || typeof message !== 'string') { throw new Error('Message must be defined and a String!') }

    const privatekeyEcpair = this.getECPair()

    if (!privatekeyEcpair) { throw new Error('No Private Key available! Unable to sign message!') }

    const privateKeyBuffer = privatekeyEcpair.privateKey

    const compressed = privatekeyEcpair.compressed || true
    const messagePrefix = this.coin.network.messagePrefix

    let signatureBuffer
    try {
      signatureBuffer = bitcoinMessage.sign(message, privateKeyBuffer, compressed, messagePrefix)
    } catch (e) {
      throw new Error('Unable to create signature! \n' + e)
    }

    return signatureBuffer.toString('base64')
  }

  /**
   * Verify the signature of a given message
   * @param  {String} message   - The message you want to verify
   * @param  {String} signature - The signature of the message
   * @return {Boolean} Returns either `true` or `false` depending on if the signature and message match
   */
  verifySignature (message, signature) {
    let valid

    try {
      valid = bitcoinMessage.verify(message, this.getPublicAddress(), signature, this.coin.network.messagePrefix)
    } catch (e) {
      throw new Error('Unable to verify signature! \n' + e)
    }

    return valid
  }

  /**
   * Get the latest State for this address from the Blockchain Explorer
   * @example
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo);
   * address.updateState().then((addr) => {
   *   console.log(addr.getTotalReceived())
   * })
   * @return {Promise<Address>} Returns a Promise that will resolve to the Address
   */
  async updateState () {
    let state
    try {
      state = await this.coin.explorer.getAddress(this.getPublicAddress())
    } catch (e) {
      throw new Error('Error Updating Address State for: ' + this.getPublicAddress() + '\n' + e)
    }

    return this.deserialize(state)
  }

  /**
   * Hydrate an Address from the serialized JSON, or update the state
   * @param  {AddressState} state
   * @example
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, false);
   *
   * address.deserialize({
   *   addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
   *   balanceSat: 123,
   *   totalReceivedSat: 234,
   *   unconfirmedBalanceSat: 345,
   *   transactions: ['abcde'],
   *   spentTransactions: ['bcdef'],
   *   lastUpdated: 456
   * })
   *
   * let balance = address.getBalance()
   * // balance = 0.00000123
   * @return {Address}
   */
  deserialize (state) {
    if (!state) { return }

    // If the state doesn't match for this address, ignore it.
    if (state.addrStr && state.addrStr !== this.getPublicAddress()) { return }

    if (!isNaN(state.balanceSat)) { this.balanceSat = state.balanceSat }

    if (!isNaN(state.totalReceivedSat)) { this.totalReceivedSat = state.totalReceivedSat }

    if (!isNaN(state.totalSentSat)) { this.totalSentSat = state.totalSentSat }

    if (!isNaN(state.unconfirmedBalanceSat)) { this.unconfirmedBalanceSat = state.unconfirmedBalanceSat }

    if (Array.isArray(state.transactions)) {
      this.transactions = state.transactions
    }

    if (Array.isArray(state.spentTransactions)) {
      for (const tx of state.spentTransactions) {
        this.spentTransactions.push(tx)
      }
    }

    if (!isNaN(state.lastUpdated)) { this.lastUpdated = state.lastUpdated } else { this.lastUpdated = Date.now() }

    return this
  }

  /**
   * Get a serialized version of the Address (dried out JSON)
   * @example
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, false);
   *
   * let addressState = address.serialize()
   * // addressState = {
   * //   addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
   * //   balanceSat: 0,
   * //   totalReceivedSat: 0,
   * //   unconfirmedBalanceSat: 0,
   * //   transactions: [],
   * //   spentTransactions: [],
   * //   lastUpdated: 0
   * // }
   * @return {AddressState}
   */
  serialize () {
    return {
      addrStr: this.getPublicAddress(),
      wif: this.getPrivateAddress(),
      balanceSat: this.balanceSat,
      totalReceivedSat: this.totalReceivedSat,
      unconfirmedBalanceSat: this.unconfirmedBalanceSat,
      transactions: this.transactions,
      spentTransactions: this.spentTransactions,
      lastUpdated: this.lastUpdated
    }
  }

  /**
   * Get the Balance (in whole coins) for the Address
   * @example
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, false);
   * let balance = address.getBalance();
   * // balance = 0
   * @return {number}
   */
  getBalance () {
    return this.balanceSat / this.coin.satPerCoin
  }

  /**
   * Get the Total Recieved balance (in whole coins) for the Address
   * @example
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, false);
   * let totReceived = address.getTotalReceived();
   * // totReceived = 0
   * @return {number}
   */
  getTotalReceived () {
    return this.totalReceivedSat / this.coin.satPerCoin
  }

  /**
   * Get the Total Sent balance (in whole coins) for the Address
   * @example
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, false);
   * let totSent = address.getTotalSent();
   * // totSent = 0
   * @return {number}
   */
  getTotalSent () {
    return this.totalSentSat / this.coin.satPerCoin
  }

  /**
   * Get the Unconfirmed Balance (in whole coins) for the Address
   * @example
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, false);
   * let uBal = address.getUnconfirmedBalance();
   * // uBal = 0
   * @return {number}
   */
  getUnconfirmedBalance () {
    return this.unconfirmedBalanceSat / this.coin.satPerCoin
  }

  /**
   * Get the unspent transaction outputs for the Address
   * @example
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, false);
   * address.getUnspent().then((utxos) => {
   *   console.log(utxos);
   * })
   * @return {Promise<Array.<utxo>>} Returns a Promise that resolves to an Array of utxos.
   */
  getUnspent () {
    return this.coin.explorer.getAddressUtxo(this.getPublicAddress()).then((utxos) => {
      return this.removeSpent(utxos)
    })
  }

  /**
   * Remove the already spent outputs from the array we are given.
   * @param  {Array.<utxo>} unspentTransactions - An Array containing utxos to sort through
   * @example
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, false);
   * address.getUnspent().then((utxos) => {
   *   let unspentUtxos = address.removeSpent(utxos)
   *   console.log(unspentUtxos)
   * })
   * @return {Array.<utxo>}
   */
  removeSpent (unspentTransactions) {
    // If we are not defined, or we are not an array, just return
    if (!unspentTransactions || !Array.isArray(unspentTransactions)) { return }

    const unspent = []

    for (const tx of unspentTransactions) {
      let spent = false
      for (const txid of this.spentTransactions) {
        if (txid === tx.txid) {
          spent = true
        }
      }

      if (!spent) { unspent.push(tx) }
    }

    // @ToDo: Check if some spentTransactions txids are missing from the unspentTransactions array
    // If the txid is missing from the unspentTransactions array, then remove it from the spentTransactions array
    // This clears out any spentTransactions that have been confirmed as no longer unspent.

    return unspent
  }

  /**
   * Add a TXID to the local Spent Transactions of the Address to prevent a specific output from being doublespent.
   * @example
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, false);
   * address.addSpentTransaction("7687e361f00998f96b29938bf5b7d9003a15ec182c13b6ddbd5adc0f993cbf9c")
   * @param {string} txid - The TXID of the spent output that we should remove
   */
  addSpentTransaction (txid) {
    this.spentTransactions.push(txid)
  }

  /**
   * Internal function used to process updates streaming in from Websockets,
   * emits an update that can be subscribed to with onWebsocketUpdate
   * @param  {Object} update - Websocket Update Data
   */
  ProcessWebsocketUpdate (update) {
    // If there is no data available, just ignore it
    if (!update) { return }

    // If there is updated data, go ahead and set ourselves to it
    if (update.updatedData) {
      const addr = this.deserialize(update.updatedData)
      this.eventEmitter.emit('websocketUpdate', addr)
    }
  }

  /**
   * Subscribe to events that are emitted when an Address update is received via Websockets
   * @param  {function} subscriberFunction - The function you want called when there is an update
   *
   * @example
   * import { Address, Networks } from 'oip-hdmw';
   *
   * let address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, false);
   * address.onWebsocketUpdate((address) => {
   *     console.log(address.getPublicAddress() + " Recieved a Websocket Update!")
   * })
   */
  onWebsocketUpdate (subscriberFunction) {
    this.eventEmitter.on('websocketUpdate', subscriberFunction)
  }
}

module.exports = Address
