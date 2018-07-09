import bip32 from 'bip32'
import bip32utils from 'bip32-utils'

import Account from './Account'
import TransactionBuilder from './TransactionBuilder'

const COIN_START = 0x80000000;

/**
 * Manage Accounts for a specific Coin
 */
class Coin {
	/**
	 * Create a new Coin object to interact with Accounts and Chains for that coin. This spawns a BIP44 compatable wallet.
	 *
	 * ##### Examples
	 * Create a new Coin using a specified seed.
	 *```
	 *import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
	 *```
	 * Create a new Coin using a specified seed, don't auto discover.
	 *```
	 *import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin, false)
	 *```
	 * @param  {string} seed - Master Seed hex (needs to be at least 128 bits)
	 * @param  {CoinInfo} coin - The CoinInfo containing network & version variables
	 * @param  {boolean} [discover=true] - Should the Coin auto-discover Accounts and Chains
	 * @return {Coin}
	 */
	constructor(seed, coin, discover){
		this.coin = coin;

		if (discover || discover === false)
			this.discover = discover
		else
			this.discover = true

		var mainRoot = bip32.fromSeed(new Buffer(seed, "hex"), this.coin.network);

		var bip44Num = this.coin.network.slip44;

		// Check if we need to convert the hexa to the index
		if (bip44Num >= COIN_START)
			bip44Num -= COIN_START;

		this.root = mainRoot.derivePath("m/44'/" + bip44Num + "'");

		this.accounts = {}

		// Default add account zero
		this.addAccount(0);

		if (this.discover){
			this.discoverAccounts()
		}
	}
	/**
	 * Get the balance for the entire coin, or a specific address/array of addresses
	 * @param  {Object} [options] - Specific options defining what balance to get back
	 * @param {Boolean} [options.discover=true] - Should the Coin discover Accounts
	 * @param {number|Array.<number>} [options.accounts=All Accounts in Coin] - Get Balance for defined Accounts
	 * @param {string|Array.<string>} [options.addresses=All Addresses in each Account in Coin] - Get Balance for defined Addresses
	 * @example <caption> Get Balance for entire Coin</caption>
	 * import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
	 * bitcoin.getBalance().then((balance) => {
	 *  	console.log(balance)
	 * })
	 * @return {Promise<number>} A Promise that will resolve to the balance of the entire Coin
	 */
	getBalance(options){
		return new Promise((resolve, reject) => {
			if (options && options.test_error)
				reject(new Error("Testing error thrown in getBalance, check your options for test_error and remove it if you are getting this on accident!"))

			var countBalance = () => {
				var accounts_to_search = [];

				// Check if we are an array (ex. [0,1,2]) or just a number (ex. 1)
				if (options && Array.isArray(options.accounts)) {
					for (var accNum of options.accounts) {
						if (!isNaN(accNum)) {
							accounts_to_search.push(accNum)
						}
					}
				} else if (options && !isNaN(options.accounts)) {
					accounts_to_search.push(options.accounts)
				} else {
					for (var accNum in this.accounts){
						accounts_to_search.push(accNum)
					}
				}

				var totalBalance = 0;

				var addrsToSearch, disc;

				if (options && options.discover === false)
					disc = false;

				if (options && options.addresses && (typeof options.addresses === "string" || Array.isArray(options.addresses))){
					addrsToSearch = options.addresses
				}

				var addBalance = (balance, id) => {
					accounts_to_search.splice(accounts_to_search.indexOf(id));
					totalBalance += balance;

					if (accounts_to_search.length === 0)
						resolve(totalBalance);
				}

				for (accNum of accounts_to_search){
					if (this.accounts[accNum]){
						this.accounts[accNum].getBalance({
							discover: disc,
							addresses: addrsToSearch,
							id: accNum
						}).then(addBalance).catch( (err) => {
						    console.log(`Error in getBalances() on line 125`)
                            reject(err);
                        })
					}
				}
			}

			if (options && options.discover === false){
				countBalance();
			} else {
				this.discoverAccounts().then(countBalance).catch( (err) => {
                    console.log(`Error in getBalances() on line 136`)
                    reject(err)
                })
			}
		})
	}
	/**
	 * Get a specific Address
	 * @param  {number} [account_number=0] - Number of the account you wish to get the Address from
	 * @param  {number} [chain_number=0] - Number of the Chain you wish to get the Address from
	 * @param  {number} [address_index=0] - Index of the Address you wish to get
	 * @return {Address}
	 */
	getAddress(account_number, chain_number, address_index){
		return this.getAccount(account_number || 0).getAddress(chain_number, address_index);
	}
	/**
	 * Get the Main Address for a specific Account number. 
	 * This is the Address at index 0 on the External Chain of the Account.
	 * @param  {number} [account_number=0] - Number of the Account you wish to get
	 * @example <caption>Get Main Address for Coin</caption>
	 * import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
	 * var mainAddress = bitcoin.getMainAddress()
	 * @example <caption>Get Main Address for Account #1 on Coin</caption>
	 * import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
	 * var mainAddress = bitcoin.getMainAddress(1)
	 * @return {Address}
	 */
	getMainAddress(account_number){
		return this.getAccount(account_number || 0).getMainAddress()
	}
	/**
	 * Send a Payment to specified Addresses and Amounts
	 * @param  {Object} options - the options for the specific transaction being sent
	 * @param {OutputAddress|Array.<OutputAddress>} options.to - Define outputs for the Payment
	 * @param {string|Array.<string>} [options.from=All Addresses in Coin] - Define what public address(es) you wish to send from
	 * @param {number|Array.<number>} [options.fromAccounts=All Accounts in Coin] - Define what Accounts you wish to send from
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

				var allAddresses = [];

				// Add all Addresses from selected accounts to array
				for (var account in this.accounts){
					// Check if we are defining what accounts to send the payment from
					if (options.fromAccounts) {
						// Check if it is a single account number, or an array of account numbers
						if (typeof options.fromAccounts === "number") {
							// If we match the passed account number, set the grabbed addresses
							if (options.fromAccounts === parseInt(account)){
								allAddresses = this.accounts[account].getAddresses()
							}
						} else if (Array.isArray(options.fromAccounts)){
							// If we are an array, itterate through
							for (var acs of options.fromAccounts){
								if (acs === parseInt(account)){
									allAddresses = allAddresses.concat(this.accounts[account].getAddresses())
								}
							}
						}
					} else {
						allAddresses = allAddresses.concat(this.accounts[account].getAddresses())
					}
				}

				// Check if we define what address we wish to send from
				if (options.from) {
					// Check if it is a single from address or an array
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
					sendFrom = allAddresses;
				}

				if (sendFrom.length === 0){
					reject(new Error("No Addresses match defined options.from Addresses!"))
					return;
				}

				var newOpts = options;

				newOpts.from = sendFrom;

				var txb = new TransactionBuilder(this.coin, newOpts);
				txb.sendTX().then(resolve).catch(reject);
			}

			if (options.discover === false){
				processPayment();
			} else {
				this.discoverAccounts().then(processPayment).catch(reject)
			}
		})
	}
	/**
	 * Get the Extended Private Key for the root path. This is derived at m/44'/coin_type'
	 * @example <caption>Get the Extended Private Key for the entire Coin</caption>
	 * import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
	 * var extPrivateKey = bitcoin.getExtendedPrivateKey()
	 * // extPrivateKey = xprv9x8MQtHNRrGgrnWPkUxjUC57DWKgkjobwAYUFedxVa2FAA5qaQuGqLkJnVcszqomTar51PCR8JiKnGGgzK9eJKGjbpUirKPVHxH2PU2Rc93
	 * @return {string} The Extended Private Key
	 */
	getExtendedPrivateKey(){
		return this.root.toBase58();
	}
	/**
	 * Get the Neutered Extended Public Key for the root path. This is derived at m/44'/coin_type'
	 * @example <caption>Get the Extended Private Key for the entire Coin</caption>
	 * import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
	 * var extPublicKey = bitcoin.getExtendedPrivateKey()
	 * // extPublicKey = xpub6B7hpPpGGDpz5GarrWVjqL1qmYABACXTJPU5433a3uZE2xQz7xDXP94ndkjrxogjordTDSDaHY4i5G4HqRH6E9FJZk2F4ED4cbnprW2Vm9v
	 * @return {string} The Extended Public Key
	 */
	getExtendedPublicKey(){
		return this.root.neutered().toBase58();
	}
	/**
	 * Get the Account at the specified number
	 * @param  {number} [account_number=0]
	 * @example <caption>Get Default Account</caption>
	 * import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
	 * var account = bitcoin.getAccount()
	 * @example <caption>Get Account #1</caption>
	 * import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
	 * var account = bitcoin.getAccount(1)
	 * @return {Account}
	 */
	getAccount(account_number){
		var num = account_number || 0;

		if (typeof account_number === "string" && !isNaN(parseInt(account_number)))
			num = parseInt(account_number)

		if (!this.accounts[num])
			return this.addAccount(num);

		return this.accounts[num];
	}
	/**
	 * Get all Accounts on the Coin
	 * @example
	 * import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
	 * var accounts = bitcoin.getAccounts()
	 * // accounts = {
	 * // 	0: Account,
	 * // 	1: Account
	 * // }
	 * @return {...Account} Returns a JSON object with accounts
	 */
	getAccounts(){
		return this.accounts;
	}
	/**
	 * Add the Account at the specified number, if it already exists, it returns the Account.
	 * If the Account does not exist, it will create it and then return it.
	 * @param  {number} [account_number=0]
	 * @param {Boolean} [discover=discover Set in Coin Constructor] - Should the Account start auto-discovery.
	 * @example
	 * import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
	 * var account = bitcoin.addAccount(1)
	 * @return {Account}
	 */
	addAccount(account_number, discover){
		var num = account_number || 0;

		if (typeof account_number === "string" && !isNaN(parseInt(account_number)))
			num = parseInt(account_number)

		// if the account has already been added, just return 
		if (this.accounts[num])
			return this.getAccount(num);

		var accountMaster = this.root.deriveHardened(num);

		var shouldDiscover;

		if (discover !== undefined)
			shouldDiscover = discover
		else
			shouldDiscover = this.discover

		var account = new Account(accountMaster, this.coin, shouldDiscover);

		this.accounts[num] = account;

		return this.getAccount(num);
	}
	/**
	 * Get the CoinInfo for the Coin
	 * @example
	 * import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
	 * var coin_info = bitcoin.getCoinInfo()
	 * // coin_info = Networks.bitcoin
	 * @return {CoinInfo}
	 */
	getCoinInfo(){
		return this.coin
	}
	/**
	 * Discover all Accounts for the Coin
	 * @example
	 * import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin, false)
	 * bitcoin.discoverAccounts().then((accounts) => {
	 * 	console.log(accounts.length)
	 * })
	 * @return {Promise<Array.<Account>>} Returns a Promise that will resolve to an Array of Accounts once complete
	 */
	discoverAccounts(){
		return new Promise((resolve, reject) => {
			var checkIfDiscoveryComplete = () => {
				var discoveredAccounts = [];
				var highestAccountNumber = 0;

				for (var accNum in this.accounts){
					discoveredAccounts.push(this.accounts[accNum]);

					if (accNum > highestAccountNumber){
						highestAccountNumber = accNum;
					}
				}

				if (this.accounts[highestAccountNumber].getAddresses().length > 0){
					var account = this.getAccount(highestAccountNumber + 1, false)

					account.discoverChains().then(checkIfDiscoveryComplete).catch(err => {
                        resolve(discoveredAccounts)
                    })
				} else {
					resolve(discoveredAccounts)
				}
			}

			// Reset the internal accounts
			this.accounts = {};

			// Get the Account #0 and start discovery there.
			this.getAccount(0).discoverChains().then(checkIfDiscoveryComplete).catch(err => {
                console.log(`Error in disovery on line 417`)
                reject(err)
            })
		})
	}
}

module.exports = Coin