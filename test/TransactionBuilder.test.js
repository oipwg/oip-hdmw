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
}, 20000)

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
}, 20000)

test("TransactionBuilder should be able build tx hex", (done) => {
	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
	var account = new Account(accountMaster, networks.flo, false);

	// F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp
	var addressNode = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)
	var address = new Address(addressNode, networks.flo, false);

	var builder = new TransactionBuilder(networks.flo, {
		from: address,
		to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001}
	}, account)

	builder.buildTX().then((hex) => {
		expect(hex).toBe("02000000019cbf3c990fdc5abdddb6132c18ec153a00d9b7f58b93296bf99809f061e38776010000006a4730440220514489daecabc8ab449a283e766d723a98a91b1fff47d04d91c5f95e052fee42022031cbf5a17fb730f00c55dad7d4d0fb638fded1f4fa8ab9278f5fa6bdd066b30b012102294759360dcc528809caedf39335adf415598a1069de79a43bb11703b35fbf8dffffffff02e8030000000000001976a9147f0e8b2f342a9f6256374138dc11252652a4093d88ac342c0100000000001976a91420a5b83899c010d27c2a2a01f2fc81f2d803940288ac0000000000")
		done()
	}).catch(console.error)
}, 20000)

test("TransactionBuilder should be able build tx hex with Flo Data", (done) => {
	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
	var account = new Account(accountMaster, networks.flo, false);

	// F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp
	var addressNode = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", networks.flo.network)
	var address = new Address(addressNode, networks.flo, false);

	var builder = new TransactionBuilder(networks.flo, {
		from: address,
		to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001},
		floData: "Testing oip-hdmw!"
	}, account)

	builder.buildTX().then((hex) => {
		expect(hex).toBe("02000000019cbf3c990fdc5abdddb6132c18ec153a00d9b7f58b93296bf99809f061e38776010000006a4730440220514489daecabc8ab449a283e766d723a98a91b1fff47d04d91c5f95e052fee42022031cbf5a17fb730f00c55dad7d4d0fb638fded1f4fa8ab9278f5fa6bdd066b30b012102294759360dcc528809caedf39335adf415598a1069de79a43bb11703b35fbf8dffffffff02e8030000000000001976a9147f0e8b2f342a9f6256374138dc11252652a4093d88ac342c0100000000001976a91420a5b83899c010d27c2a2a01f2fc81f2d803940288ac000000001154657374696e67206f69702d68646d7721")
		done()
	}).catch(console.error)
}, 20000)

// https://livenet.flocha.in/tx/46d7d1f5dc9afb7501c4243a0bc6ab6945430648203c38a2e942da5af2adff2b
// test("TransactionBuilder should be able build & send tx hex", (done) => {
// 	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
// 	var account = new Account(accountMaster, networks.flo, false);

// 	// FQkUtNeQgBWFrxEfuTQ9hFzA23skfw1BwX
// 	var address = new Address("RDdgBfYo8w2JZ6XcSxDMSmQwDDUiXp2as7jLcAVP4W1d4xDikUaa", networks.flo, false);

// 	var builder = new TransactionBuilder(networks.flo, {
// 		from: address,
// 		to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001},
// 		floData: "Test!"
// 	}, account)

// 	builder.sendTX().then((txid) => {
// 		expect(txid.length).toBeGreaterThan(10)
// 		done()
// 	}).catch(console.error)
// }, 10000)

