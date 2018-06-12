import bip39 from 'bip39'

import Coin from './Coin'
import networks from './networks'

const DEFAULT_SUPPORTED_COINS = ['bitcoin', 'litecoin', 'flo']

/** This Class manages all Supported Coins */
class Wallet {
	/**
	 * Create
	 * @param  {string|Buffer} [seed] - 
	 * @param  {Object} [settings]
	 * @param {boolean} [settings.discover] - Defines if the Wallet should "auto-discover" Coin Account chains or not
	 * @param {Array.<string>} [settings.supported_coins=['bitcoin', 'litecoin', 'flo']] - An Array of coins that the Wallet should support
	 * @param {Array.<CoinInfo>} [settings.networks] - An array containing a custom coins network info
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
		this.discover = options.discover || true

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
	getCoin(coin){
		for (var c in this.coins){
			if (c === coin)
				return this.coins[c]
		}
	}
	getCoins(){
		return this.coins;
	}
	getMnemonic(){
		return this.mnemonic
	}
	getEntropy(){
		return this.entropy
	}
	getSeed(){
		return this.seed
	}
}

module.exports = Wallet