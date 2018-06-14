import bip39 from 'bip39'

import Coin from './Coin'
import networks from './networks'

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
		if (typeof seed === "string"){
			if (seed.split(" ").length >= 2){
				this.mnemonic = seed;
				this.entropy = bip39.mnemonicToEntropy(this.mnemonic);
				this.seed = bip39.mnemonicToSeedHex(this.mnemonic);
			} else if (seed.length >= 16 && seed.length <= 32) {
				this.entropy = seed;
				this.mnemonic = bip39.entropyToMnemonic(this.entropy);
				this.seed = bip39.mnemonicToSeedHex(this.mnemonic);
			} else {
				this.seed = seed;
			}
		} else if (seed instanceof Buffer) {
			this.seed = seed.toString('hex');
		} else {
			this.mnemonic = bip39.generateMnemonic();
			this.entropy = bip39.mnemonicToEntropy(this.mnemonic);
		}

		// Set the networks to the imported defaults
		this.networks = networks;

		// Check for custom options
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
		if (options.discover || options.discover === false)
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
}

module.exports = Wallet