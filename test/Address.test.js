/* eslint-env jest */
const bip32 = require('bip32')
const Address = require('../src').Address
const Networks = require('../src').Networks

jest.setTimeout(30000)

test('Address is able to check its balance from String', (done) => {
  const address = new Address('F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp', Networks.flo, false)

  address.updateState().then((addr) => {
    expect(addr.getTotalReceived()).toBeGreaterThan(0)
    done()
  })
}, 10000)

test('Address is able to check its balance from BIP32 (auto-discovery)', (done) => {
  const node = bip32.fromBase58('Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw', Networks.flo.network)

  const address = new Address(node, Networks.flo, true)

  let attempts = 0

  const checkIfComplete = () => {
    attempts += 1
    if (address.getTotalReceived() > 0) {
      expect(address.getTotalReceived()).toBeGreaterThan(0)
      done()
    } else {
      if (attempts > 20) {
        done(new Error('too many attempts'))
      } else {
        setTimeout(checkIfComplete, 1000)
      }
    }
  }

  setTimeout(checkIfComplete, 1000)
})

test('Address is able to check its balance from BIP32 (manual discovery)', (done) => {
  const node = bip32.fromBase58('Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw', Networks.flo.network)

  const address = new Address(node, Networks.flo, false)

  address.updateState().then((addr) => {
    expect(addr.getTotalReceived()).toBeGreaterThan(0)
    done()
  })
}, 100000)

test('Address to PublicAddress (bitcoin)', () => {
  const node = bip32.fromBase58('xprv9z4pot5VBttmtdRTWfWQmoH1taj2axGVzFqSb8C9xaxKymcFzXBDptWmT7FwuEzG3ryjH4ktypQSAewRiNMjANTtpgP4mLTj34bhnZX7UiM', Networks.bitcoin.network)

  const address = new Address(node, Networks.bitcoin, false)

  expect(address.getPublicAddress()).toBe('1NjxqbA9aZWnh17q1UW3rB4EPu79wDXj7x')
})

test('Address error on mismatching network', () => {
  const node = bip32.fromBase58('xprv9z4pot5VBttmtdRTWfWQmoH1taj2axGVzFqSb8C9xaxKymcFzXBDptWmT7FwuEzG3ryjH4ktypQSAewRiNMjANTtpgP4mLTj34bhnZX7UiM', Networks.bitcoin.network)
  let address

  try {
    address = new Address(node, Networks.flo, false)
  } catch (e) {
    expect(e).toBeDefined()
  }

  expect(address).toBe(undefined)
})

test('Address to WIF (bitcoin)', () => {
  const node = bip32.fromBase58('xprv9z4pot5VBttmtdRTWfWQmoH1taj2axGVzFqSb8C9xaxKymcFzXBDptWmT7FwuEzG3ryjH4ktypQSAewRiNMjANTtpgP4mLTj34bhnZX7UiM', Networks.bitcoin.network)

  const address = new Address(node, Networks.bitcoin, false)

  expect(address.getPrivateAddress()).toBe('L43t3od1Gh7Lj55Bzjj1xDAgJDcL7YFo2nEcNaMGiyRZS1CidBVU')
})

test('Address to PublicAddress (litecoin)', () => {
  const node = bip32.fromBase58('Ltpv71G8qDifUiNete8jKbPuw8vfXrCcQFXWinMGEU3JC1FUvSrHnA9tpFh4FkJVUUzcv5ZSq5PNrWnkEhsybsUGGF82My4PGDyRaHZbN9ini5s', Networks.litecoin.network)

  const address = new Address(node, Networks.litecoin, false)

  expect(address.getPublicAddress()).toBe('LZyxm4aTYAFgj5CFsi3DA3PZ2fKfXrETSJ')
})

test('Address to WIF (litecoin)', () => {
  const node = bip32.fromBase58('Ltpv71G8qDifUiNete8jKbPuw8vfXrCcQFXWinMGEU3JC1FUvSrHnA9tpFh4FkJVUUzcv5ZSq5PNrWnkEhsybsUGGF82My4PGDyRaHZbN9ini5s', Networks.litecoin.network)

  const address = new Address(node, Networks.litecoin, false)

  expect(address.getPrivateAddress()).toBe('T3wJcXV5UioVMDYsYk6gNdq6D3uhvT8bChayRG1AZFG3r4mNGT8w')
})

test('Address to PublicAddress (flo)', () => {
  const node = bip32.fromBase58('Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw', Networks.flo.network)

  const address = new Address(node, Networks.flo, false)

  expect(address.getPublicAddress()).toBe('F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp')
})

test('Address to WIF (flo)', () => {
  const node = bip32.fromBase58('Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw', Networks.flo.network)

  const address = new Address(node, Networks.flo, false)

  expect(address.getPrivateAddress()).toBe('RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5')
})

test('Address WIF roundtrip', () => {
  const address = new Address('RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5', Networks.flo, false)

  expect(address.getPrivateAddress()).toBe('RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5')
})

test('Address WIF to PublicAddress', () => {
  const address = new Address('RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5', Networks.flo, false)

  expect(address.getPublicAddress()).toBe('F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp')
})

// Add tests to confirm removeSpent and addSpent work properly and as expected.
// Add tests for serialize and deserialize
test('Test Serialization of Address (no discovery)', () => {
  const address = new Address('F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp', Networks.flo, false)

  expect(address.serialize()).toEqual({
    addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
    balanceSat: 0,
    totalReceivedSat: 0,
    unconfirmedBalanceSat: 0,
    transactions: [],
    spentTransactions: [],
    lastUpdated: 0
  })
})

test('Test Serialization of Address (roundtrip, no discovery)', () => {
  const address = new Address('F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp', Networks.flo, {
    addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
    balanceSat: 123,
    totalReceivedSat: 234,
    unconfirmedBalanceSat: 345,
    transactions: ['abcde'],
    spentTransactions: ['bcdef'],
    lastUpdated: 456
  })

  expect(address.serialize()).toEqual({
    addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
    balanceSat: 123,
    totalReceivedSat: 234,
    unconfirmedBalanceSat: 345,
    transactions: ['abcde'],
    spentTransactions: ['bcdef'],
    lastUpdated: 456
  })
})

test('Test Serialization of Address with Spent Transactions (no discovery)', () => {
  const address = new Address('F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp', Networks.flo, {
    addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
    spentTransactions: ['aaaaaa']
  })

  const got = address.serialize()

  const expected = {
    addrStr: 'F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp',
    balanceSat: 0,
    totalReceivedSat: 0,
    unconfirmedBalanceSat: 0,
    transactions: [],
    spentTransactions: ['aaaaaa'],
    lastUpdated: got.lastUpdated
  }

  expect(got).toEqual(expected)
})

test('Address, from bip32, signMessage and verifySignature', () => {
  const node = bip32.fromBase58('Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw', Networks.flo.network)
  const address = new Address(node, Networks.flo, false)

  const testMessage = 'Message to be used for testing!'

  const signature = address.signMessage(testMessage)

  expect(signature).toBeDefined()

  expect(address.verifySignature(testMessage, signature)).toBe(true)
})

test('Address, from wif, signMessage and verifySignature', () => {
  const address = new Address('RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5', Networks.flo, false)

  const testMessage = 'Message to be used for testing!'

  const signature = address.signMessage(testMessage)

  expect(signature).toBeDefined()

  expect(address.verifySignature(testMessage, signature)).toBe(true)
})

test('Address, from wif, signMessage and verifySignature fail on bad message', () => {
  const address = new Address('RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5', Networks.flo, false)

  const testMessage = 'Message to be used for testing!'

  const signature = address.signMessage(testMessage)

  expect(signature).toBeDefined()

  expect(address.verifySignature('Not the message up above', signature)).toBe(false)
})

test('Address, from pubAddress, signMessage, fail on no private key', () => {
  const address = new Address('F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp', Networks.flo, false)

  const testMessage = 'Message to be used for testing!'

  let signature, error
  try {
    signature = address.signMessage(testMessage)
  } catch (e) {
    error = e
  }

  expect(error).toBeDefined()
  expect(signature).toBeUndefined()
})

test('get utxo for address', (done) => {
  const address = new Address('oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL', Networks.floTestnet, false)

  address.getUnspent().then((utxos) => {
    expect(utxos.length).toBeGreaterThan(0)
    done()
  })
}, 10000)

test('get utxo for address (remove spent)', (done) => {
  const address = new Address('oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL', Networks.floTestnet, {
    addrStr: 'oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL',
    spentTransactions: ['650a50862ac620035718830e5a3b449417c66bf77330a5898225fd81c931ed40']
  })

  address.getUnspent().then((utxos) => {
    let spentRemoved = true

    for (const utxo of utxos) {
      if (utxo.txid === '650a50862ac620035718830e5a3b449417c66bf77330a5898225fd81c931ed40') { spentRemoved = false }
    }

    expect(spentRemoved).toBe(true)
    done()
  })
}, 10000)

// test('test send payment on Address', (done) => {
//   // odqpABssS7twQfwqNhQdb58c8RiG6awnCh = cVeB2FKMVxWwAN9bceohxaTnGjCv9HnPEJJF3PYfeRpoSZeQyenc
//   // oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S = cV6NTLu255SZ5iCNkVHezNGDH5qv6CanJpgBPqYgJU13NNKJhRs1
//   let address = new Address("cVeB2FKMVxWwAN9bceohxaTnGjCv9HnPEJJF3PYfeRpoSZeQyenc", Networks.floTestnet, false);

//   address.sendPayment({oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S: 0.000001}).then((txid) => {
//     console.log(txid);
//     expect(txid).toBeDefined()
//     done()
//   })
// }, 10000)
