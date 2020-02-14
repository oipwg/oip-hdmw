/* eslint-env jest */
const Wallet = require('../src').Wallet

test('Wallet can be created from nothing', () => {
  // Discover false is passed to prevent tons of extra async calls
  const w = new Wallet(undefined, { discover: false })
  expect(w.getMnemonic()).toBeDefined()
  expect(w.getSeed()).toBeDefined()
  expect(w.getEntropy()).toBeDefined()
})

test('Wallet Serialize and Deserialize', async (done) => {
  const serialized = {
    masterNode: 'xprv9s21ZrQH143K3HYAgqXMBtsXJbsSY1wcVBoGHjXh8rh5PsL9mfCNuiqL8mesxGyLo55neZf9sNLEfMMKozkXmgtoy139YaTks7bMpmUUGcX',
    seed: 'siren comic spy donkey unknown license asset lens proud bus exhaust section',
    coins: {
      bitcoin: {
        name: 'bitcoin',
        network: {
          messagePrefix: '\u0018Bitcoin Signed Message:\n',
          bech32: 'bc',
          bip32: {
            public: 76067358,
            private: 76066276
          },
          pubKeyHash: 0,
          scriptHash: 5,
          wif: 128,
          slip44: 2147483648
        },
        seed: 'xprv9uvNqaLC9GTaoEELKRZvDSmTP2HFKpJJkm9a1SBe4WhM1JfnK3RyYCJ9XdNN2v6DpimfZgh6pLCfMGtJ4NQTadibva7tUom76JqE6B2AJY1',
        accounts: {
          0: {
            extendedPrivateKey: 'xprv9yohZYidpyKFSuLkW79iwKzZNPTrHKtPS5jrtmB7awBiqVUb1he7ck5hQPbbKXKAX5htnhyXNxJGkyrYrRmep9grqoxty3GF4dX4XybZPkQ',
            addresses: [],
            chains: {
              0: {
                lastUpdate: 1533759501123
              },
              1: {
                index: 1,
                lastUpdate: 0
              }
            }
          }
        }
      },
      litecoin: {
        name: 'litecoin',
        network: {
          messagePrefix: '\u0018Litecoin Signed Message:\n',
          bip32: {
            public: 27108450,
            private: 27106558
          },
          pubKeyHash: 48,
          scriptHash: 50,
          wif: 176,
          slip44: 2147483650
        },
        seed: 'xprv9uvNqaLC9GTaoEELKRZvDSmTP2HFKpJJkm9a1SBe4WhM1JfnK3RyYCJ9XdNN2v6DpimfZgh6pLCfMGtJ4NQTadibva7tUom76JqE6B2AJY1',
        accounts: {
          0: {
            extendedPrivateKey: 'Ltpv78bHMsStHEYdUEruzA4SzRkBzX4mFRnLW2tH7ygcWeCjvn9ggjmBnFSm4Ckked919grZ223MfmriMBfmvEZ5JmTJd8GvWym6jn82NPqe7fb',
            addresses: [],
            chains: {
              0: {
                lastUpdate: 1533759503258
              },
              1: {
                lastUpdate: 1533759508840
              }
            }
          }
        }
      },
      flo: {
        name: 'flo',
        network: {
          bip32: {
            public: 20201579,
            private: 20200497
          },
          slip44: 216,
          messagePrefix: '\u001bFlorincoin Signed Message:\n',
          pubKeyHash: 35,
          scriptHash: 94,
          wif: 163
        },
        seed: 'xprv9uvNqaLC9GTaoEELKRZvDSmTP2HFKpJJkm9a1SBe4WhM1JfnK3RyYCJ9XdNN2v6DpimfZgh6pLCfMGtJ4NQTadibva7tUom76JqE6B2AJY1',
        accounts: {
          0: {
            extendedPrivateKey: 'Fprv4yb4HkMenJmHv56HqcXq1KRKGXFuASq9FSosLHciMsNcNfE2181F7FmZ18qEnkR51pheXLL3Ev3us91CZ2TbNr4mXdh8pnvxxNMEko82MtZ',
            addresses: [
              {
                addrStr: 'FFM4qQ8eQ9bFn5CLpbkwuKEVxTFphKbQP4',
                wif: 'RE2Q6RswEEPSfpE8c5kfK5xa4C2AHNecCfopqvz9pN8sU1kVDKnp',
                balanceSat: 985686398,
                totalReceivedSat: 7242131745,
                unconfirmedBalanceSat: 0,
                transactions: [
                  '39f9cd85b3a45f00dd702595aa1ffe2558ac87e377b245f9787d8d4b39f27611',
                  'd9055f0822b2e93e124b0607163697a77e471eb4b77492a2a367503eeb4e0e8a',
                  'a49760f963a907614137744f5c4f7942c15f00149b554726f31eb3f53abd45de',
                  '7a436d382f8c87855a439044961eaf1c89bb0ecfcee24d619cbd8a06accaaa66',
                  '31e328319c56ed261f14d7f76fee701a832d1eeea1fa22e95b798e2b72f90c0e',
                  'ec94ea1264b8886434c4b591d3895e85952237591792b4e642b036a7d06c40b0',
                  '3bc0eae08e48c26351fa730509d72e6b244496a9795edf5554d6e1a2c89f7844',
                  '1a474c2ef01ab4fe314391420316b72869c57714e9a382c83d07583972037e61',
                  '717fbae105bb819dd84ec3b71a6d50d5d273427993175cefc63d0bd5bad5db12'
                ],
                spentTransactions: [],
                lastUpdated: 1533759500986
              }
            ],
            chains: {
              0: {
                lastUpdate: 1533759502335
              },
              1: {
                lastUpdate: 1533759502649
              }
            }
          },
          1: {
            extendedPrivateKey: 'Fprv4yb4HkMenJmHzALB898duL1ipj8EobiwX4Maw6vX5cZpyLkZWFJY8oS3C8kZTk8oCGU1UJbLHYojgeVVg7xM1SFyzuf8qPTVLeX79dnj2yH',
            addresses: [],
            chains: {
              0: {
                lastUpdate: 1533759502960
              },
              1: {
                lastUpdate: 1533759503301
              }
            }
          }
        }
      }
    }
  }

  const w = new Wallet(serialized.seed, {
    discover: false,
    serializedData: serialized
  })

  expect(w.getMnemonic()).toBe('siren comic spy donkey unknown license asset lens proud bus exhaust section')

  const floBalance = await w.getCoin('flo').getBalance({ discover: false })
  expect(floBalance).toBe(9.85686398)

  expect(w.serialize()).toEqual(serialized)

  done()
})

test('Wallet can be defined from Mnemonic', () => {
  const w = new Wallet('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', { discover: false })

  expect(w.getSeed()).toBe('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4')
  expect(w.getMnemonic()).toBe('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')
  expect(w.getEntropy()).toBe('00000000000000000000000000000000')
})

test('Wallet can be defined from Seed Hex', () => {
  const w = new Wallet('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', { discover: false })

  expect(w.getSeed()).toBe('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4')
  expect(w.getEntropy()).toBeUndefined()
  expect(w.getMnemonic()).toBeUndefined()
})

test('Wallet can be defined from BIP39 Entropy', () => {
  const w = new Wallet('00000000000000000000000000000000', { discover: false })

  expect(w.getMnemonic()).toBe('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')
  expect(w.getSeed()).toBe('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4')
  expect(w.getEntropy()).toBe('00000000000000000000000000000000')
})

test('Wallet can spawn on only one defined coin', () => {
  const w = new Wallet('00000000000000000000000000000000', {
    discover: false,
    supportedCoins: 'floTestnet'
  })

  expect(w.getCoin('floTestnet')).toBeDefined()
  expect(w.getCoin('bitcoin')).toBeUndefined()
  expect(w.getCoin('litecoin')).toBeUndefined()
  expect(w.getCoin('flo')).toBeUndefined()
})

test('Wallet can spawn on multiple defined coins', () => {
  const w = new Wallet('00000000000000000000000000000000', {
    discover: false,
    supportedCoins: ['flo', 'floTestnet']
  })

  expect(w.getCoin('floTestnet')).toBeDefined()
  expect(w.getCoin('flo')).toBeDefined()
  expect(w.getCoin('bitcoin')).toBeUndefined()
  expect(w.getCoin('litecoin')).toBeUndefined()
})

test('Wallet can return all coins', () => {
  const w = new Wallet('00000000000000000000000000000000', { discover: false })

  const coins = w.getCoins()

  expect(coins.bitcoin).toBeDefined()
  expect(coins.litecoin).toBeDefined()
  expect(coins.flo).toBeDefined()
  expect(coins.bitcoinTestnet).toBeUndefined()
})

test('Wallet getCoinBalances & getFiatBalances', async (done) => {
  const wal = new Wallet('siren comic spy donkey unknown license asset lens proud bus exhaust section', { discover: false })
  const balances = await wal.getCoinBalances()
  // for (let coin in balances) {
  //   console.log(typeof balances[coin])
  // }
  // console.log(balances)

  expect(balances).toHaveProperty('flo')
  expect(balances).toHaveProperty('bitcoin')
  expect(balances).toHaveProperty('litecoin')

  const fb = await wal.getFiatBalances({ discover: false })

  expect(fb).toHaveProperty('flo')
  expect(fb).toHaveProperty('bitcoin')
  expect(fb).toHaveProperty('litecoin')

  done()
}, 100000)

test('Wallet getExchangeRates', async (done) => {
  const walb = new Wallet('siren comic spy donkey unknown license asset lens proud bus exhaust section', { discover: false })
  const rates = await walb.getExchangeRates()
  // console.log(rates)
  expect(rates).toHaveProperty('flo')
  expect(rates).toHaveProperty('bitcoin')
  expect(rates).toHaveProperty('litecoin')

  done()
}, 100000)

test('Wallet getExchangeRates with coin options', async (done) => {
  const walb = new Wallet('siren comic spy donkey unknown license asset lens proud bus exhaust section', { discover: false })
  const rates = await walb.getExchangeRates({ coins: ['flo'] })
  expect(rates.flo).toBeDefined()
  expect(typeof rates.flo === 'number')
  done()
}, 100000)

test('get network api urls', () => {
  const testWallet = new Wallet('siren comic spy donkey unknown license asset lens proud bus exhaust section', { discover: false })
  expect(testWallet.getExplorerUrls()).toEqual(
    {
      bitcoin: 'https://blockexplorer.com/api',
      flo: 'https://livenet.flocha.in/api',
      litecoin: 'https://insight.litecore.io/api'
    }
  )
})

test('set network apis', () => {
  const wallet = new Wallet('siren comic spy donkey unknown license asset lens proud bus exhaust section', { discover: false })
  const oldNetworks = wallet.getNetworks()

  const oldUrls = []
  for (const coin in oldNetworks) {
    if (!Object.prototype.hasOwnProperty.call(oldNetworks, coin)) continue
    oldUrls.push(oldNetworks[coin].explorer.url)
  }

  const options = { flo: 'flo.test', bitcoin: 'bitcoin.test', litecoin: 'litecoin.test' }
  wallet.setExplorerUrls(options)
  const newNetworks = wallet.getNetworks()

  const newUrls = []
  for (const coin in newNetworks) {
    if (!Object.prototype.hasOwnProperty.call(newNetworks, coin)) continue
    newUrls.push(newNetworks[coin].explorer.url)
  }

  const myUrls = []
  for (const url of newUrls) {
    if (!oldUrls.includes(url)) {
      myUrls.push(url)
    }
  }

  expect(myUrls.length).toEqual(3)
  for (const coin in options) {
    expect(myUrls.includes(options[coin]))
  }
})

test('static method call from instance', () => {
  const wallet = new Wallet('siren comic spy donkey unknown license asset lens proud bus exhaust section', { discover: false })
  expect(wallet.constructor.getDefaultExplorerUrls()).toEqual({
    bitcoin: 'https://blockexplorer.com/api',
    bitcoinTestnet: 'https://testnet.blockexplorer.com/api',
    flo: 'https://livenet.flocha.in/api',
    floTestnet: 'https://testnet.flocha.in/api',
    litecoin: 'https://insight.litecore.io/api',
    litecoinTestnet: 'https://testnet.litecore.io/api'
  })
})

test('reset network api urls', () => {
  const wallet = new Wallet('siren comic spy donkey unknown license asset lens proud bus exhaust section', { discover: false })
  wallet.setExplorerUrls({
    flo: 'flow',
    bitcoin: 'bitcoin',
    litecoin: 'litecoin'
  })
  expect(wallet.getExplorerUrls()).toEqual({
    flo: 'flow',
    bitcoin: 'bitcoin',
    litecoin: 'litecoin'
  })
  wallet.resetExplorerUrls()
  expect(wallet.getExplorerUrls()).toEqual(
    {
      bitcoin: 'https://blockexplorer.com/api',
      flo: 'https://livenet.flocha.in/api',
      litecoin: 'https://insight.litecore.io/api'
    }
  )
})

test('get network api urls with testnet coins', () => {
  const wallet = new Wallet('siren comic spy donkey unknown license asset lens proud bus exhaust section', { discover: false })
  wallet.addTestnetCoins()
  expect(wallet.getExplorerUrls()).toEqual(
    {
      bitcoin: 'https://blockexplorer.com/api',
      bitcoinTestnet: 'https://testnet.blockexplorer.com/api',
      flo: 'https://livenet.flocha.in/api',
      floTestnet: 'https://testnet.flocha.in/api',
      litecoin: 'https://insight.litecore.io/api',
      litecoinTestnet: 'https://testnet.litecore.io/api'
    }
  )
})

test('add default supported testnet coins', () => {
  const wallet = new Wallet('siren comic spy donkey unknown license asset lens proud bus exhaust section', { discover: false })
  expect(Object.keys(wallet.getCoins())).toEqual(['bitcoin', 'litecoin', 'flo'])
  wallet.addTestnetCoins()
  expect(Object.keys(wallet.getCoins())).toEqual(['bitcoin', 'litecoin', 'flo', 'bitcoinTestnet', 'floTestnet', 'litecoinTestnet'])
})

test('remove default supported testnet coins', () => {
  const wallet = new Wallet('siren comic spy donkey unknown license asset lens proud bus exhaust section', { discover: false })
  expect(Object.keys(wallet.getCoins())).toEqual(['bitcoin', 'litecoin', 'flo'])
  wallet.addTestnetCoins()
  expect(Object.keys(wallet.getCoins())).toEqual(['bitcoin', 'litecoin', 'flo', 'bitcoinTestnet', 'floTestnet', 'litecoinTestnet'])
  wallet.addTestnetCoins(false)
  expect(Object.keys(wallet.getCoins())).toEqual(['bitcoin', 'litecoin', 'flo'])
})

test('remove testnet coins in getCoinBalances', () => {
  const wallet = new Wallet('siren comic spy donkey unknown license asset lens proud bus exhaust section', { discover: false })
  wallet.addTestnetCoins()
  expect(Object.keys(wallet.getCoins())).toEqual(['bitcoin', 'litecoin', 'flo', 'bitcoinTestnet', 'floTestnet', 'litecoinTestnet'])

  const coinnames = Object.keys(wallet.getCoins())

  for (let i = coinnames.length - 1; i >= 0; i--) {
    if (coinnames[i].includes('Testnet')) {
      coinnames.splice(i, 1)
    }
  }

  expect(coinnames).toEqual(['bitcoin', 'litecoin', 'flo'])
})

// test('Wallet sendPayment', (done) => {
//   let w = new Wallet('00000000000000000000000000000000', {
//     discover: false,
//     supportedCoins: ['floTestnet', 'bitcoin', 'litecoin', 'flo']
//   })

//   w.sendPayment({
//     from: "odqpABssS7twQfwqNhQdb58c8RiG6awnCh",
//     to:  { oPHTT8kciUGjeqKrMYDHh4gL8DFBaNF1xL: 0.000001 },
//     floData: "oip-hdmw Wallet Payment!"
//   }).then((txid) => {
//     console.log(txid);
//     expect(txid).toBeDefined()
//     done()
//   }).catch((error) => {
//     expect(error).toBeUndefined()
//     done()
//   })
// }, 20000);
