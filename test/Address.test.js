var bip32 = require('bip32');
var Address = require('../lib').Address;
var Networks = require('../lib').Networks;

test('Address is able to check its balance from String', (done) => {
	var address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, false);

	address.updateState().then((addr) => {
		expect(addr.getTotalReceived()).toBeGreaterThan(0)
		done()
	})
})

test('Address is able to check its balance from BIP32', (done) => {
	var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)

	var address = new Address(node, Networks.flo, false);

	address.updateState().then((addr) => {
		expect(addr.getTotalReceived()).toBeGreaterThan(0)
		done()
	})
}, 10000)

test('Address to PublicAddress', () => {
	var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)

	var address = new Address(node, Networks.flo, false);

	expect(address.getPublicAddress()).toBe("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp")
})

test('Address to WIF', () => {
	var node = bip32.fromBase58("Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw", Networks.flo.network)

	var address = new Address(node, Networks.flo, false);

	expect(address.getPrivateAddress()).toBe("RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5")
})

test('Address WIF roundtrip', () => {
	var address = new Address("RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5", Networks.flo, false);

	expect(address.getPrivateAddress()).toBe("RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5")
})

test('Address WIF to PublicAddress', () => {
	var address = new Address("RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5", Networks.flo, false);

	expect(address.getPublicAddress()).toBe("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp")
})

// Add tests to confirm removeSpent and addSpent work properly and as expected.
// Add tests for toJSON and fromJSON
test('Test Serialization of Address (no discovery)', () => {
	var address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, false);

	expect(address.toJSON()).toEqual({ 
		addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
        balanceSat: 0,
        totalReceivedSat: 0,
        unconfirmedBalanceSat: 0,
        transactions: [],
        spentTransactions: [],
        lastUpdated: 0 
    });
})

test('Test Serialization of Address (roundtrip, no discovery)', () => {
	var address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, { 
		addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
        balanceSat: 123,
        totalReceivedSat: 234,
        unconfirmedBalanceSat: 345,
        transactions: ['abcde'],
        spentTransactions: ['bcdef'],
        lastUpdated: 456 
    });

	expect(address.toJSON()).toEqual({ 
		addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
        balanceSat: 123,
        totalReceivedSat: 234,
        unconfirmedBalanceSat: 345,
        transactions: ['abcde'],
        spentTransactions: ['bcdef'],
        lastUpdated: 456 
    });
})

test('Test Serialization of Address with Spent Transactions (no discovery)', () => {
	var address = new Address("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", Networks.flo, {
		addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp', 
		spentTransactions: ["aaaaaa"]
	});

	var got = address.toJSON()

	var expected = { 
		addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
        balanceSat: 0,
        totalReceivedSat: 0,
        unconfirmedBalanceSat: 0,
        transactions: [],
        spentTransactions: ["aaaaaa"],
        lastUpdated: got.lastUpdated
    }

	expect(got).toEqual(expected);
})

test('get utxo for address', (done) => {
	var address = new Address("oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S", Networks.flo_testnet, false);

	address.getUnspent().then((utxos) => {
		expect(utxos.length).toBeGreaterThan(0)
		done()
	})
}, 10000)

test('get utxo for address (remove spent)', (done) => {
	var address = new Address("oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S", Networks.flo_testnet, {
		addrStr: 'oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S', 
		spentTransactions: ["2420d859f3b064ff89f503a0a5175b828338055ee73c325dc46a2d04a78be6b0"]
	});

	address.getUnspent().then((utxos) => {
		expect(utxos.length).toBe(0)
		done()
	})
}, 10000)

// test('test send payment on Address', (done) => {
// 	// odqpABssS7twQfwqNhQdb58c8RiG6awnCh = cVeB2FKMVxWwAN9bceohxaTnGjCv9HnPEJJF3PYfeRpoSZeQyenc
// 	// oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S = cV6NTLu255SZ5iCNkVHezNGDH5qv6CanJpgBPqYgJU13NNKJhRs1
// 	var address = new Address("cVeB2FKMVxWwAN9bceohxaTnGjCv9HnPEJJF3PYfeRpoSZeQyenc", Networks.flo_testnet, false);

// 	address.sendPayment({oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S: 0.000001}).then((txid) => {
// 		console.log(txid);
// 		expect(txid).toBeDefined()
// 		done()
// 	})
// }, 10000)