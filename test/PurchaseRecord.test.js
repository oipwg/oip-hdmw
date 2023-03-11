// /* eslint-env jest */
const Wallet = require('../src').Wallet

test.skip('Wallet PurchaseRecord', async (done) => {
  const w = new Wallet('siren comic spy donkey unknown license asset lens proud bus exhaust section')

  const txid = '2457677f68e5994bfc778675c73e94c4a5526bc00781e8a6d208271ce56cfdfe'
  const terms = '3733247363'

  const cool = await w.purchaseRecord({ txid, terms })

  console.log({ cool })

  expect(cool).toEqual({
    id: '2457677f68e5994bfc778675c73e94c4a5526bc00781e8a6d208271ce56cfdfe',
    term: '3733247363',
    network: 'NETWORK_IPFS',
    location: 'QmfZFy8T8CDpAu3s53N9dj4cXTo7muB8omr1q5Pn4kLCqt/We%20were.mp3',
    valid_until: ''

  })
}, 1000000)

test('empty', async () => {})
