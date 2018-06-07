var bip32 = require('bip32');
var Address = require('../lib/Address');
var networks = require('../lib/networks');

test('Address is able to check its balance from String', (done) => {
	var address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", networks.flo);

	address.updateState().then((addr) => {
		expect(addr.getTotalReceived()).toBeGreaterThan(0)
		done()
	})
})

test('Address is able to check its balance from BIP32', (done) => {
	var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)

	var address = new Address({address: node, network: node.network}, networks.flo, false);

	address.updateState().then((addr) => {
		console.log(addr.toBase58())
		expect(addr.getTotalReceived()).toBeGreaterThan(0)
		done()
	})
})