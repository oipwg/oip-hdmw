import bip32 from 'bip32'
import bip32utils from 'bip32-utils'

import Account from './Account'

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
	 * Get the balance for the entire coin, or a specific address/array of addresses, NOT YET IMPLEMENTED!
	 * @param  {Object} [options] - Specific options defining what balance to get back
	 * @param {string} [options.address] - Get Balance for Single Address
	 * @param {Array.<string>} [options.addresses] - Get Balance for Addresses
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
		if (options.address){

		}
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
	 * Send payment, NOT YET IMPLEMENTED!
	 * @param  {Object} options
	 * @return {Promise<string>} A Promise that will resolve to the success txid
	 */
	sendPayment(options){

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

		if (!this.accounts[num])
			return this.addAccount(num);

		return this.accounts[num];
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
	 * @return {Promise<Array.<Account>>}
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

					account.discoverChains().then(checkIfDiscoveryComplete)
				} else {
					resolve(discoveredAccounts)
				}
			}

			// Reset the internal accounts
			this.accounts = {};

			// Get the Account #0 and start discovery there.
			this.getAccount(0).discoverChains().then(checkIfDiscoveryComplete)
		})
	}
}

module.exports = Coin