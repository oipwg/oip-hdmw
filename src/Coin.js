import bitcoin from 'bitcoinjs-lib'
import bip32 from 'bip32'
import bip32utils from 'bip32-utils'

module.exports =
class Coin {
	constructor(seed){
		this.accounts = {}
	}
	fromSeed(){
		
	}
	setAccount(accountNumber, account){
		// If we are not a bip32utils Account, then fail.
		if (account instanceof bip32utils.Account)
			this.accounts[accountNumber] = account
	}
	getAccount(accountNumber){
		return this.accounts[accountNumber]
	}
}