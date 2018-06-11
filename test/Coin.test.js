var Wallet = require('../lib');

test('Coin Account keys generated from Mnemonic Match', () => {
	var w = new Wallet("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about", {discover: false})

	var coins = w.getCoins()

	expect(coins.bitcoin.getAccount(0).getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
	expect(coins.bitcoin.getAccount(0).getExtendedPublicKey()).toBe("xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj")
	expect(coins.litecoin.getAccount(0).getExtendedPrivateKey()).toBe("Ltpv7735AbcbmL1gbgDWj2ezvs59rh4RM1oTN2BKTKbfe3146FCPCNFbBBSWfuV9vCJNMXD9LuHpQnqVWpn2hbMhikqPdoGqbS3ptdPoNWEvvgR")
	expect(coins.flo.getAccount(0).getExtendedPrivateKey()).toBe("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC")
})

test('Can add Account to Coin', () => {
	var w = new Wallet("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about", {discover: false})

	var coins = w.getCoins()

	coins.bitcoin.addAccount(1);

	expect(coins.bitcoin.getAccount(1).getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK5owUStFsuAiWUxYpLkvQn1QmVDumBKTvmmjkNEZgpMYoAaAftt3JVeDhRkvyLvrKathDToUMdz2FqRF7JNavF7uboJWArrw")
})

test('Account auto-adds if not Existing on Coin', () => {
	var w = new Wallet("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about", {discover: false})

	var coins = w.getCoins()

	expect(coins.bitcoin.getAccount(1).getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK5owUStFsuAiWUxYpLkvQn1QmVDumBKTvmmjkNEZgpMYoAaAftt3JVeDhRkvyLvrKathDToUMdz2FqRF7JNavF7uboJWArrw")
})

test('Coin, get main address', () => {
	var w = new Wallet('00000000000000000000000000000000', { 
		discover: false,
		supported_coins: ['bitcoin', 'bitcoin_testnet', 'litecoin', 'litecoin_testnet', 'flo', 'flo_testnet']
	});

	var coins = w.getCoins()

	expect(coins.bitcoin.getMainAddress().getPublicAddress()).toBe("1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA");
	expect(coins.litecoin.getMainAddress(0).getPublicAddress()).toBe("LUWPbpM43E2p7ZSh8cyTBEkvpHmr3cB8Ez");
	expect(coins.flo.getMainAddress(1).getPublicAddress()).toBe("FTogNNXik7eiHZw5uN2KMe4cvcr7GCEjbZ");
	expect(coins.bitcoin_testnet.getMainAddress(1).getPublicAddress()).toBe("n2VQDkgibQ3S8wPVH25Mea3TcQgVFFQqab");
	expect(coins.litecoin_testnet.getMainAddress(1).getPublicAddress()).toBe("n2VQDkgibQ3S8wPVH25Mea3TcQgVFFQqab");
	expect(coins.flo_testnet.getMainAddress(1).getPublicAddress()).toBe("odqpABssS7twQfwqNhQdb58c8RiG6awnCh");
})

test('Coin, get main address', () => {
	var w = new Wallet('00000000000000000000000000000000', { 
		discover: false,
		supported_coins: 'flo_testnet'
	});

	var coins = w.getCoins()

	expect(coins.flo_testnet.getMainAddress().getPublicAddress()).toBe("oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S");
	expect(coins.flo_testnet.getMainAddress(0).getPublicAddress()).toBe("oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S");
	expect(coins.flo_testnet.getMainAddress(1).getPublicAddress()).toBe("odqpABssS7twQfwqNhQdb58c8RiG6awnCh");
})