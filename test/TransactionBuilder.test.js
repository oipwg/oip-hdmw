var bip32 = require('bip32');
var TransactionBuilder = require('../lib/TransactionBuilder');
var networks = require('../lib/networks');
var Address = require('../lib/Address');

test("TransactionBuilder should load a From Address", () => {
	var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)
	var address = new Address(node, networks.flo, false);

	var builder = new TransactionBuilder(networks.flo, {
		from: address
	})

	expect(builder.from).toContainEqual(address)
})

test("TransactionBuilder should load a From Address from an Array", () => {
	var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)
	var address = new Address(node, networks.flo, false);

	var builder = new TransactionBuilder(networks.flo, {
		from: [
			address
		]
	})

	expect(builder.from).toContainEqual(address)
})

test("TransactionBuilder should load a To Address", () => {
	var builder = new TransactionBuilder(networks.flo, {
		to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.001}
	})

	expect(builder.to).toContainEqual({"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.001})
})

test("TransactionBuilder should load a To Address from an Array", () => {
	var builder = new TransactionBuilder(networks.flo, {
		to: [
			{"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.001}
		]
	})

	expect(builder.to).toContainEqual({"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.001})
})

test("TransactionBuilder should be able to get unspents for From Addresses", (done) => {
	var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)
	var address = new Address(node, networks.flo, false);

	var builder = new TransactionBuilder(networks.flo, {
		from: address
	})

	builder.getUnspents().then((utxos) => {
		expect(utxos.length).toBeGreaterThan(0)
		done()
	}).catch(console.error)
})