var bip32 = require('bip32');
var Address = require('../lib/Address');
var networks = require('../lib/networks');

test('Address is able to check its balance', (done) => {
	var address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", networks.flo);

	address.updateState().then(() => {
		expect(address.getTotalReceived()).toBeGreaterThan(0)
		done()
	})
})