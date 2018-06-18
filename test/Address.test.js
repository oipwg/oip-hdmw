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
		spentTransactions: ["dcf88fa15cabf64555d8a0da18ffa1d57256ca0cbb877882bd6de2f2bc4f8e9b"]
	});

	address.getUnspent().then((utxos) => {
		expect(utxos.length).toBe(0)
		done()
	})
}, 10000)