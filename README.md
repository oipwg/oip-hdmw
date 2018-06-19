![](https://travis-ci.org/oipwg/oip-hdmw.svg?branch=master)
[![](https://img.shields.io/npm/v/oip-hdmw.svg)](https://www.npmjs.com/package/oip-hdmw)
# OIP HD-MultiWallet
`oip-hdmw` is a [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) Javascript Lite Wallet. You can spawn and recover the entire wallet for each coin using just a single [BIP-39 Mnemonic](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki). We use an [`insight-api`](https://github.com/bitpay/insight-api) server as the source of truth for Wallet balances and unspent outputs instead of syncing Block Headers like most SPV wallets do. 

## Table of Contents
* [Installation Instructions](https://github.com/oipwg/oip-hdmw/#installation-instructions)
* [Getting Started](https://github.com/oipwg/oip-hdmw/#getting-started)
	* [Creating your first Wallet](https://github.com/oipwg/oip-hdmw/#)
	* [Getting your first Address](https://github.com/oipwg/oip-hdmw/#)
	* [Sending your first Transaction](https://github.com/oipwg/oip-hdmw/#)
* [API Documentation](https://github.com/oipwg/oip-hdmw/#api-documentation)
	* [Wallet](https://oipwg.github.io/oip-hdmw/1.0.0/Wallet.html)
	* [Coin](https://oipwg.github.io/oip-hdmw/1.0.0/Coin.html)
	* [Account](https://oipwg.github.io/oip-hdmw/1.0.0/Account.html)
	* [Address](https://oipwg.github.io/oip-hdmw/1.0.0/Address.html)
	* [TransactionBuilder](https://oipwg.github.io/oip-hdmw/1.0.0/TransactionBuilder.html)
* [License](https://github.com/oipwg/oip-hdmw/#license)

## Installation Instructions
You can install the latest version by running the following `npm install` command.
```
$ npm install --save oip-hdmw
```
## Getting Started
### Creating your first Wallet
### Getting your first Address
### Sending your first Transaction
### Understanding the Wallet Topology
![](https://raw.githubusercontent.com/oipwg/oip-hdmw/master/docs/hdmw-topology.png)

## API Documentation
Learn more about how each Class works, or take a look at all functions available to you.
* [Documentation Home](https://oipwg.github.io/oip-hdmw/)
	* [Wallet](https://oipwg.github.io/oip-hdmw/1.0.0/Wallet.html)
	* [Coin](https://oipwg.github.io/oip-hdmw/1.0.0/Coin.html)
	* [Account](https://oipwg.github.io/oip-hdmw/1.0.0/Account.html)
	* [Address](https://oipwg.github.io/oip-hdmw/1.0.0/Address.html)
	* [TransactionBuilder](https://oipwg.github.io/oip-hdmw/1.0.0/TransactionBuilder.html)

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