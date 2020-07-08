import * as bitcoin from '@oipwg/bitcoinjs-lib'
import coinselect from '@oipwg/coinselect'

import Address from './Address'
import { isValidPublicAddress } from './util'

import { FloPsbt } from './FloTransaction'

/**
 * An Output for a Transaction
 * @typedef {Object} OutputAddress
 * @example
 * { "FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001 }
 * @example
 * { "base58-public-address": valueInWholeCoin }
 */

/**
 * An object returned from `coinselect` that contains information about selected inputs, outputs, and the fee.
 * @typedef {Object} SelectedInputOutput
 * @property {Array<TXInput>} inputs - An Array of Transaction Inputs
 * @property {Array<TXOutput>} outputs - An Array of Transaction Outputs
 * @property {number} fee - The Calculated Fee to pay
 */

/**
 * A Transaction Input
 * @typedef {Object} TXInput
 * @property {string} address - Base58 Public Address
 * @property {string} txId - Parent Transaction ID
 * @property {number} vout - Index of output in Parent Transaction
 * @property {string} scriptPubKey - Script Public Key Hash
 * @property {number} value - Balance of the input in Satoshis
 * @example
 * {
 *   address: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
 *   txId: '7687e361f00998f96b29938bf5b7d9003a15ec182c13b6ddbd5adc0f993cbf9c',
 *   vout: 1,
 *   scriptPubKey: '76a9141bfcff1731caf3a16225d3e78735ddc229e4fc6c88ac',
 *   value: 100000
 * }
 */

/**
 * A Transaction Output
 * @typedef {Object} TXOutput
 * @property {string} address - Base58 Public Address
 * @property {number} value - Amount to send Satoshis
 * @example
 * {
 *   address: 'FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu',
 *   value: 1000
 * }
 */

/**
 * Build & Send Transactions out to the network Easily using Addresses!
 */
class TransactionBuilder {
  /**
   * Create a new TransactionBuilder
   * ##### Example
   * ```
   * import * as bip32 from 'bip32'
   * import { Address, TransactionBuilder, Networks } from '@oipwg/hdmw'
   *
   * let node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
   * let address = new Address(node, Networks.flo, false)
   *
   * let builder = new TransactionBuilder(Networks.flo, {
   *   from: address,
   *   to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001},
   *   floData: "Testing oip-hdmw!"
   * })
   * ```
   * @param  {CoinInfo} coin - CoinInfo for this specific Network you want to send the Transaction on.
   * @param  {Object} [options]
   * @param  {Address|Array.<Address>} options.from - The Address(es) to send from.
   * @param  {OutputAddress|Array.<OutputAddress>} options.to - The amounts & Address(es) to send to.
   * @param  {string} [options.floData=""] - The FloData to be added to the Transaction
   * @param  {Account} [account] - An Account to get a Change Address from if needed, if undefined, change will be sent to first `from` Address.
   * @return {TransactionBuilder}
   */
  constructor (coin, options, account) {
    this.coin = coin
    this.account = account

    // Addresses we are sending from
    this.from = []
    // Addresses we want to send to & amounts
    this.to = []

    this.passedOptions = {}

    this.parseOptions(options)
  }

  /**
   * Add an Address to send from
   * @example
   * import * as bip32 from 'bip32'
   * import { Address, TransactionBuilder, Networks } from '@oipwg/hdmw'
   *
   * let node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
   * let address = new Address(node, Networks.flo, false)
   *
   * let builder = new TransactionBuilder(Networks.flo)
   * builder.addFrom(address);
   * @param {Address} address - Address to add to the From Addresses
   */
  addFrom (address) {
    if (address instanceof Address) {
      if (isValidPublicAddress(address.getPublicAddress(), this.coin.network)) {
        this.from.push(address)
      }
    } else {
      throw new Error('From Address MUST BE InstanceOf Address')
    }
  }

  /**
   * Add an Address and Amount to send to
   * @example
   * import * as bip32 from 'bip32'
   * import { TransactionBuilder, Networks } from '@oipwg/hdmw'
   *
   * let builder = new TransactionBuilder(Networks.flo)
   * builder.addTo("FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu", 0.001);
   * @param {string} address - Base58 Public Address to send To
   * @param {number} amount - Amount to Send (in whole coin)
   */
  addTo (address, amount) {
    if (isValidPublicAddress(address, this.coin.network) && !isNaN(amount)) {
      const tmpTo = {
        address: address,
        value: amount
      }
      this.to.push(tmpTo)
    }
  }

  /**
   * Load From & To addresses
   * @param  {Object} options
   * @param  {Address|Array.<Address>} options.from - The Address(es) to send from.
   * @param  {OutputAddress|Array.<OutputAddress>} options.to - The amounts & Address(es) to send to.
   * @param  {string} [options.floData=""] - The FloData to be added to the Transaction
   * @example
   * import * as bip32 from 'bip32'
   * import { Address, TransactionBuilder, Networks } from '@oipwg/hdmw'
   *
   * let node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
   * let address = new Address(node, Networks.flo, false)
   *
   * let builder = new TransactionBuilder(Networks.flo)
   *
   * builder.parseOptions({
   *   from: address,
   *   to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001},
   *   floData: "Testing oip-hdmw!"
   * })
   */
  parseOptions (options) {
    if (!options) { return }

    // Grab the From Addresses, it can be an array or regular.
    if (options.from) {
      if (Array.isArray(options.from)) {
        for (const addr of options.from) {
          this.addFrom(addr)
        }
      } else {
        this.addFrom(options.from)
      }
    }

    // Load who we are sending to
    if (options.to) {
      // Check if we are providing an address string and amount separately
      if (Array.isArray(options.to)) {
        for (const payTo of options.to) {
          for (const address in payTo) {
            if (!Object.prototype.hasOwnProperty.call(payTo, address)) continue
            this.addTo(address, payTo[address])
          }
        }
      } else {
        for (const address in options.to) {
          if (!Object.prototype.hasOwnProperty.call(options.to, address)) continue
          this.addTo(address, options.to[address])
        }
      }
    }

    this.passedOptions = options
  }

  /**
   * Get the Unspent Transaction Outputs for all the From addresses specified.
   * @example
   * import * as bip32 from 'bip32'
   * import { Address, TransactionBuilder, Networks } from '@oipwg/hdmw'
   *
   * let node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
   * let address = new Address(node, Networks.flo, false)
   *
   * let builder = new TransactionBuilder(Networks.flo, {
   *   from: address,
   *   to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001}
   * })
   *
   * builder.getUnspents().then((utxos) => {
   *   console.log(utxos)
   * })
   * @return {Promise<Array.<utxo>>} Returns a Promise that will resolve to an Array of unspent utxos
   */
  async getUnspents () {
    const utxos = []

    for (const addr of this.from) {
      try {
        const tmpUtxos = await addr.getUnspent()

        for (const utxo of tmpUtxos) { utxos.push(utxo) }
      } catch (e) { throw new Error('Unable to get Unspents \n' + e) }
    }

    return utxos
  }

  /**
   * Get calculated Inputs and Outputs (and Fee) for From and To Addresses
   * @param {Array.<utxo>} [manualUtxos] - Pass in utxos for the function to use. If not passed, it will call the function getUnspents()
   * @example
   * import * as bip32 from 'bip32'
   * import { Account, Address, TransactionBuilder, Networks } from '@oipwg/hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
   * let account = new Account(accountMaster, networks.flo, false);
   *
   * let node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
   * let address = new Address(node, Networks.flo, false)
   *
   * let builder = new TransactionBuilder(Networks.flo, {
   *   from: address,
   *   to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001}
   * }, account)
   *
   * builder.buildInputsAndOutputs().then((calculated) => {
   *   console.log(calculated.inputs)
   *   console.log(calculated.outputs)
   *   console.log(calculated.fee)
   * })
   * @return {SelectedInputOutput}
   */
  async buildInputsAndOutputs (manualUtxos) {
    try {
      await this.discoverChange()
    } catch (e) { throw new Error('Unable to Discover Change Addresses \n' + e) }

    let utxos = manualUtxos

    if (!utxos) {
      try {
        utxos = await this.getUnspents()
      } catch (e) { throw new Error('Unable to get Unspents for Addresses \n' + e) }
    }

    const formattedUtxos = utxos.map((utxo) => {
      return {
        address: utxo.address,
        txId: utxo.txid,
        vout: utxo.vout,
        scriptPubKey: utxo.scriptPubKey,
        value: utxo.satoshis,
        confirmations: utxo.confirmations
      }
    })

    const targets = this.to.map((toObj) => {
      return {
        address: toObj.address,
        value: Math.floor(toObj.value * this.coin.satPerCoin)
      }
    })

    let extraBytesLength = 0

    if (this.coin.network.hasFloData) { extraBytesLength = this.passedOptions.floData ? this.passedOptions.floData.length : 0 }

    const utxosNoUnconfirmed = formattedUtxos.filter(utx => utx.confirmations > 0)

    let selected = coinselect(utxosNoUnconfirmed, targets, Math.ceil(this.coin.feePerByte), this.coin.minFee, extraBytesLength)

    // Check if we are able to build inputs/outputs off only unconfirmed transactions with confirmations > 0
    if (selected.inputs && selected.inputs.length > 0 && selected.outputs && selected.outputs.length > 0 && selected.fee) {
      // return selected
    } else { // else, build with the regular ones
      selected = coinselect(formattedUtxos, targets, Math.ceil(this.coin.feePerByte), this.coin.minFee, extraBytesLength)
    }

    if (selected.inputs) {
      for (let i = 0; i < selected.inputs.length; i++) {
        const raw = await this.coin.explorer.getRawTransaction(selected.inputs[i].txId)
        selected.inputs[i].rawtx = raw.rawtx
      }
    }
    return selected
  }

  /**
   * Discover the used change addresses if we were passed an Account to discover from.
   * @example
   * import * as bip32 from 'bip32'
   * import { Account, Address, TransactionBuilder, Networks } from '@oipwg/hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
   * let account = new Account(accountMaster, networks.flo, false);
   *
   * let node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
   * let address = new Address(node, Networks.flo, false)
   *
   * let builder = new TransactionBuilder(Networks.flo, {
   *   from: address,
   *   to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001}
   * }, account)
   *
   * builder.discoverChange().then(() => {
   *   console.log("Done Discovering Change!")
   * })
   * @return {Promise}
   */
  async discoverChange () {
    if (this.account) {
      try {
        await this.account.discoverChain(1)
        return
      } catch (e) { throw new Error('Unable to Discover Chain \n' + e) }
    } else {

    }
  }

  /**
   * Build the Transaction hex for the From and To addresses
   * @param {SelectedInputOutput} [manualSelected] - Inputs and Outputs to use. If not passed, the function buildInputsAndOutputs() is run.
   * @example
   * import * as bip32 from 'bip32'
   * import { Address, TransactionBuilder, Networks } from '@oipwg/hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
   * let account = new Account(accountMaster, networks.flo, false);
   *
   * // F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp
   * let addressNode = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)
   * let address = new Address(addressNode, networks.flo, false);
   *
   * let builder = new TransactionBuilder(networks.flo, {
   *   from: address,
   *   to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001},
   *   floData: "Testing oip-hdmw!"
   * }, account)
   *
   * builder.buildTX().then((hex) => {
   *   console.log(hex)
   * })
   * @return {Promise<string>} Returns a Promise that resolves to the calculated Transaction Hex
   */
  async buildTX (manualSelected) {
    let selected = manualSelected

    if (!selected) {
      try {
        selected = await this.buildInputsAndOutputs()
      } catch (e) {
        throw new Error('Unable to select inputs and outputs \n' + e)
      }
    }

    this.selected = selected

    const inputs = selected.inputs
    let outputs = selected.outputs

    // inputs and outputs will be undefined if no solution was found
    if (!inputs || !outputs) {
      throw new Error('No Inputs or Outputs selected! Fail!')
    }

    let txb
    if (this.coin.hasFloData === true) {
      const floData = Buffer.from(this.passedOptions.floData || '')
      txb = new FloPsbt({ network: this.coin.network })
      txb.setFloData(floData)
    } else {
      txb = new bitcoin.Psbt({ network: this.coin.network })
    }

    txb.setVersion(this.coin.txVersion)

    inputs.forEach(input =>
      txb.addInput({
        hash: input.txId,
        index: input.vout,
        nonWitnessUtxo: Buffer.from(input.rawtx, 'hex')
      }))

    // Check if we are paying to ourself, if so, merge the outputs to just a single output.
    // Check if we only have one from address, and two outputs (i.e. pay to and change)
    if (this.from.length === 1 && outputs.length === 2) {
      // If the first input is sending to the from address, and there is a change output,
      // then merge the outputs.
      if (outputs[0].address === this.from[0].getPublicAddress() && !outputs[1].address) {
        const totalToSend = outputs[0].value + outputs[1].value
        outputs = [{
          address: this.from[0].getPublicAddress(),
          value: totalToSend
        }]
      }
    }

    outputs.forEach(output => {
      // watch out, outputs may have been added that you need to provide
      // an output address/script for
      if (!output.address) {
        // Check if we have access to an account to get the change address from
        if (this.account) {
          output.address = this.account.getNextChangeAddress().getPublicAddress()
        } else {
          // If the change is undefined, send change to the first from address
          output.address = this.from[0].getPublicAddress()
        }
      }

      txb.addOutput({ address: output.address, value: output.value })
    })

    for (const addr of this.from) {
      try {
        txb.signAllInputs(addr.getECPair())
      } catch (e) {
        // sign throws if there is no input to be signed by addr
        throw new Error('No input to be signed by addr! \n' + e)
      }
    }

    if (!txb.validateSignaturesOfAllInputs()) {
      throw new Error('Transaction input signatures do not validate')
    }

    txb.finalizeAllInputs()

    let builtHex

    try {
      const tx = txb.extractTransaction()
      builtHex = tx.toHex()
    } catch (e) {
      throw new Error('Unable to build Transaction Hex! \n' + e)
    }

    return builtHex
  }

  /**
   * Build & Send the Transaction that we have been forming
   * @param {String} [manualHex] - The hex you wish to send the tx for. If not used, the hex is grabbed from buildTX().
   * @example
   * import * as bip32 from 'bip32'
   * import { Address, TransactionBuilder, Networks } from '@oipwg/hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
   * let account = new Account(accountMaster, networks.flo, false);
   *
   * // F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp
   * let addressNode = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)
   * let address = new Address(addressNode, networks.flo, false);
   *
   * let builder = new TransactionBuilder(networks.flo, {
   *   from: address,
   *   to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001},
   *   floData: "Testing oip-hdmw!"
   * }, account)
   *
   * builder.sendTX().then((txid) => {
   *   console.log(txid)
   * })
   * @return {Promise<string>} Returns a promise that will resolve to the success TXID
   */
  async sendTX (manualHex) {
    let hex = manualHex

    if (!hex) {
      try {
        hex = await this.buildTX()
      } catch (e) { throw new Error('Unable to build Transaction \n' + e) }
    }

    if (hex) {
      console.log('BroadcastHex: ' + hex)

      let response
      try {
        response = await this.coin.explorer.broadcastRawTransaction(hex)
      } catch (e) { throw new Error('Unable to Broadcast Transaction hex! \n' + e) }

      let txid

      // Handle { txid: "txid" }
      if (response && typeof response.txid === 'string') { txid = response.txid }

      /**
       * Handle
       * {
       *    txid: {
       *        result: '05d2dd88d69cc32717d315152bfb474b0b1b561ae9a477aae091714c4ab216ac',
       *        error: null,
       *        id: 47070
       *     }
       * }
       */
      if (response && response.txid && response.txid.result) {
        txid = response.txid.result
      }

      /**
       * Handle
       * {
       *     result: '05d2dd88d69cc32717d315152bfb474b0b1b561ae9a477aae091714c4ab216ac',
       *     error: null,
       *     id: 47070
       * }
       */
      if (response && response.result) {
        txid = response.result
      }

      // Add txid to spentTransactions for each spent input
      for (const inp of this.selected.inputs) {
        for (const addr of this.from) {
          if (addr.getPublicAddress() === inp.address) {
            addr.addSpentTransaction(inp.txId)
          }
        }
      }

      return txid
    } else {
      throw new Error('TransactionBuilder.buildTX() did not create any hex!')
    }
  }
}

module.exports = TransactionBuilder
