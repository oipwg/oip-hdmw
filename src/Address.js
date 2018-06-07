import bitcoin from 'bitcoinjs-lib'
import bip32 from 'bip32'
import bip32utils from 'bip32-utils'
import coinselect from 'coinselect'
import { isValidAddress } from './util'

const GAP_LIMIT = 20;

module.exports =
class Address {
	constructor(address, coin, state){
		this.address = address
		this.coin = coin || { satPerCoin: 1e8 }

		this.transactions = [];

		this.balanceSat = 0;
		this.totalReceivedSat = 0;
		this.totalSentSat = 0;
		this.unconfirmedBalanceSat = 0;

		this.lastUpdated = 0;
		
		if (state || state === false){
			this.fromJSON(state)
		} else {
			this.updateState()
		}
	}
	getBase58(){
		return this.address
	}
	updateState(){
		return this.coin.explorer.getAddress(this.address).then((state) => {
			this.fromJSON(state)
			return this
		})
	}
	fromJSON(newState){
		if (newState === false)
			return

		// If the state doesn't match for this address, ignore it.
		if (newState.addrStr && newState.addrStr !== this.address)
			return;

		if (!isNaN(newState.balanceSat))
			this.balanceSat = newState.balanceSat

		if (!isNaN(newState.totalReceivedSat))
			this.totalReceivedSat = newState.totalReceivedSat

		if (!isNaN(newState.totalSentSat))
			this.totalSentSat = newState.totalSentSat

		if (!isNaN(newState.unconfirmedBalanceSat))
			this.unconfirmedBalanceSat = newState.unconfirmedBalanceSat

		if (!isNaN(newState.transactions))
			this.transactions = newState.transactions

		if (!isNaN(newState.lastUpdated))
			this.lastUpdated = newState.lastUpdated
		else
			this.lastUpdated = Date.now()
	}
	getBalance(){
		return this.balanceSat / this.coin.satPerCoin
	}
	getTotalReceived(){
		return this.totalReceivedSat / this.coin.satPerCoin
	}
	getTotalSent(){
		return this.totalSentSat / this.coin.satPerCoin
	}
	getUnconfirmedBalance(){
		return this.unconfirmedBalanceSat / this.coin.satPerCoin
	}
}