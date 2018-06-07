import bitcoin from 'bitcoinjs-lib'
import bip32 from 'bip32'
import bip32utils from 'bip32-utils'

import Account from './Account'

const COIN_START = 0x80000000;

module.exports =
class Coin {
	constructor(seed, coin, discover){
		this.coin = coin;

		var mainRoot = bip32.fromSeed(new Buffer(seed, "hex"), this.coin.network);

		var bip44Num = this.coin.network.slip44;

		// Check if we need to convert the hexa to the index
		if (bip44Num >= COIN_START)
			bip44Num -= COIN_START;

		this.root = mainRoot.derivePath("m/44'/" + bip44Num + "'");

		this.accounts = {}

		// Default add account zero
		this.addAccount(0);
	}
	getBalance(options){
		if (options.address){

		}
	}
	sendPayment(options){

	}
	getExtendedPrivateKey(){
		return this.root.toBase58();
	}
	getExtendedPublicKey(){
		return this.root.neutered().toBase58();
	}
	getAccount(accountNumber){
		if (!this.accounts[accountNumber])
			return this.addAccount(accountNumber);

		return this.accounts[accountNumber];
	}
	addAccount(accountNumber){
		// if the account has already been added, just return 
		if (this.accounts[accountNumber])
			return this.getAccount(accountNumber);

		var accountMaster = this.root.deriveHardened(accountNumber);

		var account = new Account(accountMaster, this.coin);

		this.accounts[accountNumber] = account;

		return this.getAccount(accountNumber);
	}
}