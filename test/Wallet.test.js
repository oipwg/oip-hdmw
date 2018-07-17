var Wallet = require('../src').Wallet;

test('Wallet can be created from nothing', () => {
	// Discover false is passed to prevent tons of extra async calls
	var w = new Wallet(undefined, {discover: false})
	expect(w.getMnemonic()).toBeDefined()
	expect(w.getSeed()).toBeDefined()
	expect(w.getEntropy()).toBeDefined()
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
	var w = new Wallet('00000000000000000000000000000000', { discover: false })

	var coins = w.getCoins();

	expect(coins.bitcoin).toBeDefined()
	expect(coins.litecoin).toBeDefined()
	expect(coins.flo).toBeDefined()
	expect(coins.bitcoin_testnet).toBeUndefined()
})

test('Wallet getCoinBalances', async () => {
    var w = new Wallet("siren comic spy donkey unknown license asset lens proud bus exhaust section", {discover: false})
    let balances = await w.getCoinBalances()

    expect(balances).toHaveProperty("flo");
    expect(balances).toHaveProperty("bitcoin");
    expect(balances).toHaveProperty("litecoin");
    
}, 100000)

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
