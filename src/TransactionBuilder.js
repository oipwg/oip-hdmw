import bitcoin from 'bitcoinjs-lib'
import bip32 from 'bip32'
import bip32utils from 'bip32-utils'
import coinselect from 'coinselect'

import Address from './Address'
import { isValidPublicAddress } from './util'

const GAP_LIMIT = 20;

module.exports =
class TransactionBuilder {
	constructor(coin, options, account){
		this.coin = coin;
		this.account = account;

		// Addresses we are sending from
		this.from = [];
		// Addresses we want to send to & amounts
		this.to = [];

		this.parseOptions(options);	
	}
	addFrom(addr){
		if (addr instanceof Address){
			if (isValidPublicAddress(addr.getPublicAddress(), this.coin.network)){
				this.from.push(addr)
			}
		} else {
			throw new Error("From Address MUST BE InstanceOf Address")
		}
	}
	addTo(address, amount){
		if (isValidPublicAddress(address, this.coin.network) && !isNaN(amount)){
			var tmpTo = {
				address: address,
				value: amount
			}
			this.to.push(tmpTo)
		}
	}
	parseOptions(options){
		if (!options)
			return

		// Grab the From Addresses, it can be an array or regular.
		if (options.from){
			if (Array.isArray(options.from)){
				for (var addr of options.from){
					this.addFrom(addr)
				}
			} else {
				this.addFrom(options.from)
			}
		}

		// Load who we are sending to
		if (options.to){
			// Check if we are providing an address string and amount seperately
			if (Array.isArray(options.to)){
				for (var payTo of options.to){
					for (var address in payTo){
						this.addTo(address, payTo[address])
					}
				}
			} else {
				for (var address in options.to){
					this.addTo(address, options.to[address])
				}
			}
		}
	}
	getUnspents(){
		var addresses = this.from.map((address) => { return address.toBase58() });

		return this.coin.explorer.getAddressesUtxo(addresses)
	}
}