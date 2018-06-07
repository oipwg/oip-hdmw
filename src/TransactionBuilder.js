import bitcoin from 'bitcoinjs-lib'
import bip32 from 'bip32'
import bip32utils from 'bip32-utils'
import coinselect from 'coinselect'

import Address from './Address'
import { isValidAddress } from './util'

const GAP_LIMIT = 20;

module.exports =
class TransactionBuilder {
	constructor(coin, options){
		// From Addresses
		this.from = [];

		this.parseOptions(options);	
	}
	parseOptions(options){
		// Check if we define what address the transaction must come from
		if (!options.from){
			throw new Error("From Address(es) are not defined!")
		}

		if (Array.isArray(options.from)){
			for (var addr of options.from){
				if (addr instanceof Address){
					if (isValidAddress(addr.toBase58(), this.coin.network)){
						this.from.push(addr)
					}
				} else if (isValidAddress(addr, this.coin.network)) {
					this.from.push(new Address(addr, this.coin));
				}
			}
		} else {
			if (options.from instanceof Address){
				if (isValidAddress(options.from.toBase58(), this.coin.network)){
					this.from.push(options.from)
				}
			} else if (isValidAddress(options.from, this.coin.network)) {
				this.from.push(new Address(options.from, this.coin));
			}
		}
	}
}