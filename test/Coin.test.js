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
