var Coin = require('../lib').Coin;
var networks = require('../lib').Networks;

test('Coin Account keys generated from Mnemonic Match', () => {
	var bitcoin = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', networks.bitcoin, false)
	var litecoin = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', networks.litecoin, false)
	var flo = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', networks.flo, false)

	expect(bitcoin.getAccount(0).getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
	expect(bitcoin.getAccount(0).getExtendedPublicKey()).toBe("xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj")
	expect(litecoin.getAccount(0).getExtendedPrivateKey()).toBe("Ltpv7735AbcbmL1gbgDWj2ezvs59rh4RM1oTN2BKTKbfe3146FCPCNFbBBSWfuV9vCJNMXD9LuHpQnqVWpn2hbMhikqPdoGqbS3ptdPoNWEvvgR")
	expect(flo.getAccount(0).getExtendedPrivateKey()).toBe("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC")
})

test('Can add Account to Coin', () => {
	var bitcoin = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', networks.bitcoin, false)

	bitcoin.addAccount(1);

	expect(bitcoin.getAccount(1).getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK5owUStFsuAiWUxYpLkvQn1QmVDumBKTvmmjkNEZgpMYoAaAftt3JVeDhRkvyLvrKathDToUMdz2FqRF7JNavF7uboJWArrw")
})

test('Account auto-adds if not Existing on Coin', () => {
	var bitcoin = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', networks.bitcoin, false)

	expect(bitcoin.getAccount(1).getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK5owUStFsuAiWUxYpLkvQn1QmVDumBKTvmmjkNEZgpMYoAaAftt3JVeDhRkvyLvrKathDToUMdz2FqRF7JNavF7uboJWArrw")
})

test('Coin, get main address', () => {
	var bitcoin 		 =	new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', networks.bitcoin, false)
	var litecoin 		 = 	new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', networks.litecoin, false)
	var flo 			 = 	new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', networks.flo, false)
	var bitcoin_testnet  = 	new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', networks.bitcoin_testnet, false)
	var litecoin_testnet = 	new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', networks.litecoin_testnet, false)
	var flo_testnet 	 =	new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', networks.flo_testnet, false)

	expect(bitcoin.getMainAddress().getPublicAddress()).toBe("1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA");
	expect(litecoin.getMainAddress(0).getPublicAddress()).toBe("LUWPbpM43E2p7ZSh8cyTBEkvpHmr3cB8Ez");
	expect(flo.getMainAddress(1).getPublicAddress()).toBe("FTogNNXik7eiHZw5uN2KMe4cvcr7GCEjbZ");
	expect(bitcoin_testnet.getMainAddress(1).getPublicAddress()).toBe("n2VQDkgibQ3S8wPVH25Mea3TcQgVFFQqab");
	expect(litecoin_testnet.getMainAddress(1).getPublicAddress()).toBe("n2VQDkgibQ3S8wPVH25Mea3TcQgVFFQqab");
	expect(flo_testnet.getMainAddress(1).getPublicAddress()).toBe("odqpABssS7twQfwqNhQdb58c8RiG6awnCh");
})

test('Coin, get main address', () => {
	var flo_testnet = new Coin('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', networks.flo_testnet, false)

	expect(flo_testnet.getMainAddress().getPublicAddress()).toBe("oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S");
	expect(flo_testnet.getMainAddress(0).getPublicAddress()).toBe("oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S");
	expect(flo_testnet.getMainAddress(1).getPublicAddress()).toBe("odqpABssS7twQfwqNhQdb58c8RiG6awnCh");
})