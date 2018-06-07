var bip32 = require('bip32');
var Account = require('../lib/Account');
var networks = require('../lib/networks');

test('Account keys generated from Mnemonic Match', () => {
	var accountMaster = bip32.fromBase58("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
	
	var account = new Account(accountMaster, networks.bitcoin, false);

	expect(account.getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
	expect(account.getExtendedPublicKey()).toBe("xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj")
})

test('Discover Chain on Account', (done) => {
	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", networks.flo.network)
	
	var account = new Account(accountMaster, networks.flo);

	account.discoverChain(0, function(success){
		expect(account.getChain(0).addresses.length).toBe(25)
		expect(account.addresses.F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp.getTotalReceived()).toBeGreaterThan(0.0001)
		expect(account.addresses.FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu.getTotalReceived()).toBeGreaterThan(0.0001)
		expect(account.addresses.FFwWGYxXfgMrS4oTJnW2HU3mUycxHZDxbU.getTotalReceived()).toBeGreaterThan(0.0001)
		done();
	})
})
