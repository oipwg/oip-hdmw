var Wallet = require('../src').Wallet;

test('Wallet can be created from nothing', () => {
	// Discover false is passed to prevent tons of extra async calls
	var w = new Wallet(undefined, {discover: false})
	expect(w.getMnemonic()).toBeDefined()
	expect(w.getSeed()).toBeDefined()
	expect(w.getEntropy()).toBeDefined()
})

test('Wallet Serialize and Deserialize', async (done) => {
	var serialized = {
		"master_node": "xprv9s21ZrQH143K3HYAgqXMBtsXJbsSY1wcVBoGHjXh8rh5PsL9mfCNuiqL8mesxGyLo55neZf9sNLEfMMKozkXmgtoy139YaTks7bMpmUUGcX",
		"seed": "siren comic spy donkey unknown license asset lens proud bus exhaust section",
		"coins": {
			"bitcoin": {
				"name": "bitcoin",
				"network": {
					"messagePrefix": "\u0018Bitcoin Signed Message:\n",
					"bech32": "bc",
					"bip32": {
						"public": 76067358,
						"private": 76066276
					},
					"pubKeyHash": 0,
					"scriptHash": 5,
					"wif": 128,
					"slip44": 2147483648
				},
				"seed": "xprv9uvNqaLC9GTaoEELKRZvDSmTP2HFKpJJkm9a1SBe4WhM1JfnK3RyYCJ9XdNN2v6DpimfZgh6pLCfMGtJ4NQTadibva7tUom76JqE6B2AJY1",
				"accounts": {
					"0": {
						"extended_private_key": "xprv9yohZYidpyKFSuLkW79iwKzZNPTrHKtPS5jrtmB7awBiqVUb1he7ck5hQPbbKXKAX5htnhyXNxJGkyrYrRmep9grqoxty3GF4dX4XybZPkQ",
						"addresses": [],
						"chains": {
							"0": {
								"lastUpdate": 1533759501123
							},
							"1": {
								"index": 1,
								"lastUpdate": 0
							}
						}
					}
				}
			},
			"litecoin": {
				"name": "litecoin",
				"network": {
					"messagePrefix": "\u0018Litecoin Signed Message:\n",
					"bip32": {
						"public": 27108450,
						"private": 27106558
					},
					"pubKeyHash": 48,
					"scriptHash": 50,
					"wif": 176,
					"slip44": 2147483650
				},
				"seed": "xprv9uvNqaLC9GTaoEELKRZvDSmTP2HFKpJJkm9a1SBe4WhM1JfnK3RyYCJ9XdNN2v6DpimfZgh6pLCfMGtJ4NQTadibva7tUom76JqE6B2AJY1",
				"accounts": {
					"0": {
						"extended_private_key": "Ltpv78bHMsStHEYdUEruzA4SzRkBzX4mFRnLW2tH7ygcWeCjvn9ggjmBnFSm4Ckked919grZ223MfmriMBfmvEZ5JmTJd8GvWym6jn82NPqe7fb",
						"addresses": [],
						"chains": {
							"0": {
								"lastUpdate": 1533759503258
							},
							"1": {
								"lastUpdate": 1533759508840
							}
						}
					}
				}
			},
			"flo": {
				"name": "flo",
				"network": {
					"bip32": {
						"public": 20201579,
						"private": 20200497
					},
					"slip44": 216,
					"messagePrefix": "\u001bFlorincoin Signed Message:\n",
					"pubKeyHash": 35,
					"scriptHash": 94,
					"wif": 163
				},
				"seed": "xprv9uvNqaLC9GTaoEELKRZvDSmTP2HFKpJJkm9a1SBe4WhM1JfnK3RyYCJ9XdNN2v6DpimfZgh6pLCfMGtJ4NQTadibva7tUom76JqE6B2AJY1",
				"accounts": {
					"0": {
						"extended_private_key": "Fprv4yb4HkMenJmHv56HqcXq1KRKGXFuASq9FSosLHciMsNcNfE2181F7FmZ18qEnkR51pheXLL3Ev3us91CZ2TbNr4mXdh8pnvxxNMEko82MtZ",
						"addresses": [
							{
								"addrStr": "FFM4qQ8eQ9bFn5CLpbkwuKEVxTFphKbQP4",
								"wif": "RE2Q6RswEEPSfpE8c5kfK5xa4C2AHNecCfopqvz9pN8sU1kVDKnp",
								"balanceSat": 985686398,
								"totalReceivedSat": 7242131745,
								"unconfirmedBalanceSat": 0,
								"transactions": [
									"39f9cd85b3a45f00dd702595aa1ffe2558ac87e377b245f9787d8d4b39f27611",
									"d9055f0822b2e93e124b0607163697a77e471eb4b77492a2a367503eeb4e0e8a",
									"a49760f963a907614137744f5c4f7942c15f00149b554726f31eb3f53abd45de",
									"7a436d382f8c87855a439044961eaf1c89bb0ecfcee24d619cbd8a06accaaa66",
									"31e328319c56ed261f14d7f76fee701a832d1eeea1fa22e95b798e2b72f90c0e",
									"ec94ea1264b8886434c4b591d3895e85952237591792b4e642b036a7d06c40b0",
									"3bc0eae08e48c26351fa730509d72e6b244496a9795edf5554d6e1a2c89f7844",
									"1a474c2ef01ab4fe314391420316b72869c57714e9a382c83d07583972037e61",
									"717fbae105bb819dd84ec3b71a6d50d5d273427993175cefc63d0bd5bad5db12"
								],
								"spentTransactions": [],
								"lastUpdated": 1533759500986
							}
						],
						"chains": {
							"0": {
								"lastUpdate": 1533759502335
							},
							"1": {
								"lastUpdate": 1533759502649
							}
						}
					},
					"1": {
						"extended_private_key": "Fprv4yb4HkMenJmHzALB898duL1ipj8EobiwX4Maw6vX5cZpyLkZWFJY8oS3C8kZTk8oCGU1UJbLHYojgeVVg7xM1SFyzuf8qPTVLeX79dnj2yH",
						"addresses": [],
						"chains": {
							"0": {
								"lastUpdate": 1533759502960
							},
							"1": {
								"lastUpdate": 1533759503301
							}
						}
					}
				}
			}
		}
	}
	
	var w = new Wallet(serialized.seed, {
		discover: false,
		serialized_data: serialized
	})
	
	expect(w.getMnemonic()).toBe("siren comic spy donkey unknown license asset lens proud bus exhaust section")
	
	let flo_balance = await w.getCoin("flo").getBalance({discover: false})
	expect(flo_balance).toBe(9.85686398)
	
	expect(w.serialize()).toEqual(serialized)
	
	done()
})

test('Wallet can be defined from Mnemonic', () => {
	var w = new Wallet("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about", {discover: false})
	
	expect(w.getSeed()).toBe('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4')
	expect(w.getMnemonic()).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
	expect(w.getEntropy()).toBe('00000000000000000000000000000000')
})

test('Wallet can be defined from Seed Hex', () => {
	var w = new Wallet('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', {discover: false})
	
	expect(w.getSeed()).toBe('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4')
	expect(w.getEntropy()).toBeUndefined()
	expect(w.getMnemonic()).toBeUndefined()
})

test('Wallet can be defined from BIP39 Entropy', () => {
	var w = new Wallet('00000000000000000000000000000000', {discover: false})
	
	expect(w.getMnemonic()).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
	expect(w.getSeed()).toBe('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4')
	expect(w.getEntropy()).toBe('00000000000000000000000000000000')
})

test('Wallet can spawn on only one defined coin', () => {
	var w = new Wallet('00000000000000000000000000000000', {
		discover: false,
		supported_coins: 'flo_testnet'
	})
	
	expect(w.getCoin('flo_testnet')).toBeDefined()
	expect(w.getCoin('bitcoin')).toBeUndefined()
	expect(w.getCoin('litecoin')).toBeUndefined()
	expect(w.getCoin('flo')).toBeUndefined()
})

test('Wallet can spawn on multiple defined coins', () => {
	var w = new Wallet('00000000000000000000000000000000', {
		discover: false,
		supported_coins: ['flo', 'flo_testnet']
	})
	
	expect(w.getCoin('flo_testnet')).toBeDefined()
	expect(w.getCoin('flo')).toBeDefined()
	expect(w.getCoin('bitcoin')).toBeUndefined()
	expect(w.getCoin('litecoin')).toBeUndefined()
})

test('Wallet can return all coins', () => {
	var w = new Wallet('00000000000000000000000000000000', {discover: false})
	
	var coins = w.getCoins();
	
	expect(coins.bitcoin).toBeDefined()
	expect(coins.litecoin).toBeDefined()
	expect(coins.flo).toBeDefined()
	expect(coins.bitcoin_testnet).toBeUndefined()
})

test('Wallet getCoinBalances & getFiatBalances', async (done) => {
	var wal = new Wallet("siren comic spy donkey unknown license asset lens proud bus exhaust section", {discover: false})
	let balances = await wal.getCoinBalances()
	for (let coin in balances) {
		console.log(typeof balances[coin])
	}
	console.log(balances)
	
	expect(balances).toHaveProperty("flo");
	expect(balances).toHaveProperty("bitcoin");
	expect(balances).toHaveProperty("litecoin");
	
	let fb = await wal.getFiatBalances({discover: false})
	
	expect(fb).toHaveProperty("flo");
	expect(fb).toHaveProperty("bitcoin");
	expect(fb).toHaveProperty("litecoin");
	
	done()
}, 100000)

test('Wallet getExchangeRates', async (done) => {
	var walb = new Wallet("siren comic spy donkey unknown license asset lens proud bus exhaust section", {discover: false})
	let rates = await walb.getExchangeRates()
	// console.log(rates)
	expect(rates).toHaveProperty("flo");
	expect(rates).toHaveProperty("bitcoin");
	expect(rates).toHaveProperty("litecoin");
	
	done()
}, 100000)

test('Wallet getExchangeRates with coin options', async (done) => {
	var walb = new Wallet("siren comic spy donkey unknown license asset lens proud bus exhaust section", {discover: false})
	let rates = await walb.getExchangeRates({coins: ['flo']})
	expect(rates.flo).toBeDefined()
	expect(typeof rates.flo === 'number')
	done()
}, 100000)

test('set network apis', () => {
	let wallet = new Wallet("siren comic spy donkey unknown license asset lens proud bus exhaust section", {discover: false})
	let oldNetworks = wallet.getNetworks()
	
	let oldUrls = []
	for (let coin in oldNetworks) {
		oldUrls.push(oldNetworks[coin].explorer.url)
	}
	
	let options = {flo: 'flo.ryan', bitcoin: 'bitcoin.ryan', litecoin: 'litecoin.ryan'}
	wallet.setExplorerUrls(options)
	let newNetworks = wallet.getNetworks()
	
	let newUrls = []
	for (let coin in newNetworks) {
		newUrls.push(newNetworks[coin].explorer.url)
	}
	
	let myUrls = []
	for (let url of newUrls) {
		if (!oldUrls.includes(url)) {
			myUrls.push(url)
		}
	}
	
	expect(myUrls.length).toEqual(3)
	for (let coin in options) {
		expect(myUrls.includes(options[coin]))
	}
})

test('get network api urls', () => {
	let wallet = new Wallet("siren comic spy donkey unknown license asset lens proud bus exhaust section", {discover: false})
	expect(wallet.getExplorerUrls()).toEqual(
		{
			bitcoin: 'https://bitsight.failover.alexandria.io/api',
			flo: 'https://livenet.flocha.in/api',
			litecoin: 'https://litesight.failover.alexandria.io/api',
		}
	)
})

test('static method call from instance', () => {
	let wallet = new Wallet("siren comic spy donkey unknown license asset lens proud bus exhaust section", {discover: false})
	expect(wallet.constructor.getDefaultExplorerUrls()).toEqual({
		bitcoin: 'https://bitsight.failover.alexandria.io/api',
		bitcoin_testnet: 'https://bitsight.mk1.alexandria.io/api',
		flo: 'https://livenet.flocha.in/api',
		flo_testnet: 'https://testnet.flocha.in/api',
		litecoin: 'https://litesight.failover.alexandria.io/api',
		litecoin_testnet: 'https://litesight.mk1.alexandria.io/api'
	})
})

test('reset network api urls', () => {
	let wallet = new Wallet("siren comic spy donkey unknown license asset lens proud bus exhaust section", {discover: false})
	wallet.setExplorerUrls({
		flo: 'flow',
		bitcoin: 'bitcoin',
		litecoin: 'litecion'
	})
	expect(wallet.getExplorerUrls()).toEqual({
		flo: 'flow',
		bitcoin: 'bitcoin',
		litecoin: 'litecion'
	})
	wallet.resetExplorerUrls()
	expect(wallet.getExplorerUrls()).toEqual(
		{
			bitcoin: 'https://bitsight.failover.alexandria.io/api',
			flo: 'https://livenet.flocha.in/api',
			litecoin: 'https://litesight.failover.alexandria.io/api',
		}
	)
})

test('get network api urls with testnet coins', () => {
	let wallet = new Wallet("siren comic spy donkey unknown license asset lens proud bus exhaust section", {discover: false})
	wallet.addTestnetCoins()
	expect(wallet.getExplorerUrls()).toEqual(
		{
			bitcoin: 'https://bitsight.failover.alexandria.io/api',
			bitcoin_testnet: 'https://bitsight.mk1.alexandria.io/api',
			flo: 'https://livenet.flocha.in/api',
			flo_testnet: 'https://testnet.flocha.in/api',
			litecoin: 'https://litesight.failover.alexandria.io/api',
			litecoin_testnet: 'https://litesight.mk1.alexandria.io/api'
		}
	)
})

test('add default supported testnet coins', () => {
	let wallet = new Wallet("siren comic spy donkey unknown license asset lens proud bus exhaust section", {discover: false})
	expect(Object.keys(wallet.getCoins())).toEqual(["bitcoin", "litecoin", "flo"])
	wallet.addTestnetCoins()
	expect(Object.keys(wallet.getCoins())).toEqual(["bitcoin", "litecoin", "flo", "bitcoin_testnet", "flo_testnet", "litecoin_testnet"])
})

test('remove default supported testnet coins', () => {
	let wallet = new Wallet("siren comic spy donkey unknown license asset lens proud bus exhaust section", {discover: false})
	expect(Object.keys(wallet.getCoins())).toEqual(["bitcoin", "litecoin", "flo"])
	wallet.addTestnetCoins()
	expect(Object.keys(wallet.getCoins())).toEqual(["bitcoin", "litecoin", "flo", "bitcoin_testnet", "flo_testnet", "litecoin_testnet"])
	wallet.addTestnetCoins(false)
	expect(Object.keys(wallet.getCoins())).toEqual(["bitcoin", "litecoin", "flo"])
})

test('remove testnet coins in getCoinBalances', () => {
	let wallet = new Wallet("siren comic spy donkey unknown license asset lens proud bus exhaust section", {discover: false})
	wallet.addTestnetCoins()
	expect(Object.keys(wallet.getCoins())).toEqual(["bitcoin", "litecoin", "flo", "bitcoin_testnet", "flo_testnet", "litecoin_testnet"])
	
	let coinnames = Object.keys(wallet.getCoins())
	
	for (let i = coinnames.length - 1; i >= 0; i--) {
		if (coinnames[i].includes('_testnet')) {
			coinnames.splice(i, 1)
		}
	}
	
	expect(coinnames).toEqual(["bitcoin", "litecoin", "flo"])
	
})


// test('Wallet sendPayment', (done) => {
// 	var w = new Wallet('00000000000000000000000000000000', { 
// 		discover: false,
// 		supported_coins: ['flo_testnet', 'bitcoin', 'litecoin', 'flo']
// 	})

// 	w.sendPayment({
// 		from: "odqpABssS7twQfwqNhQdb58c8RiG6awnCh",
// 		to:  { oPHTT8kciUGjeqKrMYDHh4gL8DFBaNF1xL: 0.000001 },
// 		floData: "oip-hdmw Wallet Payment!"
// 	}).then((txid) => {
// 		console.log(txid);
// 		expect(txid).toBeDefined()
// 		done()
// 	}).catch((error) => {
// 		expect(error).toBeUndefined()
// 		done()
// 	})
// }, 20000);
