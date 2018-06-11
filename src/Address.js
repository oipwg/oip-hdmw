import bitcoin from 'bitcoinjs-lib'
import bip32 from 'bip32'
import wif from 'wif'
import bip32utils from 'bip32-utils'
import coinselect from 'coinselect'
import { toBase58, isValidPublicAddress, isValidWIF } from './util'

const ECPair = bitcoin.ECPair;

const GAP_LIMIT = 20;

module.exports =
class Address {
	constructor(address, coin, state){
		if (address.network){
			this.fromBIP32 = true

			if (address.address)
				this.address = address.address
			else if (address.index && address.depth)
				this.address = address

			// Make sure that the networks match and throw an error if they don't
			if (address.network.pubKeyHash !== coin.network.pubKeyHash){
				throw new Error("Address Network and Coin Network DO NOT MATCH!!!!!")
			}
		} else {
			if (isValidPublicAddress(address, coin.network)){
				this.fromBIP32 = false
				this.pubAddress = address
			} else if (isValidWIF(address, coin.network)){
				this.fromBIP32 = true

				this.address = ECPair.fromWIF(address, coin.network)
			}
		}

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
	getPublicAddress(){
		return this.fromBIP32 ? toBase58(this.address.publicKey, this.coin.network.pubKeyHash) : this.pubAddress
	}
	getPrivateAddress(){
		return this.address ? this.address.toWIF() : undefined
	}
	updateState(){
		return this.coin.explorer.getAddress(this.getPublicAddress()).then((state) => {
			this.fromJSON(state)
			return this
		})
	}
	fromJSON(newState){
		if (newState === false)
			return

		// If the state doesn't match for this address, ignore it.
		if (newState.addrStr && newState.addrStr !== this.getPublicAddress())
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