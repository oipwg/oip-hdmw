import bitcoin from 'bitcoinjs-lib'
import { Buffer } from 'safe-buffer'
import createHash from 'create-hash'
import bs58check from 'bs58check'
import wif from 'wif'
import varuint from 'varuint-bitcoin'

/** @module util */

function ripemd160 (buffer) {
  return createHash('rmd160').update(buffer).digest()
}

function sha256 (buffer) {
  return createHash('sha256').update(buffer).digest()
}

function hash256 (buffer) {
  return sha256(sha256(buffer))
}

function hash160 (buffer) {
  return ripemd160(sha256(buffer))
}

function toBase58Check (hash, version) {
  var payload = Buffer.allocUnsafe(21)
  payload.writeUInt8(version, 0)
  hash.copy(payload, 1)

  return bs58check.encode(payload)
}

/**
 * @param  {Buffer} key - The buffer for the Private/Public Key to encode
 * @param  {number} version - The specific "version" byte to prepend
 * @return {string} Returns the Base58 encoded Key
 */
function toBase58 (key, version) {
  if (!key){
    return console.log("KEY NULL!!!!")
  }

  return toBase58Check(hash160(key), version)
}

/**
 * Check if a WIF is valid for a specific CoinNetwork
 * @param  {string} key - Base58 WIF Private Key
 * @param  {CoinNetwork} network
 * @return {Boolean}
 */
function isValidWIF (key, network) {
  try {
    let dec = wif.decode(key);

    if (network) {
      return dec.version === network.wif
    } else {
      return true
    }
  } catch (e) {
    console.error(e);
    return false
  }
}

/**
 * Check if a Public Address is valid for a specific CoinNetwork
 * @param  {string} address - Base58 Public Address
 * @param  {CoinNetwork} network
 * @return {Boolean}
 */
function isValidPublicAddress (address, network) {
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

// https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#account-discovery
function discovery (chain, gapLimit, queryCb, i, done) {
  var gap = 0
  var checked = 0

  function cycle () {
    var batch = [chain.get()]
    checked++

    while (batch.length < gapLimit) {
      chain.next()
      batch.push(chain.get())

      checked++
    }

    queryCb(batch, function (err, queryResultSet) {
      if (Array.isArray(queryResultSet)) return done(new TypeError('Expected query set, not Array'))
      if (err) return done(err)

      // iterate batch, guarantees order agnostic of queryCb result ordering
      batch.forEach(function (a) {
        if (queryResultSet[toBase58(a.address.publicKey, a.network.pubKeyHash)]) {
          gap = 0
        } else {
          gap += 1
        }
      })

      if (gap >= gapLimit) {
        var used = checked - gap

        return done(undefined, used, checked, i)
      } else {
        chain.next()
      }

      cycle()
    })
  }

  cycle()
}

/**
 * Check if a given string is in a BIP39 Mnemonic format (is a string, and is at least 2 words long). 
 * Please note that this does not validate if the Mnemonic is a valid BIP39 Mnemonic 
 * (i.e. defined from Entropy vs a Brain Wallet)
 * @param  {string} mnemonic - BIP39 Mnemonic to check
 * @return {Boolean}
 */
function isMnemonic(mnemonic){
  if (typeof mnemonic === "string" && mnemonic.split(" ").length >= 2)
    return true

  return false
}

/**
 * Check if a given string is a BIP39 Entropy string.
 * @param  {string} entropy - The Entropy string to check
 * @return {Boolean}
 */
function isEntropy(entropy){
  if (typeof entropy === "string" && entropy.length >= 16 && entropy.length <= 32)
    return true

  return false
}

module.exports = {
  hash160,
  hash256,
  toBase58,
	isValidPublicAddress,
  isValidWIF,
  isMnemonic,
  isEntropy,
  discovery,
  varIntBuffer: varuint.encode
}