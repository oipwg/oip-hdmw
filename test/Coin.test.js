var Coin = require('../src').Coin
var Networks = require('../src').Networks

test('Coin Account keys generated from Mnemonic Match', () => {
  var bitcoin = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.bitcoin, { discover: false })
  var litecoin = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.litecoin, { discover: false })
  var flo = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.flo, { discover: false })

  expect(bitcoin.getExtendedPrivateKey()).toBe('xprv9wnZLsHUEcR3UVuysrCTjAu7FWKXN2m5XVrgkEmeptHqi5yNkR8seouPutDWAJQcUPYDzTDgjK7G1h53M4QeA4myt6gUSUgdFhQSYw7XAV4')
  expect(bitcoin.getExtendedPublicKey()).toBe('xpub6AmukNpN4yyLgyzSysjU6JqqoYA1mVUvtinHYdBGPDppatJXHxT8CcDsmBo9n3yLBgrcw9z62ygt1siT9xai4UaJ2w4FPmY6kPCF96YN2cF')

  expect(bitcoin.getAccount(0).getExtendedPrivateKey()).toBe('xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb')
  expect(bitcoin.getAccount(0).getExtendedPublicKey()).toBe('xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj')
  expect(litecoin.getAccount(0).getExtendedPrivateKey()).toBe('Ltpv7735AbcbmL1gbgDWj2ezvs59rh4RM1oTN2BKTKbfe3146FCPCNFbBBSWfuV9vCJNMXD9LuHpQnqVWpn2hbMhikqPdoGqbS3ptdPoNWEvvgR')
  expect(flo.getAccount(0).getExtendedPrivateKey()).toBe('Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC')
})

test('Coin Serialization & Deserialization', () => {
  var serialized = {
    'name': 'flo_testnet',
    'network': {
      'bip32': {
        'public': 20201698,
        'private': 20200483
      },
      'slip44': 1,
      'messagePrefix': '\u001bFlorincoin Signed Message:\n',
      'pubKeyHash': 115,
      'scriptHash': 58,
      'wif': 239
    },
    'seed': 'xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh',
    'accounts': {
      '0': {
        'extended_private_key': 'Fprt4gUYQvk1qawUdXNqoVhEFAW2Bn7bcYv6gQogtqYBZBUYDqjdtX2g2HcbymAwkEQbM3xJ3rCYRVnsEcxYcg4ZitbW5XazvVH9kJMLnm2rmrb',
        'addresses': [
          {
            'addrStr': 'oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S',
            'wif': 'cV6NTLu255SZ5iCNkVHezNGDH5qv6CanJpgBPqYgJU13NNKJhRs1',
            'balanceSat': 99910908,
            'totalReceivedSat': 499774720,
            'unconfirmedBalanceSat': 0,
            'transactions': [
              '05d2dd88d69cc32717d315152bfb474b0b1b561ae9a477aae091714c4ab216ac'
            ],
            'spentTransactions': [

            ],
            'lastUpdated': 1533756271896
          }
        ],
        'chains': {
          '0': {
            'lastUpdate': 1533756272424
          },
          '1': {
            'lastUpdate': 1533756273083
          }
        }
      },
      '1': {
        'extended_private_key': 'Fprt4gUYQvk1qawUgc4X6a5w3Qry67xXZEMwa1uKmfwMfWre1SP26Eaq1eEr9M9k29oc2qxChcstqqEDh6SWpnysXDeCuRAzyBGFXLi8ewVWrk3',
        'addresses': [
          {
            'addrStr': 'odqpABssS7twQfwqNhQdb58c8RiG6awnCh',
            'wif': 'cVeB2FKMVxWwAN9bceohxaTnGjCv9HnPEJJF3PYfeRpoSZeQyenc',
            'balanceSat': 812826208,
            'totalReceivedSat': 2881310628,
            'unconfirmedBalanceSat': 0,
            'transactions': [
              '1c6355778250d7c92ac4509dae6513f9d1b601e9865c6fa9afab55676eb27c4e'
            ],
            'spentTransactions': [

            ],
            'lastUpdated': 1533756273671
          },
          {
            'addrStr': 'oPHTT8kciUGjeqKrMYDHh4gL8DFBaNF1xL',
            'wif': 'cMuLzyoZ5bWUoGEhNUgjgFLNkKW652NtYTNPVhfRsgSJb4p1bijW',
            'balanceSat': 700,
            'totalReceivedSat': 700,
            'unconfirmedBalanceSat': 0,
            'transactions': [
              '2420d859f3b064ff89f503a0a5175b828338055ee73c325dc46a2d04a78be6b0'
            ],
            'spentTransactions': [

            ],
            'lastUpdated': 1533756273599
          }
        ],
        'chains': {
          '0': {
            'lastUpdate': 1533756274211
          },
          '1': {
            'lastUpdate': 1533756274757
          }
        }
      },
      '2': {
        'extended_private_key': 'Fprt4gUYQvk1qawUjmCB8Vq5jD9ySPDqdcU14E88YYM19bFrwf8Pd91EXPmmoifj273knwNUXAFo5xzJ3GC66gQJTPUvwk8YPbMJFYjasyeUuHP',
        'addresses': [
          {
            'addrStr': 'oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL',
            'wif': 'cNatkZLp1yixJaR5M2Li3nQEwKoBPt9znhszu2mZkaKiTh7rifGj',
            'balanceSat': 100000000,
            'totalReceivedSat': 100000000,
            'unconfirmedBalanceSat': 0,
            'transactions': [
              '650a50862ac620035718830e5a3b449417c66bf77330a5898225fd81c931ed40'
            ],
            'spentTransactions': [

            ],
            'lastUpdated': 1533756275330
          }
        ],
        'chains': {
          '0': {
            'lastUpdate': 1533756275872
          },
          '1': {
            'lastUpdate': 1533756276418
          }
        }
      },
      '3': {
        'extended_private_key': 'Fprt4gUYQvk1qawUmbbY1XhQyAQexiKMsYaafgdL8LhsBPRWPqpePN45u3J521iANNuBR6nKVyjKVWLysgevav6DU5ULPGvgh9bEagg7aLX3hQr',
        'addresses': [

        ],
        'chains': {
          '0': {
            'lastUpdate': 1533756276961
          },
          '1': {
            'lastUpdate': 1533756277503
          }
        }
      }
    }
  }

  let flo_testnet = new Coin(serialized.seed, Networks.flo_testnet, {
    discover: false,
    serialized_data: serialized
  })

  expect(flo_testnet.getExtendedPrivateKey()).toBe('Fprt4fYqEmCM4dWVwLQT4z1gyG1c2PSbJbM9sCkZfAgoWBCB1EFzHvLQg5PypdRntRAzT91PGeGi8DzHbe3wSbwqriP7nZJhAMYqMQtMGyr3weo')
  expect(flo_testnet.getExtendedPublicKey()).toBe('Fput3UqK2g2pBHyVYRLznrwkYRqprgj9Jn7Mw9XCy4DpZx56aaYsxyvgNHaevMxbHq5PBGC7H6LqCqD55oa5UCy5H3FmNhjodaNQNP5UUPGME8K')

  expect(flo_testnet.getAccount(0).getExtendedPrivateKey()).toBe('Fprt4gUYQvk1qawUdXNqoVhEFAW2Bn7bcYv6gQogtqYBZBUYDqjdtX2g2HcbymAwkEQbM3xJ3rCYRVnsEcxYcg4ZitbW5XazvVH9kJMLnm2rmrb')
  expect(flo_testnet.getAccount(0).getExtendedPublicKey()).toBe('Fput3Vm2CqaUxFQUEcKPXNdHpLLF25Q9cjgJkMaLCj5CcxMToC2XZacwiVoH5W36oYn92yXxLucipLSom2gxZSdRs44P5BX2WohYS8m8PMDHhW9')

  expect(flo_testnet.getMainAddress().getPublicAddress()).toBe('oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S')
  expect(flo_testnet.getMainAddress().getTotalReceived()).toBeGreaterThan(0.4)
  expect(flo_testnet.getMainAddress(0).getPublicAddress()).toBe('oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S')
  expect(flo_testnet.getMainAddress(0).getTotalReceived()).toBeGreaterThan(0.4)
  expect(flo_testnet.getMainAddress(1).getPublicAddress()).toBe('odqpABssS7twQfwqNhQdb58c8RiG6awnCh')
  expect(flo_testnet.getMainAddress(1).getTotalReceived()).toBeGreaterThan(1)
  expect(flo_testnet.getMainAddress(2).getPublicAddress()).toBe('oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL')
  expect(flo_testnet.getMainAddress(2).getTotalReceived()).toBeGreaterThan(0.99)
})

test('Can add Account to Coin', () => {
  var bitcoin = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.bitcoin, { discover: false })

  bitcoin.addAccount(1)

  expect(bitcoin.getAccount(1).getExtendedPrivateKey()).toBe('xprv9xpXFhFpqdQK5owUStFsuAiWUxYpLkvQn1QmVDumBKTvmmjkNEZgpMYoAaAftt3JVeDhRkvyLvrKathDToUMdz2FqRF7JNavF7uboJWArrw')
})

test('Can add Account to Coin (string)', () => {
  var bitcoin = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.bitcoin, { discover: false })

  bitcoin.addAccount('1')

  expect(bitcoin.getAccount(1).getExtendedPrivateKey()).toBe('xprv9xpXFhFpqdQK5owUStFsuAiWUxYpLkvQn1QmVDumBKTvmmjkNEZgpMYoAaAftt3JVeDhRkvyLvrKathDToUMdz2FqRF7JNavF7uboJWArrw')
})

test('Account add on second time just returns account', () => {
  var bitcoin = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.bitcoin, { discover: false })

  var x = bitcoin.addAccount('1')
  expect(bitcoin.addAccount(1)).toBe(x)

  expect(bitcoin.getAccount(1).getExtendedPrivateKey()).toBe('xprv9xpXFhFpqdQK5owUStFsuAiWUxYpLkvQn1QmVDumBKTvmmjkNEZgpMYoAaAftt3JVeDhRkvyLvrKathDToUMdz2FqRF7JNavF7uboJWArrw')
})

test('Account auto-adds if not Existing on Coin', () => {
  var bitcoin = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.bitcoin, { discover: false })

  expect(bitcoin.getAccount(1).getExtendedPrivateKey()).toBe('xprv9xpXFhFpqdQK5owUStFsuAiWUxYpLkvQn1QmVDumBKTvmmjkNEZgpMYoAaAftt3JVeDhRkvyLvrKathDToUMdz2FqRF7JNavF7uboJWArrw')
})

test('Coin, get main address (many coins)', () => {
  var bitcoin 		 =	new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.bitcoin, { discover: false })
  var litecoin 		 = 	new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.litecoin, { discover: false })
  var flo 			 = 	new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.flo, { discover: false })
  var bitcoin_testnet = 	new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.bitcoin_testnet, { discover: false })
  var litecoin_testnet = 	new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.litecoin_testnet, { discover: false })
  var flo_testnet 	 =	new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.flo_testnet, { discover: false })

  expect(bitcoin.getMainAddress().getPublicAddress()).toBe('1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA')
  expect(litecoin.getMainAddress(0).getPublicAddress()).toBe('LUWPbpM43E2p7ZSh8cyTBEkvpHmr3cB8Ez')
  expect(flo.getMainAddress(1).getPublicAddress()).toBe('FTogNNXik7eiHZw5uN2KMe4cvcr7GCEjbZ')
  expect(bitcoin_testnet.getMainAddress(1).getPublicAddress()).toBe('n2VQDkgibQ3S8wPVH25Mea3TcQgVFFQqab')
  expect(litecoin_testnet.getMainAddress(1).getPublicAddress()).toBe('n2VQDkgibQ3S8wPVH25Mea3TcQgVFFQqab')
  expect(flo_testnet.getMainAddress(1).getPublicAddress()).toBe('odqpABssS7twQfwqNhQdb58c8RiG6awnCh')
})

test('Coin, get main address, single coin', () => {
  var flo_testnet = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.flo_testnet, { discover: false })

  expect(flo_testnet.getExtendedPrivateKey()).toBe('Fprt4fYqEmCM4dWVwLQT4z1gyG1c2PSbJbM9sCkZfAgoWBCB1EFzHvLQg5PypdRntRAzT91PGeGi8DzHbe3wSbwqriP7nZJhAMYqMQtMGyr3weo')
  expect(flo_testnet.getExtendedPublicKey()).toBe('Fput3UqK2g2pBHyVYRLznrwkYRqprgj9Jn7Mw9XCy4DpZx56aaYsxyvgNHaevMxbHq5PBGC7H6LqCqD55oa5UCy5H3FmNhjodaNQNP5UUPGME8K')

  expect(flo_testnet.getAccount(0).getExtendedPrivateKey()).toBe('Fprt4gUYQvk1qawUdXNqoVhEFAW2Bn7bcYv6gQogtqYBZBUYDqjdtX2g2HcbymAwkEQbM3xJ3rCYRVnsEcxYcg4ZitbW5XazvVH9kJMLnm2rmrb')
  expect(flo_testnet.getAccount(0).getExtendedPublicKey()).toBe('Fput3Vm2CqaUxFQUEcKPXNdHpLLF25Q9cjgJkMaLCj5CcxMToC2XZacwiVoH5W36oYn92yXxLucipLSom2gxZSdRs44P5BX2WohYS8m8PMDHhW9')

  expect(flo_testnet.getMainAddress().getPublicAddress()).toBe('oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S')
  expect(flo_testnet.getMainAddress(0).getPublicAddress()).toBe('oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S')
  expect(flo_testnet.getMainAddress(1).getPublicAddress()).toBe('odqpABssS7twQfwqNhQdb58c8RiG6awnCh')
  expect(flo_testnet.getMainAddress(2).getPublicAddress()).toBe('oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL')
})

test('Coin, get flo_testnet balance', (done) => {
  var flo_testnet = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.flo_testnet, { discover: false })

  flo_testnet.getBalance().then((balance) => {
    expect(flo_testnet.getAccounts()[0]).toBeDefined()
    expect(balance).toBeGreaterThan(1)
    done()
  })
}, 30000)

/* test('Coin, catch network request error', async (done) => {
	let bitcoin = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.bitcoin, {discover: false})

	let myPromise = bitcoin.getBalance({discover: true, test_error: true })
	let balance, error = false;
	try {
		balance = await myPromise;
		console.log("balance", balance)
		expect(balance).toBeDefined()
		done()
	} catch (err) {
		// console.log("Err on catch", err);
		if (err)
			error = true
	}

	expect(error).toBeTruthy()
	done()

}, 10000) */

test('Coin, discover accounts', async (done) => {
  let flo_testnet = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.flo_testnet, { discover: false })

  expect(flo_testnet.getCoinInfo()).toEqual(Networks.flo_testnet)

  let accounts = await flo_testnet.discoverAccounts()

  if (accounts) {
    expect(accounts.length >= 2).toBe(true)
    done()
  }
}, 30000)

test('Coin, getCoinInfo', () => {
  var flo_testnet = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.flo_testnet, { discover: false })

  expect(flo_testnet.getCoinInfo()).toEqual(Networks.flo_testnet)
})

// test('Test send payment (with from account)', (done) => {
// 	var flo_testnet = new Coin('xprv9ukW2Usuz4v9T49296K5xDezLcFCEaGoLo3YGAJNuFmx1McKebuH2S5C5VhaFsBxuChmARtTHRLKnmLjRSL7vGuyDrCaBh7mfdyefDdp5hh', Networks.flo_testnet, {discover: false})

// 	// odqpABssS7twQfwqNhQdb58c8RiG6awnCh
// 	flo_testnet.sendPayment({
// 		from: "odqpABssS7twQfwqNhQdb58c8RiG6awnCh",
// 		to:  { oPHTT8kciUGjeqKrMYDHh4gL8DFBaNF1xL: 0.000001 },
// 		floData: "oip-hdmw Coin Payment!"
// 	}).then((txid) => {
// 		console.log(txid);
// 		expect(txid).toBeDefined()
// 		done()
// 	})
// }, 20000)
