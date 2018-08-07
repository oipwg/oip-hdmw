var Wallet = require("../lib/Wallet")

var w = new Wallet("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about", {
	supported_coins: ["flo_testnet"]
})

w.onWebsocketUpdate(function(address){
	console.log("Recieved an update for " + address.getPublicAddress() + " new balance: " + address.getBalance())
	w.getCoinBalances({ discover: false }).then(function(bal){ console.log("Full Wallet Balance: ", bal) })
})

console.log("Subscribed to Websocket Updates")