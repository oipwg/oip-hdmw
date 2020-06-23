[![Build Status](https://travis-ci.org/oipwg/oip-hdmw.svg?branch=master)](https://travis-ci.org/oipwg/oip-hdmw)
[![](https://img.shields.io/npm/v/oip-hdmw.svg)](https://www.npmjs.com/package/oip-hdmw)
[![Coverage Status](https://coveralls.io/repos/github/oipwg/oip-hdmw/badge.svg?branch=master)](https://coveralls.io/github/oipwg/oip-hdmw?branch=master)
# OIP HD-MultiWallet
`oip-hdmw` is a [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) Javascript Lite Wallet. You can spawn and recover the entire wallet for each coin using just a single [BIP-39 Mnemonic](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki). We use an [`insight-api`](https://github.com/bitpay/insight-api) server as the source of truth for Wallet balances and unspent outputs instead of syncing Block Headers like most SPV wallets do. 

## Table of Contents
* [Installation Instructions](https://github.com/oipwg/oip-hdmw/#installation-instructions)
* [Getting Started](https://github.com/oipwg/oip-hdmw/#getting-started)
	* [Creating your first Wallet](https://github.com/oipwg/oip-hdmw#creating-your-first-wallet)
	* [Getting your first Address](https://github.com/oipwg/oip-hdmw/#getting-your-first-address)
	* [Sending your first Transaction](https://github.com/oipwg/oip-hdmw/#sending-your-first-transaction)
	* [Saving and Reloading the Wallet](https://github.com/oipwg/oip-hdmw/#saving-and-reloading-the-wallet)
* [API Documentation](https://github.com/oipwg/oip-hdmw/#api-documentation)
	* [Wallet](https://oipwg.github.io/oip-hdmw/Wallet.html)
	* [Coin](https://oipwg.github.io/oip-hdmw/Coin.html)
	* [Account](https://oipwg.github.io/oip-hdmw/Account.html)
	* [Address](https://oipwg.github.io/oip-hdmw/Address.html)
	* [TransactionBuilder](https://oipwg.github.io/oip-hdmw/TransactionBuilder.html)
* [License](https://github.com/oipwg/oip-hdmw/#license)

## Installation Instructions
You can install the latest version by running the following `npm install` command.
```
$ npm install @oipwg/hdmw@2.0.0-beta.9
```
## Getting Started
### Creating your first Wallet
Creating a wallet is extremely simple! To create a new wallet with a random new Mnemonic, all we need to do is create a Wallet with no parameters. After the wallet is created, we log the Mnemonic so that we can use it in our other examples
```javascript
const HDMW = require('@oipwg/hdmw')
const Wallet = HDMW.Wallet;

const myWallet = new Wallet()

console.log("My Mnemonic: '" + myWallet.getMnemonic() + "'")
// My Mnemonic: 'carbon panda replace drum guess heart inside useless random bulb hint industry'
```
### Getting the Coins from your Wallet
Now that you have a Mnemonic for your wallet, lets go ahead and create the Wallet again, but this time, we will give it the Mnemonic to start from.
```javascript
const HDMW = require('@oipwg/hdmw')
const Wallet = HDMW.Wallet;

const myWallet = new Wallet('carbon panda replace drum guess heart inside useless random bulb hint industry')

console.log("My Wallets Coins: ", myWallet.getCoins())
// My Wallets Coins: {
//	bitcoin: Coin,
//	litecoin: Coin,
//	flo: Coin
//}
```
As you can see, we get back a JSON object containing each `Coin` along with an `identifier` that is the Coin name.
### Getting your first Address
Now that we have created a new Wallet and accessed the Coins on the wallet, lets go ahead and get the Main Address for one of the coins. To do this, we will first need to get a `Coin` from the `Wallet`. To do this, we use the `getCoin` function and pass it the Coin name that we wish to get the Coin for. After we have grabbed the `Coin`, we run the `getMainAddress` function in order to get the main address for the `Coin`. After we have stored the `Address` returned to us by the `Coin`, we need to get the human readable Public key of the Address.
```javascript
const HDMW = require('@oipwg/hdmw')
const Wallet = HDMW.Wallet;

const myWallet = new Wallet('carbon panda replace drum guess heart inside useless random bulb hint industry')

const bitcoin = myWallet.getCoin('bitcoin')

const myMainAddress = bitcoin.getMainAddress()

console.log("My Wallets Bitcoin Main Address: ", myMainAddress.getPublicAddress());
// My Wallets Bitcoin Main Address: 13BW4eTvNFXBLeTjJQRgVxuiuStAFp1HfL
```
### Sending your first Transaction
In order to send a transaction, we will need to have a balance on our Wallet first. Send some funds to the Address that you got in the last step. After you have sent some money to the Wallet, we can send our first transaction. To send the Transaction, use the `sendPayment` method.

```javascript
const HDMW = require('@oipwg/hdmw')
const Wallet = HDMW.Wallet;

const myWallet = new Wallet('carbon panda replace drum guess heart inside useless random bulb hint industry')

myWallet.sendPayment({
	to: { "12nP3k9tFKgQPJNkDDyNWqgjtm2bt3qq1b": 0.001 }
}).then(function(txid){
	console.log("Successfully sent Transaction! " + txid);
}).catch(function(error){
	console.error("Unable to send Transaction!", error)
})
```

When we send the transaction, it broadcasts it out to the Coin p2p network. After a few minutes your transaction should receive its initial confirmation, and you would be ok to send another transaction.

If you wanted to send second transaction, before the first receives its initial confirmation, you can do so by calling the same `Wallet` instance that you ran `sendPayment` on. OIP HDMW keeps track of the transactions it is using to spend from when it sends a payment, so if your application stops running, then restarts BEFORE the first transaction receives a confirmation, it would not see the payment that it spent, and thus try to spend the same value as the first transaction. If your application is going to "restart" between sending transactions, it is suggested that you read the next section called "Saving and Reloading the Wallet"

### Saving and Reloading the Wallet
After you have loaded a wallet, you might want to save its current "state" so that on the next load, it can immediately know its balance and be ready to spend without having to "re-discover" the wallet addresses/state.

Here is an example that, after sending a transaction, saves the current wallet state to a local file. Since I am using Node.js in this example, we are going to use the NPM module [node-localstorage](https://www.npmjs.com/package/node-localstorage) in order to store the wallet state easily and effortlessly. If you are using a Browser however, you can use the Native "LocalStorage" using the same code.

You can run this example again right after it finishes as well. Since it saves its "Spent Transaction" state, it doesn't need to wait for a confirmation on the Blockchain to send the next transaction.

```javascript
const HDMW = require('@oipwg/hdmw')
const Wallet = HDMW.Wallet;

if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./storage');
}

let wallet_data = localStorage.getItem('oip-hdmw')

if (wallet_data)
	wallet_data = JSON.parse(wallet_data)

let myWallet = new Wallet('carbon panda replace drum guess heart inside useless random bulb hint industry', {
	serialized_data: wallet_data
});

let send_a_payment = async () => {
	let txid = await myWallet.sendPayment({
		to: { "12nP3k9tFKgQPJNkDDyNWqgjtm2bt3qq1b": 0.001 }
	})

	console.log("Successfully sent Transaction! " + txid);

	// Save the Wallet State
	localStorage.setItem('oip-hdmw', JSON.stringify(myWallet.serialize(), null, 4))
}

// Run the payment send
send_a_payment().catch(() => { 
	console.error("Unable to send Transaction!", error) 
})
```

### Understanding the Wallet Topology
![](https://raw.githubusercontent.com/oipwg/oip-hdmw/master/docs/hdmw-topology.png)

## API Documentation
Learn more about how each Class works, or take a look at all functions available to you.
* [Documentation Home](https://oipwg.github.io/oip-hdmw/)
	* [Wallet](https://oipwg.github.io/oip-hdmw/1.0.1/Wallet.html)
	* [Coin](https://oipwg.github.io/oip-hdmw/1.0.1/Coin.html)
	* [Account](https://oipwg.github.io/oip-hdmw/1.0.1/Account.html)
	* [Address](https://oipwg.github.io/oip-hdmw/1.0.1/Address.html)
	* [TransactionBuilder](https://oipwg.github.io/oip-hdmw/1.0.1/TransactionBuilder.html)

## License
MIT License

Copyright (c) 2018 Open Index Protocol Working Group

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
