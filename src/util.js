import bitcoin from 'bitcoinjs-lib'
import { Buffer } from 'safe-buffer'
import createHash from 'create-hash'
import bs58check from 'bs58check'

function ripemd160 (buffer) {
  return createHash('rmd160').update(buffer).digest()
}

function sha256 (buffer) {
  return createHash('sha256').update(buffer).digest()
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

function toBase58 (publicKey, network) {
  if (!publicKey){
    return console.log("PUBLIC KEY NULL!!!!")
  }

  return toBase58Check(hash160(publicKey), network.pubKeyHash)
}

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
        if (queryResultSet[toBase58(a.address.publicKey, a.network)]) {
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


module.exports = {
  toBase58,
	isValidAddress,
  discovery
}