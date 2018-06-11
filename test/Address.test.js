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

	var address = new Address(node, networks.flo, false);

	address.updateState().then((addr) => {
		expect(addr.getTotalReceived()).toBeGreaterThan(0)
		done()
	})
})

test('Address to PublicAddress', () => {
	var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)

	var address = new Address(node, networks.flo, false);

	expect(address.getPublicAddress()).toBe("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp")
})

test('Address to WIF', () => {
	var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)

	var address = new Address(node, networks.flo, false);

	expect(address.getPrivateAddress()).toBe("RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5")
})

test('Address WIF roundtrip', () => {
	var address = new Address("RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5", networks.flo, false);

	expect(address.getPrivateAddress()).toBe("RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5")
})

test('Address WIF to PublicAddress', () => {
	var address = new Address("RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5", networks.flo, false);

	expect(address.getPublicAddress()).toBe("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp")
})