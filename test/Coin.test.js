var Coin = require('../src').Coin;
var Networks = require('../src').Networks;

test('Coin Account keys generated from Mnemonic Match', () => {
	var bitcoin = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.bitcoin, false)
	var litecoin = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.litecoin, false)
	var flo = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.flo, false)

	expect(bitcoin.getExtendedPrivateKey()).toBe("xprv9wnZLsHUEcR3UVuysrCTjAu7FWKXN2m5XVrgkEmeptHqi5yNkR8seouPutDWAJQcUPYDzTDgjK7G1h53M4QeA4myt6gUSUgdFhQSYw7XAV4")
	expect(bitcoin.getExtendedPublicKey()).toBe("xpub6AmukNpN4yyLgyzSysjU6JqqoYA1mVUvtinHYdBGPDppatJXHxT8CcDsmBo9n3yLBgrcw9z62ygt1siT9xai4UaJ2w4FPmY6kPCF96YN2cF")

	expect(bitcoin.getAccount(0).getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
	expect(bitcoin.getAccount(0).getExtendedPublicKey()).toBe("xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj")
	expect(litecoin.getAccount(0).getExtendedPrivateKey()).toBe("Ltpv7735AbcbmL1gbgDWj2ezvs59rh4RM1oTN2BKTKbfe3146FCPCNFbBBSWfuV9vCJNMXD9LuHpQnqVWpn2hbMhikqPdoGqbS3ptdPoNWEvvgR")
	expect(flo.getAccount(0).getExtendedPrivateKey()).toBe("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC")
})

test('Can add Account to Coin', () => {
	var bitcoin = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.bitcoin, false)

	bitcoin.addAccount(1);

	expect(bitcoin.getAccount(1).getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK5owUStFsuAiWUxYpLkvQn1QmVDumBKTvmmjkNEZgpMYoAaAftt3JVeDhRkvyLvrKathDToUMdz2FqRF7JNavF7uboJWArrw")
})

test('Can add Account to Coin (string)', () => {
	var bitcoin = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.bitcoin, false)

	bitcoin.addAccount("1");

	expect(bitcoin.getAccount(1).getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK5owUStFsuAiWUxYpLkvQn1QmVDumBKTvmmjkNEZgpMYoAaAftt3JVeDhRkvyLvrKathDToUMdz2FqRF7JNavF7uboJWArrw")
})

test('Account add on second time just returns account', () => {
	var bitcoin = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.bitcoin, false)

	var x = bitcoin.addAccount("1");
	expect(bitcoin.addAccount(1)).toBe(x)

	expect(bitcoin.getAccount(1).getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK5owUStFsuAiWUxYpLkvQn1QmVDumBKTvmmjkNEZgpMYoAaAftt3JVeDhRkvyLvrKathDToUMdz2FqRF7JNavF7uboJWArrw")
})

test('Account auto-adds if not Existing on Coin', () => {
	var bitcoin = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.bitcoin, false)

	expect(bitcoin.getAccount(1).getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK5owUStFsuAiWUxYpLkvQn1QmVDumBKTvmmjkNEZgpMYoAaAftt3JVeDhRkvyLvrKathDToUMdz2FqRF7JNavF7uboJWArrw")
})

test('Coin, get main address (many coins)', () => {
	var bitcoin 		 =	new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.bitcoin, false)
	var litecoin 		 = 	new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.litecoin, false)
	var flo 			 = 	new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.flo, false)
	var bitcoin_testnet  = 	new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.bitcoin_testnet, false)
	var litecoin_testnet = 	new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.litecoin_testnet, false)
	var flo_testnet 	 =	new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.flo_testnet, false)

	expect(bitcoin.getMainAddress().getPublicAddress()).toBe("1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA");
	expect(litecoin.getMainAddress(0).getPublicAddress()).toBe("LUWPbpM43E2p7ZSh8cyTBEkvpHmr3cB8Ez");
	expect(flo.getMainAddress(1).getPublicAddress()).toBe("FTogNNXik7eiHZw5uN2KMe4cvcr7GCEjbZ");
	expect(bitcoin_testnet.getMainAddress(1).getPublicAddress()).toBe("n2VQDkgibQ3S8wPVH25Mea3TcQgVFFQqab");
	expect(litecoin_testnet.getMainAddress(1).getPublicAddress()).toBe("n2VQDkgibQ3S8wPVH25Mea3TcQgVFFQqab");
	expect(flo_testnet.getMainAddress(1).getPublicAddress()).toBe("odqpABssS7twQfwqNhQdb58c8RiG6awnCh");
})

test('Coin, get main address (single coin)', () => {
	var flo_testnet = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.flo_testnet, false)

	expect(flo_testnet.getMainAddress().getPublicAddress()).toBe("oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S");
	expect(flo_testnet.getMainAddress(0).getPublicAddress()).toBe("oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S");
	expect(flo_testnet.getMainAddress(1).getPublicAddress()).toBe("odqpABssS7twQfwqNhQdb58c8RiG6awnCh");
	expect(flo_testnet.getMainAddress(2).getPublicAddress()).toBe("oHffGWtMdFngokK5Sv9YQFUN7NxwgSS6ZL");
})

test('Coin, get flo_testnet balance', (done) => {
	var flo_testnet = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.flo_testnet, false)

	flo_testnet.getBalance().then((balance) => {
		expect(flo_testnet.getAccounts()[0]).toBeDefined()
		expect(balance).toBeGreaterThan(1);
		done()
	})
}, 10000)

/*test('Coin, catch network request error', async (done) => {
    let bitcoin = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.bitcoin, false)

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

}, 10000)*/

test('Coin, discover accounts', async (done) => {
	let flo_testnet = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.flo_testnet, false)

	expect(flo_testnet.getCoinInfo()).toEqual(Networks.flo_testnet)

	let accounts = await flo_testnet.discoverAccounts()

	if (accounts){
		expect(accounts.length >= 2).toBe(true);
		done()
	}
}, 10000)

test('Coin, getCoinInfo', () => {
	var flo_testnet = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.flo_testnet, false)

	expect(flo_testnet.getCoinInfo()).toEqual(Networks.flo_testnet)
})

// test('Test send payment (with from account)', (done) => {
// 	var flo_testnet = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', Networks.flo_testnet, false)

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