import bitcoin from 'bitcoinjs-lib'
import bip32 from 'bip32'
import bip32utils from 'bip32-utils'
import EventEmitter from 'eventemitter3'

import Address from './Address'
import TransactionBuilder from './TransactionBuilder'
import { toBase58, isValidPublicAddress, discovery } from './util'

// Helper CONSTS (used in other consts)
const SECOND = 1000;
const MINUTE = 60 * SECOND;

// Class Constants
const CHAIN_EXPIRE_TIMEOUT = 30 * MINUTE;
const GAP_LIMIT = 20;

const CUSTOM_ADDRESS_FUNCTION = (node, network) => {
	return { address: node, network: network }
}

/**
 * A BIP32 Node that manages Derivation of Chains and Addresses. This is created from the [`bip32` npm package managed by `bitcoinjs`](https://github.com/bitcoinjs/bip32).
 * @typedef {Object} bip32
 * @example <caption>Spawn a Bitcoin bip32 Node</caption>
 * import bip32 from 'bip32';
 * 
 * var bip32Node = bip32.fromBase58("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
 * @example <caption>Spawn a Flo bip32 Node</caption>
 * import bip32 from 'bip32';
 * import { Networks } from 'oip-hdmw';
 * 
 * var bip32Node = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
 */

/**
 * A BIP32 Chain manager. This is created from the [`bip32-utils` npm package managed by `bitcoinjs`](https://github.com/bitcoinjs/bip32-utils).
 * @typedef {Object} bip32utilschain
 * @example
 * import bip32 from 'bip32';
 * import bip32utils from 'bip32-utils';
 * 
 * var bip32Node = bip32.fromBase58("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
 * var chain = new bip32utils.Chain(bip32Node)
 */

/**
 * Manages Chains and Addresses for a specific BIP32/BIP44 Account
 */
class Account {
	/**
	 * Create a new Account to manage Chains and Addresses for based on a BIP32 Node
	 *
	 * ##### Examples
	 * Create a Bitcoin Account
	 * ```
	 * import { Account, Networks } from 'oip-hdmw';
	 *
	 * var account_master = bip32.fromBase58("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
	 *
	 * var account = new Account(account_master, Networks.bitcoin);
	 * ```
	 * Create a Flo Account
	 * ```
	 * import { Account, Networks } from 'oip-hdmw';
	 *
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo);
	 * ```
	 * @param  {bip32} account_master - The BIP32 Node to derive Chains and Addresses from.
	 * @param  {CoinInfo} coin - The CoinInfo for the Account
	 * @param {Object} [options] - The Options of the Account
	 * @param  {boolean} [options.discover=true] - Should the Account auto-discover Chains and Addresses
	 * @param {Object} [options.serialized_data] - Serialized data to load the Account from
	 * @return {Account}
	 */
	constructor(account_master, coin, options){
		this.account_master = account_master;
		this.coin = coin || {};

		var external = this.account_master.derive(0)
		var internal = this.account_master.derive(1)

		this.account = new bip32utils.Account([
			new bip32utils.Chain(external, undefined, CUSTOM_ADDRESS_FUNCTION),
			new bip32utils.Chain(internal, undefined, CUSTOM_ADDRESS_FUNCTION)
		])

		this.addresses = {}

		this.chains = {
			0: {
				index: 0,
				lastUpdate: 0
			},
			1: {
				index: 1,
				lastUpdate: 0
			}
		}

		// Setup EventEmitter to notify when we have changed
		this.event_emitter = new EventEmitter()

		this.discover = true;

		if (options && options.discover !== undefined)
			this.discover = options.discover

		// Discover both External and Internal chains
		if (options && options.serialized_data)
			this.deserialize(options.serialized_data)

		if (this.discover){
			this.discoverChains()
		}
	}
	serialize(){
		var addresses = this.getAddresses()

		var serialized_addresses = addresses.map((address) => {
			return address.serialize()
		})

		return {
			extended_private_key: this.getExtendedPrivateKey(), 
			addresses: serialized_addresses,
			chains: this.chains
		}
	}
	deserialize(serialized_data){
		if (serialized_data){
			// Rehydrate Addresses
			if (serialized_data.addresses){
				let rehydrated_addresses = []

				for (let address of serialized_data.addresses){
					rehydrated_addresses.push(new Address(address.wif, this.coin, address))
				}

				for (let address of rehydrated_addresses){
					this.addresses[address.getPublicAddress()] = address
				}
			}
			// Rehydrate Chain info
			if (serialized_data.chains){
				this.chains = serialized_data.chains
			}
		}
	}
	/**
	 * Get the Main Address for a specified Chain and Index on the Chain.
	 * @param  {number}	[chain_number=0] - Number of the specific chain you want to get the Main Address for
	 * @param  {number} [main_address_number=0] - Index of the Main Address on the specified chain
	 * @example
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * var address = account.getMainAddress()
	 * // address.getPublicAddress() = FPznv9i9iHX5vt4VMbH9x2LgUcrjtSn4cW
	 * @return {Address}
	 */
	getMainAddress(chain_number, main_address_number){
		return this.getAddress(chain_number, main_address_number)
	}
	/**
	 * Get the Address for a specified Chain and Index on the Chain.
	 * @param  {number}	[chain_number=0] - Number of the specific chain you want to get the Address from
	 * @param  {number} [address_number=0] - Index of the Address on the specified chain
	 * @example <caption>Get the address on Chain `0` at Index `10`</caption>
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * var address = account.getAddress(0, 10)
	 * // address.getPublicAddress() = F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp
	 * @return {Address}
	 */
	getAddress(chain_number, address_number){
		var addr = CUSTOM_ADDRESS_FUNCTION(this.account.getChain(chain_number || 0).__parent.derive(address_number || 0), this.coin.network);
		
		let tmpHydratedAddr = new Address(addr, this.coin, false)

		// Attempt to match to address that we already have
		if (this.addresses[tmpHydratedAddr.getPublicAddress()])
			return this.addresses[tmpHydratedAddr.getPublicAddress()]
		else
			this.addresses[tmpHydratedAddr.getPublicAddress()] = tmpHydratedAddr

		return tmpHydratedAddr
	}
	/**
	 * Get all derived Addresses for the entire Account, or just for a specific Chain.
	 * @param  {number}	[chain_number] - Number of the specific chain you want to get the Addresses from
	 * @example <caption>Get all Addresses on the Account</caption>
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * var addresses = account.getAddresses()
	 * // addresses = [Address, Address, Address]
	 * @example <caption>Get the addresses on Chain `0`</caption>
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * var addresses = account.getAddresses(0)
	 * // addresses = [Address, Address, Address]
	 * @return {Array.<Address>}
	 */
	getAddresses(chain_number){
		var addrs = [];

		if (chain_number && typeof chain_number === "number"){
			for (var addr in this.addresses){
				var chain = this.account.getChain(chain_number);
				var addresses = chain.addresses.map((ad) => {
					return new Address(ad, this.coin, false)
				})
				for (var adr of addresses){
					if (adr.getPublicAddress() === this.addresses[addr].getPublicAddress()){
						addrs.push(this.addresses[addr])
					}
				}
			}
		} else {
			for (var addr in this.addresses){
				addrs.push(this.addresses[addr])
			}
		}

		return addrs
	}
	/**
	 * Get all Used Addresses (addresses that have recieved at least 1 tx) for the entire Account, or just for a specific Chain.
	 * @param  {number}	[chain_number] - Number of the specific chain you want to get the Addresses from
	 * @example <caption>Get all Used Addresses on the Account</caption>
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * var addresses = account.getUsedAddresses()
	 * // addresses = [Address, Address, Address]
	 * @example <caption>Get the addresses on Chain `0`</caption>
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * var addresses = account.getUsedAddresses(0)
	 * // addresses = [Address, Address, Address]
	 * @return {Array.<Address>}
	 */
	getUsedAddresses(chain_number){
		let used_addresses = []
		let all_addresses = this.getAddresses()

		for (let address of all_addresses)
			if (address.getTotalReceived() > 0)
				used_addresses.push(address)

		return used_addresses
	}
	/**
	 * Get the Balance for the entire Account
	 * @example
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * account.getBalance({ discover: true }).then((balance) => {
	 * 	console.log(balance);
	 * })
	 * @param {Object} [options] Specific options defining what balance to get back
	 * @param {Boolean} [options.discover=true] - Should the Account discover Chains and Addresses
	 * @param {string|Array.<string>} [options.addresses] - Address, or Addresses to get the balance of
	 * @param {number} [options.id] - The ID number to return when the Promise resolves
	 * @return {Promise<number>} - Returns a Promise that will resolve to the total balance.
	 */
	async getBalance(options){
		var discover = this.discover;

		if (options && options.discover !== undefined)
			discover = options.discover;

		if (discover){
			try {
				await this.discoverChains()
			} catch (e) { throw new Error("Unable to discover Account Chains in Account getBalance! \n" + e) }
		}

		var totalBal = 0;

		// Iterate through each of the addresses we have found
		for (var addr in this.addresses){
			// Are we searching only for a single addresses balance?
			if (options && options.addresses && typeof options.addresses === "string"){
				if (addr === options.addresses){
					totalBal += this.addresses[addr].getBalance()
				}
			// Are we searching for only the addresses in an array?
			} else if (options && options.addresses && Array.isArray(options.addresses)){
				for (var ad of options.addresses){
					if (addr === ad){
						totalBal += this.addresses[addr].getBalance()
					}
				}
			// If not the first two, then just add them all up :)
			} else {
				totalBal += this.addresses[addr].getBalance()
			}
		}

		var balance_data = {
			balance: totalBal
		}

		if (options && options.id)
			balance_data.id = options.id;

		return balance_data
	}
	/**
	 * Get the Next Chain Address for a specified chain
	 * @param  {number} [chain_number=0] - The specific chain that you want to get the next address from
	 * @example <caption>Get the next Chain Address on Chain #1</caption>
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * var address = account.getNextChainAddress(1)
	 * @return {Address}
	 */
	getNextChainAddress(chain_number){
		return new Address(this.account.getChain(chain_number || 0).next(), this.coin, false);
	}
	/**
	 * Get the Next Change Address from the "Internal" chain
	 * @example
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * var address = account.getNextChangeAddress()
	 * @return {Address}
	 */
	getNextChangeAddress(){
		// We use Chain 1 since that is the "Internal" chain used for generating change addresses.
		return this.getNextChainAddress(1)
	}
	/**
	 * Send a Payment to specified Addresses and Amounts
	 * @param  {Object} options - the options for the specific transaction being sent
	 * @param {OutputAddress|Array.<OutputAddress>} options.to - Define outputs for the Payment
	 * @param {string|Array.<string>} [options.from=All Addresses in Account] - Define what public address(es) you wish to send from
	 * @param {Boolean} [options.discover=true] - Should discovery happen before sending payment
	 * @param {string} [options.floData=""] - Flo data to attach to the transaction
	 * @return {Promise<string>} - Returns a promise that will resolve to the success TXID
	 */
	sendPayment(options){
		return new Promise((resolve, reject) => {
			if (!options)
				reject(new Error("You must define your payment options!"))

			var processPayment = () => {
				var sendFrom = [];

				var allAddresses = this.getAddresses();

				// Check if we define what address we wish to send from
				if (options.from) {
					if (typeof options.from === "string") {
						for (var address of allAddresses){
							if (address.getPublicAddress() === options.from){
								sendFrom.push(address);
							}
						}
					} else if (Array.isArray(options.from)) {
						for (var adr of options.from){
							for (var address of allAddresses){
								if (address.getPublicAddress() === adr){
									sendFrom.push(address);
								}
							}
						}
					}
				// else add all the addresses on the Account that have recieved any txs
				} else {
					for (let address of allAddresses){
						if (address.getBalance() >= 0){
							sendFrom.push(address)
						}
					}
				}

				if (sendFrom.length === 0){
					reject(new Error("No Addresses match defined options.from Addresses!"))
					return;
				}

				var newOpts = options;

				newOpts.from = sendFrom;

				var txb = new TransactionBuilder(this.coin, newOpts);

				txb.sendTX().then(resolve);
			}

			if (options.discover === false){
				processPayment();
			} else {
				this.discoverChains().then(processPayment)
			}
		})
	}
	/**
	 * Get the Extended Private Key for the Account
	 * @example
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * var extPrivateKey = account.getExtendedPrivateKey()
	 * // extPrivateKey = Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC
	 * @return {string}
	 */
	getExtendedPrivateKey(){
		return this.account_master.toBase58()
	}
	/**
	 * Get the Extended Public Key for the Account
	 * @example
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * var extPublicKey = account.getExtendedPublicKey()
	 * // extPublicKey = Fpub1BPo8vEQqDkoDQmDqcJ8WFHD331AMpd7VU7atCJsix8xbHwN6K9wfDLjZKnW9fUw5uJg8UJMLhQ5W7gTxv6DbkfPoeJbBpMaUHrULxzVnSy
	 * @return {string}
	 */
	getExtendedPublicKey(){
		return this.account_master.neutered().toBase58()
	}
	/**
	 * Get the specified Chain number
	 * @param {number} chain_number - The number of the chain you are requesting
	 * @example <caption>Get Chain 0</caption>
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * var chain = account.getChain(0)
	 * @return {bip32utilschain}
	 */
	getChain(chainNumber){
		return this.account.getChain(chainNumber)
	}
	async _discoverChain(chainNumber, gapLimit) {
		var chains = this.account.getChains()
		var chain = chains[chainNumber].clone()

		var discovered

		try {
			discovered = await discovery(chain, gapLimit, this._chainPromise, chainNumber, this.coin)
		} catch(e){
			throw new Error("Discovery error in _discoverChain #" + chainNumber + " \n" + e)
		}

		// throw away EACH unused address AFTER the last unused address
		var unused = discovered.checked - discovered.used
		for (var j = 1; j < unused; ++j) chain.pop()

		// override the internal chain
		this.account.chains[discovered.chainIndex] = chain

		for (let address of discovered.addresses)
			this.addresses[address.getPublicAddress()] = address

		return discovered
	}
	async _chainPromise(addresses, coin){
		var results = {};
		var allAddresses = []

		var addressPromises = [];

		for (var addr of addresses){
			var address = new Address(addr, coin, false);

			var prom = address.updateState()

			// This will only be called for any rejections AFTER the first one,
			// please take a look at the comment below for more info.
			prom.catch((e) => {})

			addressPromises.push(address.updateState())
		}

		let promiseResponses = []

		try {
			promiseResponses = await Promise.all(addressPromises)
		} catch (e) {
			// This will still be called even though we use prom.catch() above.
			// The first promise rejection will be caught here, all other promises
			// that reject AFTER the first, will be caught in the above prom.catch() function.

			throw new Error("Unable to update Address state in _chainPromise \n" + e)
		}

		for (var address of promiseResponses){
			if (address.getTotalReceived() > 0){
				results[address.getPublicAddress()] = true
			} else {
				results[address.getPublicAddress()] = false
			}

			// Store all addresses
			allAddresses.push(address)
		}

		return {results: results, addresses: allAddresses}
	}
	/**
	 * Discover Used and Unused addresses for a specified Chain number
	 * @param  {number} chain_number - The number of the chain you wish to discover
	 * @example <caption>Discover Chain 0</caption>
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * account.discoverChain(0).then((acc) => {
	 * 	console.log(acc.getChain(0).addresses)
	 * })
	 * @return {Promise<Account>} - A Promise that once finished will resolve to the Account (now with discovery done)
	 */
	async discoverChain(chain_number){
		try {
			var discovered = await this._discoverChain(chain_number, GAP_LIMIT)
		} catch (e) { throw new Error("Unable to discoverChain #" + chain_number + "! \n" + e) }

		this.chains[chain_number] = { lastUpdate: Date.now() }

		return this
	}
	/**
	 * Discover all Chains
	 * @example
	 * import bip32 from 'bip32'
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * account.discoverChains().then((acc) => {
	 * 	console.log(acc.getChain(0).addresses)
	 * 	console.log(acc.getChain(1).addresses)
	 * })
	 * @return {Promise<Account>} - A Promise that once finished will resolve to the Account (now with discovery done)
	 */
	async discoverChains(){
		var chainsToDiscover = [0, 1]

		var account

		// Do each chain one at a time in case it crashes and errors out.
		for (var c of chainsToDiscover){
			try {
				account = await this.discoverChain(c)
			} catch (e) { throw new Error("Unable to discoverChains! \n" + e) }
		}

		this._subscribeToAddressWebsocketUpdates()

		return account
	}
	/**
	 * Internal function used to subscribe to WebSocket updates for All Discovered Addresses
	 */
	_subscribeToAddressWebsocketUpdates(){
		let allAddresses = this.getAddresses()

		for (let address of allAddresses)
			address.onWebsocketUpdate(this._handleWebsocketUpdate.bind(this))
	}
	/**
	 * Internal function used to process Address updates streaming in from Websockets,
	 * emits an update that can be subscribed to with onWebsocketUpdate
	 * @param  {Object} update - Websocket Update Data
	 */
	_handleWebsocketUpdate(address){
		this.event_emitter.emit("websocket_update", address)
	}
	/**
	 * Subscribe to events that are emitted when an Address update is recieved via Websocket
	 * @param  {function} subscriber_function - The function you want called when there is an update
	 *
	 * @example
	 * import { Account, Networks } from 'oip-hdmw'
	 * 
	 * var account_master = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	 *
	 * var account = new Account(account_master, Networks.flo, false);
	 * 
	 * account.onWebsocketUpdate((address) => {
	 * 		console.log(address.getPublicAddress() + " Recieved a Websocket Update!")
	 * })
	 */
	onWebsocketUpdate(subscriber_function){
		this.event_emitter.on("websocket_update", subscriber_function)
	}
}

module.exports = Account