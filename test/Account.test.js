var bip32 = require('bip32');
var Account = require('../src').Account;
var Networks = require('../src').Networks;

test('Account keys generated from Mnemonic Match', () => {
	var accountMaster = bip32.fromBase58("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
	
	var account = new Account(accountMaster, Networks.bitcoin, {discover: false});

	expect(account.getExtendedPrivateKey()).toBe("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
	expect(account.getExtendedPublicKey()).toBe("xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj")
})

test('Account serialize and deserialize', () => {
	let serialized = {  
		"extended_private_key": "Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC",
		"addresses":[  
			{  
				"addrStr":"FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu",
				"wif":"R8dgfFiFF9tk9iMo9TdSgSPCBEq67tW7WHUvwwXJrrCZy1mfJXr9",
				"balanceSat":102000,
				"totalReceivedSat":102000,
				"unconfirmedBalanceSat":0,
				"transactions":[  
					"714a1eb73a6e0ee9ec6b73b85f852e3ed4bd68ddf2e0e1f4bcef12ca36ba506c",
					"46d7d1f5dc9afb7501c4243a0bc6ab6945430648203c38a2e942da5af2adff2b",
					"5c951cf5821a41f4bb35e1aff044ff249ff2bfc4cb00710c9fd019fd5a9fda66"
				],
				"spentTransactions":[  

				],
				"lastUpdated":1533749893034
			},
			{  
				"addrStr":"F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp",
				"wif":"RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5",
				"balanceSat":0,
				"totalReceivedSat":100000,
				"unconfirmedBalanceSat":0,
				"transactions":[  
					"714a1eb73a6e0ee9ec6b73b85f852e3ed4bd68ddf2e0e1f4bcef12ca36ba506c",
					"7687e361f00998f96b29938bf5b7d9003a15ec182c13b6ddbd5adc0f993cbf9c"
				],
				"spentTransactions":[  

				],
				"lastUpdated":1533749893036
			},
			{  
				"addrStr":"FFwWGYxXfgMrS4oTJnW2HU3mUycxHZDxbU",
				"wif":"RFHrCkCxSYCSsKncWegWsmRtL2KQQXAWrZF1aU5mrumvpgEmy3AB",
				"balanceSat":100000,
				"totalReceivedSat":100000,
				"unconfirmedBalanceSat":0,
				"transactions":[  
					"b6921073a2f759816d769fa77a7cfe9870766116e537399fb635550b0dc1cb8a"
				],
				"spentTransactions":[  

				],
				"lastUpdated":1533749893767
			},
			{  
				"addrStr":"FQkUtNeQgBWFrxEfuTQ9hFzA23skfw1BwX",
				"wif":"RDdgBfYo8w2JZ6XcSxDMSmQwDDUiXp2as7jLcAVP4W1d4xDikUaa",
				"balanceSat":0,
				"totalReceivedSat":100000,
				"unconfirmedBalanceSat":0,
				"transactions":[  
					"46d7d1f5dc9afb7501c4243a0bc6ab6945430648203c38a2e942da5af2adff2b",
					"5be14a4e401a77cd0c09b378f61a5ca05c1e02d8b59151d730ac77b87e95c1be"
				],
				"spentTransactions":[  

				],
				"lastUpdated":1533749893766
			}
		],
		"chains":{  
			"0":{  
				"lastUpdate":1533749894135
			},
			"1":{  
				"index":1,
				"lastUpdate":0
			}
		}
	}

	let accountMaster = bip32.fromBase58(serialized.extended_private_key, Networks.flo.network)

	// Test deserialization
	let account = new Account(accountMaster, Networks.flo, {
		discover: false,
		serialized_data: serialized
	});

	// Get Addresses returns only addresses that have recieved any balances :)
	expect(account.getAddresses().length).toBe(4)
	expect(account.addresses.FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu.getTotalReceived()).toBeGreaterThan(0.0001)
	expect(account.addresses.F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp.getTotalReceived()).toBeGreaterThan(0.0001)
	expect(account.addresses.FFwWGYxXfgMrS4oTJnW2HU3mUycxHZDxbU.getTotalReceived()).toBeGreaterThan(0.0001)
	expect(account.addresses.FQkUtNeQgBWFrxEfuTQ9hFzA23skfw1BwX.getTotalReceived()).toBeGreaterThan(0.0001)

	expect(account.getAddress(0, 9).getPublicAddress()).toBe("FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu")
	expect(account.getAddress(0, 9).getPrivateAddress()).toBe("R8dgfFiFF9tk9iMo9TdSgSPCBEq67tW7WHUvwwXJrrCZy1mfJXr9")
	expect(account.getAddress(0, 9).getTotalReceived()).toBeGreaterThan(0.0001)
	expect(account.getAddress(0, 10).getPublicAddress()).toBe("F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp")
	expect(account.getAddress(0, 10).getPrivateAddress()).toBe("RAtKUeXYMEHEFkhbJuXGMEQZsqgHosnP2BLVaLWMRswWrcCNbZk5")
	expect(account.getAddress(0, 10).getTotalReceived()).toBeGreaterThan(0.0001)
	expect(account.getAddress(0, 23).getPublicAddress()).toBe("FFwWGYxXfgMrS4oTJnW2HU3mUycxHZDxbU")
	expect(account.getAddress(0, 23).getPrivateAddress()).toBe("RFHrCkCxSYCSsKncWegWsmRtL2KQQXAWrZF1aU5mrumvpgEmy3AB")
	expect(account.getAddress(0, 23).getTotalReceived()).toBeGreaterThan(0.0001)
	expect(account.getAddress(0, 25).getPublicAddress()).toBe("FQkUtNeQgBWFrxEfuTQ9hFzA23skfw1BwX")
	expect(account.getAddress(0, 25).getPrivateAddress()).toBe("RDdgBfYo8w2JZ6XcSxDMSmQwDDUiXp2as7jLcAVP4W1d4xDikUaa")
	expect(account.getAddress(0, 25).getTotalReceived()).toBeGreaterThan(0.0001)

	// Make sure re-serialization works properly
	expect(account.serialize()).toEqual(serialized)
})

test('Account auto-discover by default', (done) => {
	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	
	var account = new Account(accountMaster, Networks.flo);

	var checkIfComplete = () => {
		if (account && account.getChain(0) && account.getChain(0).addresses.length === 27){
			expect(account.getChain(0).addresses.length).toBe(27)
			done()
		} else {
			setTimeout(checkIfComplete, 1000)
		}
	}

	setTimeout(checkIfComplete, 1000)
}, 20000)

test('Get Account Balance of all Chain Addresses', async (done) => {
	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	
	var account = new Account(accountMaster, Networks.flo, {discover: false});

	var balance_obj = await account.getBalance({ discover: true })

	expect(balance_obj.balance).toBeGreaterThan(0)
	done()
}, 20000)

test('Account, Get Balance of single address', async (done) => {
	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	
	var account = new Account(accountMaster, Networks.flo, {discover: false});

	var balance_obj = await account.getBalance({ discover: true, addresses: "F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp" })
	
	expect(balance_obj.balance).toBeDefined()
	done()
}, 20000)

test('Account, Get Balance of multiple addresses', async (done) => {
	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	
	var account = new Account(accountMaster, Networks.flo, {discover: false});

	var balance_obj = await account.getBalance({ discover: true, addresses: ["F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp", "FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu"] })
	
	expect(balance_obj.balance).toBeDefined()
	done()
}, 20000)

test('Discover Chain on Account', (done) => {
	var accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
	
	var account = new Account(accountMaster, Networks.flo, {discover: false});

	account.discoverChain(0).then(function(acc){
		expect(account.getChain(0).addresses.length).toBe(27)
		// Get Addresses returns only addresses that have recieved any balances :)
		expect(account.getAddresses(0).length).toBe(4)
		expect(account.addresses.F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp.getTotalReceived()).toBeGreaterThan(0.0001)
		expect(account.addresses.FHQvhgDut1rn1nvQRZ3z9QgMEVMavRo2Tu.getTotalReceived()).toBeGreaterThan(0.0001)
		expect(account.addresses.FFwWGYxXfgMrS4oTJnW2HU3mUycxHZDxbU.getTotalReceived()).toBeGreaterThan(0.0001)
		done();
	})
}, 20000)

// test('Test send payment', (done) => {
// 	var accountMaster = bip32.fromBase58("Fprt4gUYQvk1qawUgc4X6a5w3Qry67xXZEMwa1uKmfwMfWre1SP26Eaq1eEr9M9k29oc2qxChcstqqEDh6SWpnysXDeCuRAzyBGFXLi8ewVWrk3", Networks.flo_testnet.network)
	
// 	var account = new Account(accountMaster, Networks.flo_testnet, {discover: false});

// 	account.sendPayment({
// 		to:  { oPHTT8kciUGjeqKrMYDHh4gL8DFBaNF1xL: 0.000001 },
// 		floData: "oip-hdmw Account Payment!"
// 	}).then((txid) => {
// 		console.log(txid);
// 		expect(txid).toBeDefined()
// 		done()
// 	})
// }, 20000)