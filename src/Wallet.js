import bip39 from 'bip39'

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
	 * @param  {Object} [settings] - Wallet settings
	 * @param {boolean} [settings.discover=true] - Defines if the Wallet should "auto-discover" Coin Account chains or not
	 * @param {Array.<string>} [settings.supported_coins=['bitcoin', 'litecoin', 'flo']] - An Array of coins that the Wallet should support
	 * @param {Array.<CoinInfo>} [settings.networks] - An array containing a custom coins network info
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

		// Set the networks to the imported defaults
		this.networks = networks;

		// Check for custom options
		if (options && typeof options === "object"){3
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

		// Validate that each supported coin has a pair network
		for (var coin of this.supported_coins){
			for (var coinNet in this.networks){
				// If we have found a pair, attach a live coin object
				if (coin === coinNet){
					this.coins[coin] = new Coin(this.seed, this.networks[coinNet], this.discover)
				}
			}
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
    /**
     * Get Coin Balances
     * @param  {array} [coins_array=this.getCoins()]    - An array of coins you want to get the balances for. If no coins are given, an array of all available coins will be used.
     * @return {object} coin_balances
     * @example
     * let wallet = new Wallet()
     * wallet.getCoinBalances(["flo", "bitcoin", "litecoin"])
     *
     * //example return
     * {
     *      "flo": 2.16216,
     *      "bitcoin": "error fetching balance",
     *      "litecoin": 3.32211
     * }
     */
    async getCoinBalances(coins_array){
        const coins = coins_array || Object.keys(this.getCoins());
        let _coins = this.getCoins();
        // console.log(`Check to see coin_array: ${coins_array} -- ${coins} -- ${_coins}`)

        let coinPromises = {};
        let coin_balances = {};

        for (let coin of coins) {
            try {
                coinPromises[coin] = _coins[coin].getBalance({discover: true})
            } catch (err) {
                coinPromises[coin] = `${err}`;
                // console.log(`Error on fetching promise for ${coin}: ${err}`)
            }
        }

        for (let coin in coinPromises) {
            try {
                coin_balances[coin] = await coinPromises[coin];
                // console.log(`${coin}: resolved balance: ${coin_balances[coin]}`)

            } catch (err) {
                coin_balances[coin] = "error fetching balance";
                // console.log(`Error while trying to resolve the balance of ${coin}: ${err}`)

                if (err.response && err.response.statusText) {
                    // console.log("error response status text: ", err.response.statusText)
                }
            }
        }
        // console.log(`Coin balances: ${JSON.stringify(coin_balances, null, 4)}`);
        return coin_balances
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
}

module.exports = Wallet