var bip32 = require('bip32');
var TransactionBuilder = require('../src').TransactionBuilder;
var Networks = require('../src').Networks;
var Account = require('../src').Account;
var Address = require('../src').Address;

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
	// oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL
	var address = new Address("cNatkZLp1yixJaR5M2Li3nQEwKoBPt9znhszu2mZkaKiTh7rifGj", Networks.flo_testnet, false);

	var builder = new TransactionBuilder(Networks.flo_testnet, {
		from: address
	})

	builder.getUnspents().then((utxos) => {
		expect(utxos.length).toBeGreaterThan(0)
		done()
	}).catch(console.error)
}, 20000)

test("TransactionBuilder should be able to build inputs and outputs for From Addresses", (done) => {
	// oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL
	var address = new Address("cNatkZLp1yixJaR5M2Li3nQEwKoBPt9znhszu2mZkaKiTh7rifGj", Networks.flo_testnet, false);

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
	// oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL
	var address = new Address("cNatkZLp1yixJaR5M2Li3nQEwKoBPt9znhszu2mZkaKiTh7rifGj", Networks.flo_testnet, false);

	var builder = new TransactionBuilder(Networks.flo_testnet, {
		from: address,
		to: {"odqpABssS7twQfwqNhQdb58c8RiG6awnCh": 0.00001}
	})

	builder.buildTX().then((hex) => {
		expect(hex).toBe("020000000140ed31c981fd258289a53073f76bc61794443b5a0e8318570320c62a86500a65000000006a473044022030e6fb170e58114dd4f3cf528229162a94d80150a7ec014618f957a018c6df7b02205c151be42942c281ceab9eda6f54521872918fa472e59632e84d7e8ce2337f7a012102fd32e0042afb858ebc63f93a0aed5f78d3f9031e6d1d79985f5916bf1588c1bfffffffff02e8030000000000001976a914e60f738c04c7a82f47e81b79177e13c61a7dc4c488ac9486f505000000001976a91408c15ab42488767228366ea3178eb32ac222ffb688ac0000000000")
		done()
	}).catch(console.error)
}, 10000)

test("TransactionBuilder with Flo Data should be able build tx hex", (done) => {
	// oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL
	var address = new Address("cNatkZLp1yixJaR5M2Li3nQEwKoBPt9znhszu2mZkaKiTh7rifGj", Networks.flo_testnet, false);

	var builder = new TransactionBuilder(Networks.flo_testnet, {
		from: address,
		to: {"odqpABssS7twQfwqNhQdb58c8RiG6awnCh": 0.00001},
		floData: "Testing oip-hdmw!"
	})

	builder.buildTX().then((hex) => {
		expect(hex).toBe("020000000140ed31c981fd258289a53073f76bc61794443b5a0e8318570320c62a86500a65000000006b483045022100cf6dc78551daf5a3e679e52fd9b29468d398c6e59cac3f635320835c785e484002205bcfb207c934064deec7133336ab29e5175c36082ce7959cecda60f782ee80f1012102fd32e0042afb858ebc63f93a0aed5f78d3f9031e6d1d79985f5916bf1588c1bfffffffff02e8030000000000001976a914e60f738c04c7a82f47e81b79177e13c61a7dc4c488ac9486f505000000001976a91408c15ab42488767228366ea3178eb32ac222ffb688ac000000001154657374696e67206f69702d68646d7721")
		done()
	}).catch(console.error)
}, 10000)

// test("TransactionBuilder should be able build & send tx hex", (done) => {
// 	// odqpABssS7twQfwqNhQdb58c8RiG6awnCh = cVeB2FKMVxWwAN9bceohxaTnGjCv9HnPEJJF3PYfeRpoSZeQyenc
// 	// Test sending to self
// 	var address = new Address("cVeB2FKMVxWwAN9bceohxaTnGjCv9HnPEJJF3PYfeRpoSZeQyenc", Networks.flo_testnet, false);

// 	var builder = new TransactionBuilder(Networks.flo_testnet, {
// 		from: address,
// 		to: {"odqpABssS7twQfwqNhQdb58c8RiG6awnCh": 1},
// 		floData: "Test!"
// 	})

// 	builder.sendTX().then((txid) => {
// 		expect(txid.length).toBeGreaterThan(10)

// 		var builder2 = new TransactionBuilder(Networks.flo_testnet, {
// 			from: address,
// 			to: {"odqpABssS7twQfwqNhQdb58c8RiG6awnCh": 1},
// 			floData: "Test two!"
// 		})

// 		builder2.sendTX().then((txid) => {
// 			expect(txid.length).toBeGreaterThan(10)
// 			done()
// 		}).catch(console.error)
// 	}).catch(console.error)
// }, 10000)

