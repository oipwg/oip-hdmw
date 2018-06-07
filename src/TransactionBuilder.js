import bitcoin from 'bitcoinjs-lib'
import bip32 from 'bip32'
import bip32utils from 'bip32-utils'
import coinselect from 'coinselect'
import { isValidAddress } from './util'

const GAP_LIMIT = 20;

module.exports =
class TransactionBuilder {
	constructor(options){
		this.from = [];

		this.parseOptions(options);	
	}
	parseOptions(options){
		// Store an array of addresses to request utxos for
		var addrs = [];

		// Check if we define what address the transaction must come from
		if (!options.from){
			throw new Error("From Address(es) are not defined!")
		}

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
	}
}