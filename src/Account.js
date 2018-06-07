import bitcoin from 'bitcoinjs-lib'
import bip32 from 'bip32'
import bip32utils from 'bip32-utils'
import coinselect from 'coinselect'

import Address from './Address'
import { toBase58, isValidAddress, discovery } from './util'

// Helper CONSTS (used in other consts)
const SECOND = 1000;
const MINUTE = 60 * SECOND;

// Class Constants
const CHAIN_EXPIRE_TIMEOUT = 30 * MINUTE;
const GAP_LIMIT = 20;

const CUSTOM_ADDRESS_FUNCTION = (node, network) => {
	return { address: node, network: network }
}

module.exports =
class Account {
	constructor(accountMaster, coin, discover){
		this.accountMaster = accountMaster;
		this.coin = coin || {};

		var external = this.accountMaster.derive(0)
		var internal = this.accountMaster.derive(1)

		this.account = new bip32utils.Account([
			new bip32utils.Chain(external, undefined, CUSTOM_ADDRESS_FUNCTION),
			new bip32utils.Chain(internal, undefined, CUSTOM_ADDRESS_FUNCTION)
		])

		this.addresses = {}

		this.discovery = {
			0: {
				index: 0,
				lastUpdate: 0
			},
			1: {
				index: 1,
				lastUpdate: 0
			}
		}

		// Discover both External and Internal chains
		if (discover){
			this.discoverChain(0)
			this.discoverChain(1)
		}
	}
	getBalance(){
		return new Promise((resolve, reject) => {
			return this.discoverChainsIfNeeded().then(() => {
				var totBal = 0;

				for (var addr in this.addresses){
					totBal += this.addresses[addr].getBalance()
				}

				resolve(totBal)
			})
		})
	}
	sendTransaction(options){
		// Store an array of addresses to request utxos for
		var addrs = [];

		// Check if we define what address the transaction must come from
		if (options.from){
			if (Array.isArray(options.from)){
				for (var addr of options.from){
					if (isValidAddress(addr, this.coin.network)){
						addrs.push(addr);
					}
				}
			} else {
				if (isValidAddress(options.from, this.coin.network)){
					addrs.push(options.from);
				}
			}
		} else {
			for (var addr of this.addresses){
				addrs.push(addr);
			}
		}
	}
	getExtendedPrivateKey(){
		return this.accountMaster.toBase58()
	}
	getExtendedPublicKey(){
		return this.accountMaster.neutered().toBase58()
	}
	getChain(chainNumber){
		return this.account.getChain(chainNumber)
	}
	_discoverChain(chainNumber, gapLimit, queryCallback, callback) {
		var chains = this.account.getChains()
		var chain = chains[chainNumber].clone()

		discovery(chain, gapLimit, queryCallback, chainNumber, (err, used, checked, chainIndex) => {
			if (err) return callback(err)

			// throw away EACH unused address AFTER the last unused address
			var unused = checked - used
			for (var j = 1; j < unused; ++j) chain.pop()

			// override the internal chain
			this.account.chains[chainIndex] = chain

			callback(err, used, checked)
		})
	}
	discoverChain(chainNumber){
		return new Promise((resolve, reject) => {
			this._discoverChain(chainNumber, GAP_LIMIT, (addresses, callback) => {
				var results = {};

				var checkComplete = () => {
					var done = true;
					for (var a of addresses){
						if (results[toBase58(a.address.publicKey, this.coin.network)] === undefined){
							done = false
						}
					}

					if (done){
						callback(null, results);
					}
				}

				for (var addr of addresses){
					var address = new Address(addr, this.coin, false);

					address.updateState().then((ad) => {
						if (ad.getTotalReceived() > 0){
							results[ad.toBase58()] = true

							this.addresses[ad.toBase58()] = ad;
						} else {
							results[ad.toBase58()] = false
						}

						checkComplete()
					}).catch(callback)
				}
			}, (err, used, checked) => {
				if (err) throw err

				this.discovery[chainNumber] = { lastUpdate: Date.now() }

				resolve(this, chainNumber)
			})
		})
	}
	discoverChainsIfNeeded(){
		return new Promise((resolve, reject) => {
			var chainsToDiscover = []

			for (var chain in this.discovery){
				if (!this.discovery[chain] || this.discovery[chain].lastUpdate < (Date.now() - CHAIN_EXPIRE_TIMEOUT)){
					chainsToDiscover.push(this.discovery[chain].index)
				}
			}

			var checkIfComplete = () => {
				if (chainsToDiscover.length === 0)
					resolve(this);
			}

			for (var c of chainsToDiscover){
				this.discoverChain(c).then((account, chainNumber) => {
					chainsToDiscover.splice(chainsToDiscover.indexOf(chainNumber))
					checkIfComplete();
				}).catch(console.error);
			}
		})
	}
}