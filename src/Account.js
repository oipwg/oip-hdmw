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
	discoverChain(chainNumber, onSuccess){
		if (onSuccess === undefined || typeof onSuccess !== 'function')
			onSuccess = function(){}

		var self = this;
		this.account.discoverChain(0, GAP_LIMIT, function(addresses, callback) {
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

			for (var address of addresses){
				self.coin.explorer.getAddress(address, {noTxList: true}).then(function(addr) {
					if (addr.totalReceived > 0){
						results[addr.addrStr] = true

						self.addresses[addr.addrStr] = new Address(addr.addrStr, self.coin, addr);
					} else {
						results[addr.addrStr] = false
					}

					checkComplete()
				}).catch(function(e) {
					callback(e)
				})
			}
		}, function(err, used, checked) {
			if (err) throw err

			onSuccess(self.addresses)
		})
	}
}