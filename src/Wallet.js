import bip39 from 'bip39'

import Coin from './Coin'
import networks from './networks'

const DEFAULT_SUPPORTED_COINS = ['bitcoin', 'litecoin', 'flo']

module.exports =
class Wallet {
	constructor(seed, options){
		// Check if seed is a string or buffer, if not, create a new BIP39 Mnemonic
		if (typeof seed === "string"){
			if (seed.split(" ").length >= 2){
				this.mnemonic = seed;
				this.entropy = bip39.mnemonicToEntropy(this.mnemonic);
				this.seed = bip39.mnemonicToSeedHex(this.mnemonic);
			} else if (seed.length === 32) {
				this.entropy = seed;
				this.mnemonic = bip39.entropyToMnemonic(this.entropy);
				this.seed = bip39.mnemonicToSeedHex(this.mnemonic);
			} else {
				this.seed = seed;
				this.mnemonic
			}
		} else if (seed instanceof Buffer) {
			this.seed = seed.toString('hex');
		} else {
			this.seed = bip39.generateMnemonic();
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

		// Validate that each supported coin has a pair network
		for (var coin of this.supported_coins){
			for (var coinNet in this.networks){
				// If we have found a pair, attach a live coin object
				if (coin === coinNet)
					this.coins[coin] = new Coin(this.seed, this.networks[coinNet])
			}
		}
	}
	getMnemonic(){
		return this.mnemonic
	}
	getSeed(){
		return this.seed
	}
}