var bip32 = require('bip32');
var TransactionBuilder = require('../lib/TransactionBuilder');
var networks = require('../lib/networks');
var Account = require('../lib/Account');
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

	expect(builder.to).toContainEqual({"address": "FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu", "value": 0.001})
})

test("TransactionBuilder should load a To Address from an Array", () => {
	var builder = new TransactionBuilder(networks.flo, {
		to: [
			{"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.001}
		]
	})

	expect(builder.to).toContainEqual({"address": "FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu", "value": 0.001})
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

test("TransactionBuilder should be able to get unspents for From Addresses", (done) => {
	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
	var account = new Account(accountMaster, networks.flo, false);

	var addressNode = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)
	var address = new Address(addressNode, networks.flo, false);

	// console.log(address)

	var builder = new TransactionBuilder(networks.flo, {
		from: address,
		to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001}
	}, account)

	builder.buildInputsAndOutputs().then((selected) => {
		expect(selected.fee).toBeGreaterThan(0)
		expect(selected.inputs.length).toBeGreaterThan(0)
		expect(selected.outputs.length).toBeGreaterThan(0)
		done()
	}).catch(console.error)
})