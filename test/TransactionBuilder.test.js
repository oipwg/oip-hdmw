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

test("TransactionBuilder should be able build tx hex", (done) => {
	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
	var account = new Account(accountMaster, networks.flo, false);

	var addressNode = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)
	var address = new Address(addressNode, networks.flo, false);

	// console.log(address)

	var builder = new TransactionBuilder(networks.flo, {
		from: address,
		to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001}
	}, account)

	builder.buildTX().then((hex) => {
		expect(hex).toBe("02000000019cbf3c990fdc5abdddb6132c18ec153a00d9b7f58b93296bf99809f061e38776010000006a473044022017d5de7fc12815069ff429db7da49becee3c14c400e443012f706b3e98c6c3e10220018464e5901a40bc51d62ed91b0a24efa52acc9698c6f314eae2c762706b2f51012102294759360dcc528809caedf39335adf415598a1069de79a43bb11703b35fbf8dffffffff02e8030000000000001976a9147f0e8b2f342a9f6256374138dc11252652a4093d88ace4790100000000001976a91488902905b0a6f436e5ef8a91785423736c69b41588ac00000000")
		done()
	}).catch(console.error)
})

