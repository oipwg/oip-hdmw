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
		expect(hex).toBe("02000000019b8e4fbcf2e26dbd827887bb0cca5672d5a1ff18daa0d85545f6ab5ca18ff8dc010000006b483045022100b1cac6e4ace3e1085d37bd796a32353f102250fc82d117267208d1bbab9ea4d502202fcb20c268ca7332bfb92d871459fe9c781dc12609c8c72f116bb07876517379012102a7451395735369f2ecdfc829c0f774e88ef1303dfe5b2f04dbaab30a535dfdd6ffffffff02e8030000000000001976a914e60f738c04c7a82f47e81b79177e13c61a7dc4c488ac282cf505000000001976a9143a2d4145a4f098523b3e8127f1da87cfc55b8e7988ac0000000000")
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
		expect(hex).toBe("02000000019b8e4fbcf2e26dbd827887bb0cca5672d5a1ff18daa0d85545f6ab5ca18ff8dc010000006a47304402201067c9d8a66da33595ea3da659727c43fd4079b83bb25b0ff3780d1594ae01a002201b213c75fe1cc80469828c4b5e842a5c5f1efbb5509874d2a0a40541d32090ee012102a7451395735369f2ecdfc829c0f774e88ef1303dfe5b2f04dbaab30a535dfdd6ffffffff02e8030000000000001976a914e60f738c04c7a82f47e81b79177e13c61a7dc4c488ac282cf505000000001976a9143a2d4145a4f098523b3e8127f1da87cfc55b8e7988ac000000001154657374696e67206f69702d68646d7721")
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

