var Wallet = require('../lib').Wallet;

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
