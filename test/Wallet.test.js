var Wallet = require('../lib');

test('Wallet can be defined from Mnemonic', () => {
	var w = new Wallet('basket actual')

	expect(w.getSeedHex()).toBe('5cf2d4a8b0355e90295bdfc565a022a409af063d5365bb57bf74d9528f494bfa4400f53d8349b80fdae44082d7f9541e1dba2b003bcfec9d0d53781ca676651f')
})

test('Wallet can be defined from Seed Hex', () => {
	var w = new Wallet('5cf2d4a8b0355e90295bdfc565a022a409af063d5365bb57bf74d9528f494bfa4400f53d8349b80fdae44082d7f9541e1dba2b003bcfec9d0d53781ca676651f')

	expect(w.getMnemonic()).toBe('basket actual')
})

test('Wallet can be defined from BIP39 Entropy', () => {
	var w = new Wallet('5cf2d4a8b0355e90295bdfc565a022a409af063d5365bb57bf74d9528f494bfa4400f53d8349b80fdae44082d7f9541e1dba2b003bcfec9d0d53781ca676651f')

	expect(w.getMnemonic()).toBe('basket actual')
})
