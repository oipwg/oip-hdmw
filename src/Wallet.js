import bip39 from 'bip39'
import Exchange from 'oip-exchange-rate'
import EventEmitter from 'eventemitter3'

import Coin from './Coin'
import networks from './networks'

import TransactionBuilder from './TransactionBuilder'
import { isEntropy, isMnemonic, isValidPublicAddress } from './util'

const DEFAULT_SUPPORTED_COINS = ['bitcoin', 'litecoin', 'flo']

/** Full Service [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) Multi-Coin Wallet supporting both sending and recieving payments */
class Wallet {
	/**
	 * Create a new [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) wallet with the supplied settings
	 *
	 * ##### Examples
	 * Create wallet with Random Mnemonic
	 * ```
	 * var wallet = new Wallet()
	 * ```
	 * Create wallet from [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) Mnemonic
	 * ```
	 * var wallet = new Wallet("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
	 * ```
	 * Create wallet from [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) Entropy
	 * ```
	 * var wallet = new Wallet('00000000000000000000000000000000')
	 * ```
	 * Create wallet from Seed Hex
	 * ```
	 * var wallet = new Wallet("5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4")
	 * ```
	 * Create wallet from Seed Buffer
	 * ```
	 * var wallet = new Wallet(new Buffer("5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4", "hex"))
	 * ```
	 * 
	 * @param  {string|Buffer} [seed] - [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) Mnemonic, [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) Entropy, or Seed Hex/Buffer
	 * @param  {Object} [options] - Wallet settings
	 * @param {boolean} [options.discover=true] - Defines if the Wallet should "auto-discover" Coin Account chains or not
	 * @param {Array.<string>} [options.supported_coins=['bitcoin', 'litecoin', 'flo']] - An Array of coins that the Wallet should support
	 * @param {Array.<CoinInfo>} [options.networks] - An array containing a custom coins network info
	 *
	 * @example <caption>Create wallet using Mnemonic</caption>
	 * var wallet = new Wallet("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
	 * 
	 * @return {Wallet}
	 */
	constructor(seed, options){
		// Check if seed is a string or buffer, if not, create a new BIP39 Mnemonic
		if (isMnemonic(seed)){
			this.fromMnemonic(seed)
		} else if (isEntropy(seed)) {
			this.fromEntropy(seed)
		} else if (seed) {
			this.fromSeed(seed);
		} else {
			this.fromMnemonic(bip39.generateMnemonic());
		}

		// Setup EventEmitter to notify when we have changed
		this.event_emitter = new EventEmitter()

		// Set the networks to the imported defaults
		this.networks = networks;

		// Check for custom coins/networks
		if (options && typeof options === "object"){
			// Check if the user has defined their own supported coins for the wallet
			if (options.supported_coins){
				if (typeof options.supported_coins === "string") {
					this.supported_coins = [options.supported_coins]
				} else if (Array.isArray(options.supported_coins)) {
					this.supported_coins = options.supported_coins
				}
			}
			// Check if the user has defined any custom networks that should be imported
			if (options.networks && typeof options.networks === "object"){
				// Attach each passed in network, overwrite if needed
				for (var node in options.networks){
					this.networks[node] = options.networks[node];
				}
			}
		}

		// If we were not passed in a supported coin array by the options, then set it to the defailt options.
		if (!this.supported_coins || !Array.isArray(this.supported_coins))
			this.supported_coins = DEFAULT_SUPPORTED_COINS;

		// The array to hold the live coin objects
		this.coins = {};

		// An optional variable to say if we should auto run address discovery on Account Chains
		if (options && (options.discover || options.discover === false))
			this.discover = options.discover
		else
			this.discover = true

		// Attempt to deserialize if we were passed serialized data
		if (options && options.serialized_data)
			this.deserialize(options.serialized_data)

		// Add all coins
		for (var coin_name of this.supported_coins)
			this.addCoin(coin_name)
	}
	serialize(){
		let serialized_coins = {}

		for (let name in this.coins){
			serialized_coins[name] = this.coins[name].serialize()
		}

		return {
			seed: this.getMnemonic() ? this.getMnemonic() : this.seed,
			coins: serialized_coins
		}
	}
	deserialize(serialized_data){
		if (serialized_data) {
			if (serialized_data.coins){
				for (let name in serialized_data.coins){
					this.addCoin(name, { serialized_data: serialized_data.coins[name] })
				}
			}
		}
	}
	/**
	 * Add a Coin to the Wallet
	 * @param {String} name    - The coin "name" as defined in CoinInfo.name
	 * @param {Object} [options] - Options you want passed to the coin being added
	 */
	addCoin(name, options){
		let opts = options || {}

		if (!opts.discover)
			opts.discover = this.discover

		// If the coin isn't already added AND we have access to a valid network, 
		// then add the coin.
		if (!this.coins[name] && this.networks[name]){
			this.coins[name] = new Coin(this.seed, this.networks[name], opts)
			this.coins[name].onWebsocketUpdate(this._handleWebsocketUpdate.bind(this))
		}
	}
	/**
	 * Get a specific Coin
	 * @param  {string} coin - The coin "name" as defined in CoinInfo.name
	 * @example
	 * var wallet = new Wallet();
	 * var coin = wallet.getCoin("bitcoin")
	 * @return {Coin} Returns the requested Coin
	 */
	getCoin(coin){
		for (var c in this.coins){
			if (c === coin)
				return this.coins[c]
		}
	}
	/**
	 * Get all Coins running inside the Wallet
	 * @example
	 * var wallet = new Wallet();
	 * var coins = wallet.getCoins();
	 * // coins = {
	 * //	"bitcoin": Coin, 
	 * //	"litecoin": Coin, 
	 * //	"flo": Coin
	 * // }
	 * @return {...Coin} Object containing all coins
	 */
	getCoins(){
		return this.coins;
	}
	async _getCoinBalance(coin, options){
		// This is a helper function to catch errors thrown by coin.getBalance() and return them
		let balance

		try {
			balance = await coin.getBalance(options)
		} catch (e) {
			return {
				error: new Error("Unable to get individual Coin Balance \n" + e)
			}
		}

		return {
			balance
		}
	}
    /**
     * Get Coin Balances
     * @param {Object} [options] - The options for searching the Balance of coins
     * @param  {Array} [options.coins=["bitcoin", "litecoin", "flo"]] - An array of coin names you want to get the balances for. If no coins are given, an array of all available coins will be used.
     * @param {Boolean} [options.discover=true] - Should we attempt a new discovery, or just grab the available balances
     * 
     * @return {Promise<Object>} Returns a Promise that will resolve to an Object containing info about each coins balance, along with errors if there are any
     * 
     * @example
     * let wallet = new Wallet(...)
     * wallet.getCoinBalances(["bitcoin", "litecoin", "flo"])
     *
     * //example return
     * {
     *      "flo": 2.16216,
     *      "bitcoin": "error fetching balance",
     *      "litecoin": 3.32211
     * }
     */
    async getCoinBalances(options = { discover: true }){
        const coinnames = options.coins || Object.keys(this.getCoins());

        let coinPromises = {};

        for (let name of coinnames) {
            coinPromises[name] = this._getCoinBalance(this.getCoin(name), options)
        }

        let coin_balances = {};

        for (let coin in coinPromises) {
            let response = await coinPromises[coin]

            if (response.balance)
            	coin_balances[coin] = response.balance
            else
            	coin_balances[coin] = "error fetching balance";
        }

        return coin_balances
    }
    /**
     * Calculate Exchange Rates for supported coins
     * @param {Object} [options] - The options for getting the exchange rates
     * @param {Array}  [options.coins=["bitcoin", "litecoin", "flo"]] - An array of coin names you want to get the balances for. If no coins are given, an array of all available coins will be used.
     * @param {String} [options.fiat="usd"] - The fiat type for which you wish to get the exchange rate for
     *
     * @return {Promise<Object>} Returns a Promise that will resolve to an Object containing info about each coins exchange rate, along with errors if there are any
     * 
     * @example
     * let wallet = new Wallet(...)
     * wallet.getExchangeRates(["flo", "bitcoin", "litecoin"], "usd")
     *
     * //returns
     * {
     *      "flo": expect.any(Number) || "error",
     *      "bitcoin": expect.any(Number) || "error",
     *      "litecoin": expect.any(Number) || "error"
     * }
     */
    async getExchangeRates( options = {fiat: "usd"} ){
        let coins = options.coins || Object.keys(this.getCoins());

        if (!coins) throw new Error("No coins found to fetch exchange rates");

        // Initialize an Exchange object
        if (!this._exchange)
        	this._exchange = new Exchange()

        let promiseArray = {};

        for (let coinname of coins) {
            promiseArray[coinname] = this._exchange.getExchangeRate(coinname, options.fiat);
        }

        let rates = {};

        for (let coinname in promiseArray) {
            try {
                let rate = await promiseArray[coinname];
                rates[coinname] = rate;
            } catch (err) {
                rates[coinname] = "error fetching rate";
            }
        }
        
        return rates;
    }
    /**
     * Calculate Balance of coins after exchange rate conversion
     *
     * * @param {Object} [options] - The options for getting the exchange rates
     * @param {Array}  [options.coins=["bitcoin", "litecoin", "flo"]] - An array of coin names you want to get the balances for. If no coins are given, an array of all available coins will be used.
     * @param {String} [options.fiat="usd"] - The fiat type for which you wish to get the exchange rate for
     * @param {Boolean} [options.discover=true] - Should we attempt a new discovery, or just grab the available balances
     * 
     * @return {Promise<Object>} Returns a Promise that will resolve to the fiat balances for each coin
     * 
     * @example
     * let wallet = new Wallet(...)
     * wallet.getFiatBalances(["flo", "bitcoin", "litecoin"], "usd")
     *
     * //returns
     * {
     *      "flo": expect.any(Number) || "error",
     *      "bitcoin": expect.any(Number) || "error",
     *      "litecoin": expect.any(Number) || "error"
     * }
     */
    async getFiatBalances(options){
        let fiatBalances = {}, balances = {}, xrates = {};

        balances = await this.getCoinBalances(options);
        xrates = await this.getExchangeRates(options);

        for (let coinB in balances) {
            for (let coinX in xrates) {
                if (coinB === coinX) {
                	// Both have been grabbed with no errors
                    if (!isNaN(balances[coinB]) && !isNaN(xrates[coinX])) {
                        fiatBalances[coinB] = balances[coinB] * xrates[coinX]
                    }
                }
            }
        }

        // Set the error state for coins not properly returned
        for (var coin_name of this.supported_coins){
        	if (!fiatBalances[coin_name]){
        		fiatBalances[coin_name] = "error"
        	}
        }

        return fiatBalances
    }
	/**
	 * Init Wallet from BIP39 Mnemonic
	 * @param  {string} mnemonic - A BIP39 Mnemonic String
	 * @example
	 * var wallet = new Wallet();
	 * wallet.fromMnemonic("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
	 * @return {Boolean} Returns if the operation was successful
	 */
	fromMnemonic(mnemonic){
		if (isMnemonic(mnemonic)){
			this.mnemonic = mnemonic;
			this.entropy = bip39.mnemonicToEntropy(this.mnemonic);
			this.seed = bip39.mnemonicToSeedHex(this.mnemonic);

			return true
		}

		return false
	}
	/**
	 * Get the [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) Mnemonic, if defined
	 * @example
	 * var wallet = new Wallet('00000000000000000000000000000000');
	 * var mnemonic = wallet.getMnemonic()
	 * // mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
	 * @return {string} 
	 */
	getMnemonic(){
		return this.mnemonic
	}
	/**
	 * Init Wallet from BIP39 Entropy
	 * @param  {string} entropy - A BIP39 Entropy String
	 * @example
	 * var wallet = new Wallet();
	 * wallet.fromEntropy('00000000000000000000000000000000')
	 * @return {Boolean} Returns if the operation was successful
	 */
	fromEntropy(entropy){
		if (isEntropy(entropy)){
			this.entropy = entropy;
			this.mnemonic = bip39.entropyToMnemonic(this.entropy);
			this.seed = bip39.mnemonicToSeedHex(this.mnemonic);
			return true
		}

		return false
	}
	/**
	 * Get the Entropy value used to generate the [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) Mnemonic.
	 * Note that the Entropy will only be defined if we are creating 
	 * a wallet from Entropy or a Mnemonic, not off of just the Seed Hex
	 * 
	 * @example
	 * var wallet = new Wallet("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about");
	 * var entropy = wallet.getEntropy()
	 * // entropy = '00000000000000000000000000000000'
	 * @return {string}
	 */
	getEntropy(){
		return this.entropy
	}
	/**
	 * Init Wallet from a Seed
	 * @param  {string|Buffer} seed
	 * @example
	 * var wallet = new Wallet();
	 * wallet.fromSeed("example-seed");
	 * @return {Boolean} Returns if the operation was successful
	 */
	fromSeed(seed){
		if (seed instanceof Buffer){
			this.seed = seed.toString('hex');
			return true;
		} else if (typeof seed === "string"){
			this.seed = seed;
			return true;
		}

		return false
	}
	/**
	 * Get the Encoded Seed hex string
	 * @example
	 * var wallet = new Wallet('00000000000000000000000000000000');
	 * var seedHex = wallet.getSeed()
	 * // seedHex = '5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4'
	 * @return {string} The hex string of the seed buffer
	 */
	getSeed(){
		return this.seed
	}
	/**
	 * @param  {Object} options - Options about the payment you wish to send
	 * @param {OutputAddress|Array.<OutputAddress>} options.to - Define outputs for the Payment
	 * @param {string|Array.<string>} [options.coin] - Define which coin you would like to send from
	 * @param {string|Array.<string>} [options.from=All Addresses in Coin] - Define what public address(es) you wish to send from
	 * @param {number|Array.<number>} [options.fromAccounts=All Accounts in Coin] - Define what Accounts on the Coin you wish to send from
	 * @param {Boolean} [options.discover=true] - Should discovery happen before sending payment
	 * @param {string} [options.floData=""] - Flo data to attach to the transaction
	 * @return {Promise<string>} Returns a promise that will resolve to the success TXID
	 */
	async sendPayment(options){
		if (!options)
			throw new Error("You must define payment options!")

		if (!options.to)
			throw new Error("You must define your payment outputs!")

		// Check if the user defined a coin name to send from
		if (options.coin){
			if (typeof options.coin !== "string")
				throw new Error("Send From Coin option must be the string name of the Coin!")

			if (this.getCoin(options.coin)){
			    try {
                    return this.getCoin(options.coin).sendPayment(options)
                } catch (err) {throw new Error(err)}
			}
		} else {
			// If coin name is not passed, attempt to match addresses to a Coin!
			var coinMatch = "";
			var singleMatch = false;

			if (Array.isArray(options.to)){
				for (var coin in this.networks){
					var allMatchCoin = true;

					for (var toAdr of options.to){
						for (var adr in toAdr){
							if (isValidPublicAddress(adr, this.networks[coin].network)){
								coinMatch = this.networks[coin].name;
							} else {
								allMatchCoin = false;
							}
						}
					}

					// If not all addresses are valid, don't match to coin
					if (!allMatchCoin && coinMatch === this.networks[coin].name)
						coinMatch = "";
				}
			} else {
				for (var coin in this.networks){
					for (var adr in options.to){
						if (isValidPublicAddress(adr, this.networks[coin].network)){
							coinMatch = this.networks[coin].name;
							singleMatch = true;
						}
					}
				}
			}
			if (coinMatch !== ""){
				if (this.getCoin(coinMatch)) {
				    try {
                        return this.getCoin(coinMatch).sendPayment(options)
                    } catch (err) {throw new Error(err)}
                }
				else
					throw new Error("Cannot get Coin for matched network! " + coinMatch)
			} else {
				throw new Error("Not all to addresses match any Coin network! Please check your outputs.")
			}
		}
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
	 * import { Coin, Networks } from 'oip-hdmw'
	 *
	 * var bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin, false)
	 * 
	 * bitcoin.onWebsocketUpdate((address) => {
	 * 		console.log(address.getPublicAddress() + " Recieved a Websocket Update!")
	 * })
	 */
	onWebsocketUpdate(subscriber_function){
		this.event_emitter.on("websocket_update", subscriber_function)
	}
}

module.exports = Wallet