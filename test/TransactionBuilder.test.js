var bip32 = require('bip32');
var TransactionBuilder = require('../lib').TransactionBuilder;
var Networks = require('../lib').Networks;
var Account = require('../lib').Account;
var Address = require('../lib').Address;

test("TransactionBuilder should load a From Address", () => {
	var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
	var address = new Address(node, Networks.flo, false);

	var builder = new TransactionBuilder(Networks.flo, {
		from: address
	})

	expect(builder.from).toContainEqual(address)
})

test("TransactionBuilder should load a From Address from an Array", () => {
	var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)
	var address = new Address(node, Networks.flo, false);

	var builder = new TransactionBuilder(Networks.flo, {
		from: [
			address
		]
	})

	expect(builder.from).toContainEqual(address)
})

test("TransactionBuilder should load a To Address", () => {
	var builder = new TransactionBuilder(Networks.flo, {
		to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.001}
	})

	expect(builder.to).toContainEqual({"address": "FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu", "value": 0.001})
})

test("TransactionBuilder should load a To Address from an Array", () => {
	var builder = new TransactionBuilder(Networks.flo, {
		to: [
			{"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.001}
		]
	})

	expect(builder.to).toContainEqual({"address": "FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu", "value": 0.001})
})

test("TransactionBuilder should be able to get unspents for From Addresses", (done) => {
	// oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S
	var address = new Address("cV6NTLu255SZ5iCNkVHezNGDH5qv6CanJpgBPqYgJU13NNKJhRs1", Networks.flo_testnet, false);

	var builder = new TransactionBuilder(Networks.flo_testnet, {
		from: address
	})

	builder.getUnspents().then((utxos) => {
		expect(utxos.length).toBeGreaterThan(0)
		done()
	}).catch(console.error)
}, 20000)

test("TransactionBuilder should be able to get unspents for From Addresses", (done) => {
	// oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S
	var address = new Address("cV6NTLu255SZ5iCNkVHezNGDH5qv6CanJpgBPqYgJU13NNKJhRs1", Networks.flo_testnet, false);

	var builder = new TransactionBuilder(Networks.flo_testnet, {
		from: address,
		to: {"odqpABssS7twQfwqNhQdb58c8RiG6awnCh": 0.00001}
	})

	builder.buildInputsAndOutputs().then((selected) => {
		expect(selected.fee).toBeGreaterThan(0)
		expect(selected.inputs.length).toBeGreaterThan(0)
		expect(selected.outputs.length).toBeGreaterThan(0)
		done()
	}).catch(console.error)
}, 20000)

test("TransactionBuilder should be able build tx hex", (done) => {
	// oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S
	var address = new Address("cV6NTLu255SZ5iCNkVHezNGDH5qv6CanJpgBPqYgJU13NNKJhRs1", Networks.flo_testnet, false);

	var builder = new TransactionBuilder(Networks.flo_testnet, {
		from: address,
		to: {"odqpABssS7twQfwqNhQdb58c8RiG6awnCh": 0.00001}
	})

	builder.buildTX().then((hex) => {
		expect(hex).toBe("0200000001b0e68ba7042d6ac45d323ce75e053883825b17a5a003f589ff64b0f359d82024010000006b483045022100c49f832fbab9fed571b5b635dab11bf2fa095af891b646b22f01daee9e71bdc1022073783dc2f5c59fb4319831d9860ce603ac4c9c2003759f2797a372d2c5da562e012102a7451395735369f2ecdfc829c0f774e88ef1303dfe5b2f04dbaab30a535dfdd6ffffffff02e8030000000000001976a914e60f738c04c7a82f47e81b79177e13c61a7dc4c488ac7027f405000000001976a9143a2d4145a4f098523b3e8127f1da87cfc55b8e7988ac0000000000")
		done()
	}).catch(console.error)
}, 20000)

test("TransactionBuilder should be able build tx hex with Flo Data", (done) => {
	// oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S
	var address = new Address("cV6NTLu255SZ5iCNkVHezNGDH5qv6CanJpgBPqYgJU13NNKJhRs1", Networks.flo_testnet, false);

	var builder = new TransactionBuilder(Networks.flo_testnet, {
		from: address,
		to: {"odqpABssS7twQfwqNhQdb58c8RiG6awnCh": 0.00001},
		floData: "Testing oip-hdmw!"
	})

	builder.buildTX().then((hex) => {
		expect(hex).toBe("0200000001b0e68ba7042d6ac45d323ce75e053883825b17a5a003f589ff64b0f359d82024010000006a47304402204a30747e876763784a1fe641d851123ea722ef0dde761c86620e172ccc96a3450220292df86ec60de85bd01e78c0077756824b5226718f46b77960ce94d141c298c4012102a7451395735369f2ecdfc829c0f774e88ef1303dfe5b2f04dbaab30a535dfdd6ffffffff02e8030000000000001976a914e60f738c04c7a82f47e81b79177e13c61a7dc4c488ac7027f405000000001976a9143a2d4145a4f098523b3e8127f1da87cfc55b8e7988ac000000001154657374696e67206f69702d68646d7721")
		done()
	}).catch(console.error)
}, 20000)

// https://livenet.flocha.in/tx/46d7d1f5dc9afb7501c4243a0bc6ab6945430648203c38a2e942da5af2adff2b
// test("TransactionBuilder should be able build & send tx hex", (done) => {
// 	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
// 	var account = new Account(accountMaster, Networks.flo, false);

// 	// FQkUtNeQgBWFrxEfuTQ9hFzA23skfw1BwX
// 	var address = new Address("RDdgBfYo8w2JZ6XcSxDMSmQwDDUiXp2as7jLcAVP4W1d4xDikUaa", Networks.flo, false);

// 	var builder = new TransactionBuilder(Networks.flo, {
// 		from: address,
// 		to: {"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu": 0.00001},
// 		floData: "Test!"
// 	}, account)

// 	builder.sendTX().then((txid) => {
// 		expect(txid.length).toBeGreaterThan(10)
// 		done()
// 	}).catch(console.error)
// }, 10000)

