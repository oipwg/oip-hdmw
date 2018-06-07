import bitcoin from 'bitcoinjs-lib'
import bip32 from 'bip32'
import bip32utils from 'bip32-utils'
import coinselect from 'coinselect'

import Address from './Address'
import { isValidAddress } from './util'

const GAP_LIMIT = 20;

module.exports =
class Account {
	constructor(accountMaster, coin, discover){
		this.accountMaster = accountMaster;
		this.coin = coin || {};

		var external = this.accountMaster.derive(0)
		var internal = this.accountMaster.derive(1)

		this.account = new bip32utils.Account([
			new bip32utils.Chain(external.neutered()),
			new bip32utils.Chain(internal.neutered())
		])

		this.addresses = {}

		// Discover both External and Internal chains
		if (discover){
			this.discoverChain(0)
			this.discoverChain(1)
		}
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
	discoverChain(chainNumber){
		return new Promise((resolve, reject) => {
			this.account.discoverChain(chainNumber, GAP_LIMIT, (addresses, callback) => {
				var results = {};

				var checkComplete = () => {
					var done = true;
					for (var add of addresses){
						if (results[add] === undefined){
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
							results[ad.getBase58()] = true

							this.addresses[ad.getBase58()] = ad;
						} else {
							results[ad.getBase58()] = false
						}

						checkComplete()
					}).catch(function(e) {
						callback(e)
					})
				}
			}, (err, used, checked) => {
				if (err) throw err

				resolve(this)
			})
		})
	}
}