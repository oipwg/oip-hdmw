var bip32 = require('bip32');
var Account = require('../lib').Account;
var Networks = require('../lib').Networks;

test('Account keys generated from Mnemonic Match', () => {
	var accountMaster = bip32.fromBase58("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
	
	var account = new Account(accountMaster, Networks.bitcoin, false);

	expect(account.getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
	expect(account.getExtendedPublicKey()).toBe("xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj")
})

test('Get Account Balance of all Chain Addresses', (done) => {
	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	
	var account = new Account(accountMaster, Networks.flo, false);

	account.getBalance({ discover: true }).then((totalBalance) => {
		expect(totalBalance).toBeGreaterThan(0)
		done()
	})
}, 10000)

test('Discover Chain on Account', (done) => {
	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	
	var account = new Account(accountMaster, Networks.flo, false);

	account.discoverChain(0).then(function(acc){
		expect(acc.getChain(0).addresses.length).toBe(27)
		expect(acc.addresses.F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp.getTotalReceived()).toBeGreaterThan(0.0001)
		expect(acc.addresses.FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu.getTotalReceived()).toBeGreaterThan(0.0001)
		expect(acc.addresses.FFwWGYxXfgMrS4oTJnW2HU3mUycxHZDxbU.getTotalReceived()).toBeGreaterThan(0.0001)
		done();
	})
}, 10000)