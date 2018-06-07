import bitcoin from 'bitcoinjs-lib'

function isValidAddress (address, network) {
  try {
    let dec = bitcoin.address.fromBase58Check(address)
    if (network) {
      return dec.version === network.pubKeyHash || dec.version === network.scriptHash
    } else {
      return true
    }
  } catch (e) {
    return false
  }
}

module.exports = {
	isValidAddress
}