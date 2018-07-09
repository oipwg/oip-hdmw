import bitcoin from 'bitcoinjs-lib'
import bip32 from 'bip32'
import bip32utils from 'bip32-utils'
import coinselect from 'coinselect'

import Address from './Address'
import { sign } from './TransactionBuilderHelpers'
import { isValidPublicAddress } from './util'

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
 * 	address: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
 * 	txId: '7687e361f00998f96b29938bf5b7d9003a15ec182c13b6ddbd5adc0f993cbf9c',
 * 	vout: 1,
 * 	scriptPubKey: '76a9141bfcff1731caf3a16225d3e78735ddc229e4fc6c88ac',
 * 	value: 100000 
 * }
 */

/**
 * A Transaction Output
 * @typedef {Object} TXOutput
 * @property {string} address - Base58 Public Address
 * @property {number} value - Amount to send Satoshis 
 * @example
 * {
 * 	address: 'FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu',
 * 	value: 1000
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
	 * import bip32 from 'bip32'
	 * import { Address, TransactionBuilder, Networks } from 'oip-hdmw'
	 * 
	 * var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
	 * var address = new Address(node, Networks.flo, false)
	 * 
	 * var builder = new TransactionBuilder(Networks.flo, {
	 * 	from: address,
	 * 	to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001},
	 * 	floData: "Testing oip-hdmw!"
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
	constructor(coin, options, account){
		this.coin = coin;
		this.account = account;

		// Addresses we are sending from
		this.from = [];
		// Addresses we want to send to & amounts
		this.to = [];

		this.passedOptions = {};

		this.parseOptions(options);	
	}
	/**
	 * Add an Address to send from
	 * @example
	 * import bip32 from 'bip32'
	 * import { Address, TransactionBuilder, Networks } from 'oip-hdmw'
	 * 
	 * var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
	 * var address = new Address(node, Networks.flo, false)
	 *
	 * var builder = new TransactionBuilder(Networks.flo)
	 * builder.addFrom(address);
	 * @param {Address} address - Address to add to the From Addresses
	 */
	addFrom(address){
		if (address instanceof Address){
			if (isValidPublicAddress(address.getPublicAddress(), this.coin.network)){
				this.from.push(address)
			}
		} else {
			throw new Error("From Address MUST BE InstanceOf Address")
		}
	}
	/**
	 * Add an Address and Amount to send to
	 * @example
	 * import bip32 from 'bip32'
	 * import { TransactionBuilder, Networks } from 'oip-hdmw'
	 *
	 * var builder = new TransactionBuilder(Networks.flo)
	 * builder.addTo("FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu", 0.001);
	 * @param {string} address - Base58 Public Address to send To
	 * @param {number} amount - Amount to Send (in whole coin)
	 */
	addTo(address, amount){
		if (isValidPublicAddress(address, this.coin.network) && !isNaN(amount)){
			var tmpTo = {
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
	 * import bip32 from 'bip32'
	 * import { Address, TransactionBuilder, Networks } from 'oip-hdmw'
	 * 
	 * var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
	 * var address = new Address(node, Networks.flo, false)
	 * 
	 * var builder = new TransactionBuilder(Networks.flo)
	 * 
	 * builder.parseOptions({
	 * 	from: address,
	 * 	to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001},
	 * 	floData: "Testing oip-hdmw!"
	 * })
	 */
	parseOptions(options){
		if (!options)
			return

		// Grab the From Addresses, it can be an array or regular.
		if (options.from){
			if (Array.isArray(options.from)){
				for (var addr of options.from){
					this.addFrom(addr)
				}
			} else {
				this.addFrom(options.from)
			}
		}

		// Load who we are sending to
		if (options.to){
			// Check if we are providing an address string and amount seperately
			if (Array.isArray(options.to)){
				for (var payTo of options.to){
					for (var address in payTo){
						this.addTo(address, payTo[address])
					}
				}
			} else {
				for (var address in options.to){
					this.addTo(address, options.to[address])
				}
			}
		}

		this.passedOptions = options;
	}
	/**
	 * Get the Unspent Transaction Outputs for all the From addresses specified.
	 * @example
	 * import bip32 from 'bip32'
	 * import { Address, TransactionBuilder, Networks } from 'oip-hdmw'
	 * 
	 * var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
	 * var address = new Address(node, Networks.flo, false)
	 * 
	 * var builder = new TransactionBuilder(Networks.flo, {
	 * 	from: address,
	 * 	to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001}
	 * })
	 *
	 * builder.getUnspents().then((utxos) => {
	 * 	console.log(utxos)
	 * })
	 * @return {Promise<Array.<utxo>>} Returns a Promise that will resolve to an Array of unspent utxos
	 */
	getUnspents(){
		var addresses = this.from.map((address) => { return address.getPublicAddress() });

		return this.coin.explorer.getAddressesUtxo(addresses).then((utxos) => {
			return utxos
		}).catch(console.error)
	}
	/**
	 * Get calculated Inputs and Outputs (and Fee) for From and To Addresses
	 * @example
	 * import bip32 from 'bip32'
	 * import { Account, Address, TransactionBuilder, Networks } from 'oip-hdmw'
	 *
	 * var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
	 * var account = new Account(accountMaster, networks.flo, false);
	 * 
	 * var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
	 * var address = new Address(node, Networks.flo, false)
	 * 
	 * var builder = new TransactionBuilder(Networks.flo, {
	 * 	from: address,
	 * 	to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001}
	 * }, account)
	 *
	 * builder.buildInputsAndOutputs().then((calculated) => {
	 * 	console.log(calculated.inputs)
	 * 	console.log(calculated.outputs)
	 * 	console.log(calculated.fee)
	 * })
	 * @return {SelectedInputOutput} 
	 */
	buildInputsAndOutputs(){
		return this.discoverChange().then(() => { 
			return this.getUnspents().then((utxos) => {
				var formattedUtxos = utxos.map((utxo) => {
					return {
						address: utxo.address,
						txId: utxo.txid,
						vout: utxo.vout,
						scriptPubKey: utxo.scriptPubKey,
						value: utxo.satoshis
					}
				})

				var targets = this.to.map((toObj) => {
					return {
						address: toObj.address,
						value: Math.floor(toObj.value * this.coin.satPerCoin)
					}
				})

				var extraBytesLength = 0;
				var extraBytes = this.coin.getExtraBytes(this.passedOptions);

				if (extraBytes)
					extraBytesLength = extraBytes.length

				return coinselect(formattedUtxos, targets, Math.ceil(this.coin.feePerByte), extraBytesLength)
			}).catch(console.error)
		}).catch(console.error)
	}
	/**
	 * Discover the used change addresses if we were passed an Account to discover from.
	 * @example
	 * import bip32 from 'bip32'
	 * import { Account, Address, TransactionBuilder, Networks } from 'oip-hdmw'
	 *
	 * var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
	 * var account = new Account(accountMaster, networks.flo, false);
	 * 
	 * var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
	 * var address = new Address(node, Networks.flo, false)
	 * 
	 * var builder = new TransactionBuilder(Networks.flo, {
	 * 	from: address,
	 * 	to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001}
	 * }, account)
	 * 
	 * builder.discoverChange().then(() => {
	 * 	console.log("Done Discovering Change!")
	 * })
	 * @return {Promise}
	 */
	discoverChange(){
		return new Promise((resolve, reject) => {
			if (this.account){
				this.account.discoverChain(1).then(() => {
					resolve()
				}).catch(console.error)
			} else {
				resolve()
			}
		})
	}
	/**
	 * Build the Transaction hex for the From and To addresses
	 * @example
	 * import bip32 from 'bip32'
	 * import { Address, TransactionBuilder, Networks } from 'oip-hdmw'
	 * 
	 * var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
	 * var account = new Account(accountMaster, networks.flo, false);
	 * 
	 * // F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp
	 * var addressNode = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)
	 * var address = new Address(addressNode, networks.flo, false);
	 * 
	 * var builder = new TransactionBuilder(networks.flo, {
	 * 	from: address,
	 * 	to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001},
	 * 	floData: "Testing oip-hdmw!"
	 * }, account)
	 * 
	 * builder.buildTX().then((hex) => {
	 * 	console.log(hex)
	 * })
	 * @return {Promise<string>} Returns a Promise that resolves to the calculated Transaction Hex
	 */
	buildTX(){
		return this.buildInputsAndOutputs().then((selected) => {
			var inputs = selected.inputs;
			var outputs = selected.outputs;
			var fee = selected.fee;

			// inputs and outputs will be undefined if no solution was found
			if (!inputs || !outputs) {
				throw new Error("No Inputs or Outputs selected! Fail!")
				return
			}

			let txb = new bitcoin.TransactionBuilder(this.coin.network)

			txb.setVersion(this.coin.txVersion)

			inputs.forEach(input => txb.addInput(input.txId, input.vout))
			outputs.forEach(output => {
				// watch out, outputs may have been added that you need to provide
				// an output address/script for
				if (!output.address){
					// Check if we have access to an account to get the change address from
					if (this.account){
						var changeAddress = this.account.getNextChangeAddress().getPublicAddress();
						output.address = changeAddress
					} else {
						// If the change is undefined, send change to the first from address
						var changeAddress = this.from[0].getPublicAddress();
						output.address = changeAddress
					}
				}

				txb.addOutput(output.address, output.value)
			})

			for (var i in inputs){
				for (var addr of this.from){
					if (addr.getPublicAddress() === inputs[i].address){
						var extraBytes = this.coin.getExtraBytes(this.passedOptions);

						if (extraBytes){
							sign(txb, extraBytes, parseInt(i), addr.getECPair())
						} else {
							txb.sign(parseInt(i), addr.getECPair())
						}
					}
				}
			}

			try {
				var builtHex = txb.build().toHex();
			} catch (e) {
				console.log(`Caught error while trying to build HEX: ${e}`);
				return
			}

			var extraBytes = this.coin.getExtraBytes(this.passedOptions)

			if (extraBytes)
				builtHex += extraBytes

			return builtHex
		}).catch(err => {
		    console.log(`Caught error in TXB on method: .buildTX(): ${err}`)
            reject(err)
        })
	}
	/**
	 * Build & Send the Transaction that we have been forming
	 * @example
	 * import bip32 from 'bip32'
	 * import { Address, TransactionBuilder, Networks } from 'oip-hdmw'
	 * 
	 * var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
	 * var account = new Account(accountMaster, networks.flo, false);
	 * 
	 * // F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp
	 * var addressNode = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)
	 * var address = new Address(addressNode, networks.flo, false);
	 * 
	 * var builder = new TransactionBuilder(networks.flo, {
	 * 	from: address,
	 * 	to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001},
	 * 	floData: "Testing oip-hdmw!"
	 * }, account)
	 * 
	 * builder.sendTX().then((txid) => {
	 * 	console.log(txid)
	 * })
	 * @return {Promise<string>} Returns a promise that will resolve to the success TXID
	 */
	sendTX(){
		return new Promise((resolve, reject) => {
			this.buildTX().then((hex) => {
				if (hex){
					console.log("BroadcastHex: " + hex)
					this.coin.explorer.broadcastRawTransaction(hex).then((res) => {
						resolve(res.txid)
					}).catch(console.error)
				} else {
					reject(new Error("TransactionBuilder.buildTX() did not create hex!"))
				}
			}).catch(err => {
			    console.log(`Caught error on method: .buildTX: ${err}`)
                reject(err)
            })
		}).catch(err => {
            console.log(`Caught error on promise return on method: .sendTX: ${err}`);
            reject(err)
        })
	}
}

module.exports = TransactionBuilder