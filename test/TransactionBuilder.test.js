/* eslint-env jest */
const bip32 = require('bip32')
const TransactionBuilder = require('../src').TransactionBuilder
const Networks = require('../src').Networks
const Address = require('../src').Address

test('TransactionBuilder should load a From Address', () => {
  const node = bip32.fromBase58('Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw', Networks.flo.network)
  const address = new Address(node, Networks.flo, false)

  const builder = new TransactionBuilder(Networks.flo, {
    from: address
  })

  expect(builder.from).toContainEqual(address)
})

test('TransactionBuilder should load a From Address from an Array', () => {
  const node = bip32.fromBase58('Fprv52CvMcVNkt3jU7MjybjTNie1Bqm7T66KBueSVFW74hXH43sXMAUdmk73TENACSHhHbwm7ZnHiaW3DxtkwhsbtpNjsh4EpnFVjZVJS7oxNqw', Networks.flo.network)
  const address = new Address(node, Networks.flo, false)

  const builder = new TransactionBuilder(Networks.flo, {
    from: [
      address
    ]
  })

  expect(builder.from).toContainEqual(address)
})

test('TransactionBuilder should load a To Address', () => {
  const builder = new TransactionBuilder(Networks.flo, {
    to: { FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu: 0.001 }
  })

  expect(builder.to).toContainEqual({ address: 'FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu', value: 0.001 })
})

test('TransactionBuilder should load a To Address from an Array', () => {
  const builder = new TransactionBuilder(Networks.flo, {
    to: [
      { FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu: 0.001 }
    ]
  })

  expect(builder.to).toContainEqual({ address: 'FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu', value: 0.001 })
})

test('TransactionBuilder should be able to get unspents for From Addresses', (done) => {
  // oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL
  const address = new Address('cNatkZLp1yixJaR5M2Li3nQEwKoBPt9znhszu2mZkaKiTh7rifGj', Networks.floTestnet, false)

  const builder = new TransactionBuilder(Networks.floTestnet, {
    from: address
  })

  builder.getUnspents().then((utxos) => {
    expect(utxos.length).toBeGreaterThan(0)
    done()
  }).catch(console.error)
}, 20000)

test('TransactionBuilder should be able to build inputs and outputs for From Addresses', (done) => {
  // oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL
  const address = new Address('cNatkZLp1yixJaR5M2Li3nQEwKoBPt9znhszu2mZkaKiTh7rifGj', Networks.floTestnet, false)

  const builder = new TransactionBuilder(Networks.floTestnet, {
    from: address,
    to: { odqpABssS7twQfwqNhQdb58c8RiG6awnCh: 0.00001 }
  })

  builder.buildInputsAndOutputs().then((selected) => {
    expect(selected.fee).toBeGreaterThan(0)
    expect(selected.inputs.length).toBeGreaterThan(0)
    expect(selected.outputs.length).toBeGreaterThan(0)
    done()
  }).catch(console.error)
}, 20000)

test('TransactionBuilder should be able build tx hex', (done) => {
  // oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL
  const address = new Address('cNatkZLp1yixJaR5M2Li3nQEwKoBPt9znhszu2mZkaKiTh7rifGj', Networks.floTestnet, false)

  const builder = new TransactionBuilder(Networks.floTestnet, {
    from: address,
    to: { odqpABssS7twQfwqNhQdb58c8RiG6awnCh: 0.00001 }
  })

  builder.buildTX().then((hex) => {
    expect(hex).toBe('020000000140ed31c981fd258289a53073f76bc61794443b5a0e8318570320c62a86500a65000000006b483045022100bde7c83a1424697d1d8fefc10c826639190c4f441db32e544b1d53077980ca7902207895e9fec8d09504374390836caf5004153f82a0c313eacbfd2d3486200f3ee9012102fd32e0042afb858ebc63f93a0aed5f78d3f9031e6d1d79985f5916bf1588c1bfffffffff02e8030000000000001976a914e60f738c04c7a82f47e81b79177e13c61a7dc4c488acd084f505000000001976a91408c15ab42488767228366ea3178eb32ac222ffb688ac0000000000')
    done()
  }).catch(console.error)
}, 10000)

test('TransactionBuilder with Flo Data should be able build tx hex', (done) => {
  // oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL
  const address = new Address('cNatkZLp1yixJaR5M2Li3nQEwKoBPt9znhszu2mZkaKiTh7rifGj', Networks.floTestnet, false)

  const builder = new TransactionBuilder(Networks.floTestnet, {
    from: address,
    to: { odqpABssS7twQfwqNhQdb58c8RiG6awnCh: 0.00001 },
    floData: 'Testing oip-hdmw!'
  })

  builder.buildTX().then((hex) => {
    expect(hex).toBe('020000000140ed31c981fd258289a53073f76bc61794443b5a0e8318570320c62a86500a65000000006b483045022100bc2b037c9de1706b8d3a498e8c35516db770c73ec2691dbc873a425983b68070022011bf52ba4b691f7b4183f880f8338ae7c9ccf21c68c7c11b6f996079e3d7d0ce012102fd32e0042afb858ebc63f93a0aed5f78d3f9031e6d1d79985f5916bf1588c1bfffffffff02e8030000000000001976a914e60f738c04c7a82f47e81b79177e13c61a7dc4c488acd084f505000000001976a91408c15ab42488767228366ea3178eb32ac222ffb688ac000000001154657374696e67206f69702d68646d7721')
    done()
  }).catch(console.error)
}, 10000)

// test("TransactionBuilder should be able build & send tx hex", (done) => {
//   // odqpABssS7twQfwqNhQdb58c8RiG6awnCh = cVeB2FKMVxWwAN9bceohxaTnGjCv9HnPEJJF3PYfeRpoSZeQyenc
//   // Test sending to self
//   let address = new Address("cVeB2FKMVxWwAN9bceohxaTnGjCv9HnPEJJF3PYfeRpoSZeQyenc", Networks.floTestnet, false);

//   let builder = new TransactionBuilder(Networks.floTestnet, {
//     from: address,
//     to: {"odqpABssS7twQfwqNhQdb58c8RiG6awnCh": 1},
//     floData: "Test!"
//   })

//   builder.sendTX().then((txid) => {
//     expect(txid.length).toBeGreaterThan(10)

//     let builder2 = new TransactionBuilder(Networks.floTestnet, {
//       from: address,
//       to: {"odqpABssS7twQfwqNhQdb58c8RiG6awnCh": 1},
//       floData: "Test two!"
//     })

//     builder2.sendTX().then((txid) => {
//       expect(txid.length).toBeGreaterThan(10)
//       done()
//     }).catch(console.error)
//   }).catch(console.error)
// }, 10000)
