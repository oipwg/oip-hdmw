var Wallet = require('../lib');

test('Wallet can be defined from Mnemonic', () => {
	var w = new Wallet("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")

	expect(w.getSeed()).toBe('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4')
})

test('Wallet can be defined from Seed Hex', () => {
	var w = new Wallet('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4')

	expect(w.getSeed()).toBe('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4')
})

test('Wallet can be defined from BIP39 Entropy', () => {
	var w = new Wallet('00000000000000000000000000000000')

	expect(w.getMnemonic()).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
	expect(w.getSeed()).toBe('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4')
})
