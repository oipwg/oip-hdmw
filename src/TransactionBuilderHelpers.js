import bitcoin from 'bitcoinjs-lib'

const Transaction = bitcoin.Transaction
const bcrypto = bitcoin.crypto
const bscript = bitcoin.script
const payments = bitcoin.payments
const classify = bitcoin.classify
const SCRIPT_TYPES = classify.types

const EMPTY_SCRIPT = Buffer.allocUnsafe(0)
const BLANK_OUTPUT = Buffer.allocUnsafe(0)
const ONE = Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex')

function canSign (input) {
  return input.signScript !== undefined &&
    input.signType !== undefined &&
    input.pubkeys !== undefined &&
    input.signatures !== undefined &&
    input.signatures.length === input.pubkeys.length &&
    input.pubkeys.length > 0 &&
    (
      input.hasWitness === false ||
      input.value !== undefined
    )
}

function expandOutput (script, ourPubKey) {
  const type = classify.output(script)

  switch (type) {
    case SCRIPT_TYPES.P2PKH: {
      if (!ourPubKey) return { type }

      // does our hash160(pubKey) match the output scripts?
      const pkh1 = payments.p2pkh({ output: script }).hash
      const pkh2 = bcrypto.hash160(ourPubKey)
      if (!pkh1.equals(pkh2)) return { type }

      return {
        type,
        pubkeys: [ourPubKey],
        signatures: [undefined]
      }
    }

    case SCRIPT_TYPES.P2WPKH: {
      if (!ourPubKey) return { type }

      // does our hash160(pubKey) match the output scripts?
      const wpkh1 = payments.p2wpkh({ output: script }).hash
      const wpkh2 = bcrypto.hash160(ourPubKey)
      if (!wpkh1.equals(wpkh2)) return { type }

      return {
        type,
        pubkeys: [ourPubKey],
        signatures: [undefined]
      }
    }

    case SCRIPT_TYPES.P2PK: {
      const p2pk = payments.p2pk({ output: script })
      return {
        type,
        pubkeys: [p2pk.pubkey],
        signatures: [undefined]
      }
    }

    case SCRIPT_TYPES.MULTISIG: {
      const p2ms = payments.p2ms({ output: script })
      return {
        type,
        pubkeys: p2ms.pubkeys,
        signatures: p2ms.pubkeys.map(() => undefined)
      }
    }
  }

  return { type }
}

function prepareInput (input, ourPubKey, redeemScript, witnessValue, witnessScript) {
  if (redeemScript && witnessScript) {
    const p2wsh = payments.p2wsh({ redeem: { output: witnessScript } })
    const p2wshAlt = payments.p2wsh({ output: redeemScript })
    const p2sh = payments.p2sh({ redeem: { output: redeemScript } })
    const p2shAlt = payments.p2sh({ redeem: p2wsh })

    // enforces P2SH(P2WSH(...))
    if (!p2wsh.hash.equals(p2wshAlt.hash)) throw new Error('Witness script inconsistent with prevOutScript')
    if (!p2sh.hash.equals(p2shAlt.hash)) throw new Error('Redeem script inconsistent with prevOutScript')

    const expanded = expandOutput(p2wsh.redeem.output, ourPubKey)
    if (!expanded.pubkeys) throw new Error(expanded.type + ' not supported as witnessScript (' + bscript.toASM(witnessScript) + ')')
    if (input.signatures && input.signatures.some(x => x)) {
      expanded.signatures = input.signatures
    }

    const signScript = witnessScript
    if (expanded.type === SCRIPT_TYPES.P2WPKH) throw new Error('P2SH(P2WSH(P2WPKH)) is a consensus failure')

    return {
      redeemScript,
      redeemScriptType: SCRIPT_TYPES.P2WSH,

      witnessScript,
      witnessScriptType: expanded.type,

      prevOutType: SCRIPT_TYPES.P2SH,
      prevOutScript: p2sh.output,

      hasWitness: true,
      signScript,
      signType: expanded.type,

      pubkeys: expanded.pubkeys,
      signatures: expanded.signatures
    }
  }

  if (redeemScript) {
    const p2sh = payments.p2sh({ redeem: { output: redeemScript } })

    if (input.prevOutScript) {
      let p2shAlt
      try {
        p2shAlt = payments.p2sh({ output: input.prevOutScript })
      } catch (e) { throw new Error('PrevOutScript must be P2SH') }
      if (!p2sh.hash.equals(p2shAlt.hash)) throw new Error('Redeem script inconsistent with prevOutScript')
    }

    const expanded = expandOutput(p2sh.redeem.output, ourPubKey)
    if (!expanded.pubkeys) throw new Error(expanded.type + ' not supported as redeemScript (' + bscript.toASM(redeemScript) + ')')
    if (input.signatures && input.signatures.some(x => x)) {
      expanded.signatures = input.signatures
    }

    let signScript = redeemScript
    if (expanded.type === SCRIPT_TYPES.P2WPKH) {
      signScript = payments.p2pkh({ pubkey: expanded.pubkeys[0] }).output
    }

    return {
      redeemScript,
      redeemScriptType: expanded.type,

      prevOutType: SCRIPT_TYPES.P2SH,
      prevOutScript: p2sh.output,

      hasWitness: expanded.type === SCRIPT_TYPES.P2WPKH,
      signScript,
      signType: expanded.type,

      pubkeys: expanded.pubkeys,
      signatures: expanded.signatures
    }
  }

  if (witnessScript) {
    const p2wsh = payments.p2wsh({ redeem: { output: witnessScript } })

    if (input.prevOutScript) {
      const p2wshAlt = payments.p2wsh({ output: input.prevOutScript })
      if (!p2wsh.hash.equals(p2wshAlt.hash)) throw new Error('Witness script inconsistent with prevOutScript')
    }

    const expanded = expandOutput(p2wsh.redeem.output, ourPubKey)
    if (!expanded.pubkeys) throw new Error(expanded.type + ' not supported as witnessScript (' + bscript.toASM(witnessScript) + ')')
    if (input.signatures && input.signatures.some(x => x)) {
      expanded.signatures = input.signatures
    }

    const signScript = witnessScript
    if (expanded.type === SCRIPT_TYPES.P2WPKH) throw new Error('P2WSH(P2WPKH) is a consensus failure')

    return {
      witnessScript,
      witnessScriptType: expanded.type,

      prevOutType: SCRIPT_TYPES.P2WSH,
      prevOutScript: p2wsh.output,

      hasWitness: true,
      signScript,
      signType: expanded.type,

      pubkeys: expanded.pubkeys,
      signatures: expanded.signatures
    }
  }

  if (input.prevOutType && input.prevOutScript) {
    // embedded scripts are not possible without extra information
    if (input.prevOutType === SCRIPT_TYPES.P2SH) throw new Error('PrevOutScript is ' + input.prevOutType + ', requires redeemScript')
    if (input.prevOutType === SCRIPT_TYPES.P2WSH) throw new Error('PrevOutScript is ' + input.prevOutType + ', requires witnessScript')
    if (!input.prevOutScript) throw new Error('PrevOutScript is missing')

    const expanded = expandOutput(input.prevOutScript, ourPubKey)
    if (!expanded.pubkeys) throw new Error(expanded.type + ' not supported (' + bscript.toASM(input.prevOutScript) + ')')
    if (input.signatures && input.signatures.some(x => x)) {
      expanded.signatures = input.signatures
    }

    let signScript = input.prevOutScript
    if (expanded.type === SCRIPT_TYPES.P2WPKH) {
      signScript = payments.p2pkh({ pubkey: expanded.pubkeys[0] }).output
    }

    return {
      prevOutType: expanded.type,
      prevOutScript: input.prevOutScript,

      hasWitness: expanded.type === SCRIPT_TYPES.P2WPKH,
      signScript,
      signType: expanded.type,

      pubkeys: expanded.pubkeys,
      signatures: expanded.signatures
    }
  }

  const prevOutScript = payments.p2pkh({ pubkey: ourPubKey }).output
  return {
    prevOutType: SCRIPT_TYPES.P2PKH,
    prevOutScript: prevOutScript,

    hasWitness: false,
    signScript: prevOutScript,
    signType: SCRIPT_TYPES.P2PKH,

    pubkeys: [ourPubKey],
    signatures: [undefined]
  }
}

function sign (transactionBuilder, extraBytes, vin, keyPair, redeemScript, hashType, witnessValue, witnessScript) {
  if (!transactionBuilder.__inputs[vin]) { throw new Error('No input at index: ' + vin) }

  hashType = hashType || bitcoin.Transaction.SIGHASH_ALL

  const input = transactionBuilder.__inputs[vin]

  // if redeemScript was previously provided, enforce consistency
  if (input.redeemScript !== undefined && redeemScript && !input.redeemScript.equals(redeemScript)) {
    throw new Error('Inconsistent redeemScript')
  }

  let ourPubKey = keyPair.publicKey

  // Check both publickKey, getPublicKey, and getPublicKeyBuffer to support all HDNode types (bitcoinjs-lib v3 & bip32 npm & bitcoinjs-lib v4 when it comes out)
  if (!ourPubKey && keyPair.getPublicKey) { ourPubKey = keyPair.getPublicKey() } else if (!ourPubKey && keyPair.getPublicKeyBuffer) { ourPubKey = keyPair.getPublicKeyBuffer() }

  if (!canSign(input)) {
    if (witnessValue !== undefined) {
      if (input.value !== undefined && input.value !== witnessValue) { throw new Error('Input didn\'t match witnessValue') }

      input.value = witnessValue
    }

    // @TODO: Add this when SegWit support is needed
    if (!canSign(input)) {
      const prepared = prepareInput(input, ourPubKey, redeemScript, witnessValue, witnessScript)

      Object.assign(input, prepared)
    }

    if (!canSign(input)) throw Error(input.prevOutType + ' not supported')
  }

  let signatureHash
  if (input.witness) {
    signatureHash = transactionBuilder.__tx.hashForWitnessV0(vin, input.signScript, input.value, hashType)
  } else {
    // signatureHash = transactionBuilder.tx.hashForSignature(vin, input.signScript, hashType)
    signatureHash = hashForSignature(transactionBuilder.__tx, extraBytes, vin, input.signScript, hashType)
  }

  const signed = input.pubkeys.some(function (pubKey, i) {
    if (!ourPubKey.equals(pubKey)) return false
    if (input.signatures[i]) throw new Error('Signature already exists')

    if (ourPubKey.length !== 33 && input.hasWitness) {
      throw new Error('BIP143 rejects uncompressed public keys in P2WPKH or P2WSH')
    }

    const signature = keyPair.sign(signatureHash)

    input.signatures[i] = bscript.signature.encode(signature, hashType)
    return true
  })

  if (!signed) throw new Error('Key pair cannot sign for this input')
}

function hashForSignature (transaction, extraBytes, inIndex, prevOutScript, hashType) {
  // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighashTests.cpp#L29
  if (inIndex >= transaction.ins.length) { return ONE }

  // ignore OP_CODESEPARATOR
  const ourScript = bitcoin.script.compile(bitcoin.script.decompile(prevOutScript).filter(function (x) {
    return x !== 171 // OP_CODESEPARATOR
  }))

  const txTmp = transaction.clone()

  // SIGHASH_NONE: ignore all outputs? (wildcard payee)
  if ((hashType & 0x1f) === bitcoin.Transaction.SIGHASH_NONE) {
    txTmp.outs = []

    // ignore sequence numbers (except at inIndex)
    txTmp.ins.forEach(function (input, i) {
      if (i === inIndex) return

      input.sequence = 0
    })

  // SIGHASH_SINGLE: ignore all outputs, except at the same index?
  } else if ((hashType & 0x1f) === bitcoin.Transaction.SIGHASH_SINGLE) {
    // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighashTests.cpp#L60
    if (inIndex >= transaction.outs.length) { return ONE }

    // truncate outputs after
    txTmp.outs.length = inIndex + 1

    // "blank" outputs before
    for (let i = 0; i < inIndex; i++) {
      txTmp.outs[i] = BLANK_OUTPUT
    }

    // ignore sequence numbers (except at inIndex)
    txTmp.ins.forEach(function (input, y) {
      if (y === inIndex) return

      input.sequence = 0
    })
  }

  // SIGHASH_ANYONECANPAY: ignore inputs entirely?
  if (hashType & Transaction.SIGHASH_ANYONECANPAY) {
    txTmp.ins = [txTmp.ins[inIndex]]
    txTmp.ins[0].script = ourScript

  // SIGHASH_ALL: only ignore input scripts
  } else {
    // "blank" others input scripts
    txTmp.ins.forEach(function (input) { input.script = EMPTY_SCRIPT })
    txTmp.ins[inIndex].script = ourScript
  }

  // serialize and hash
  const extraBytesString = extraBytes || ''

  // Get the regular tx hex buffer
  const buffer = Buffer.allocUnsafe(txTmp.__byteLength(false))
  txTmp.__toBuffer(buffer, 0, false)

  // tx hex buffer to string (for appending data)
  let txHexStr = buffer.toString('hex')

  // Append on Extra Bytes (floData)
  txHexStr += extraBytesString

  // Create hashType buffer
  const hashTypeBuf = Buffer.allocUnsafe(4)
  hashTypeBuf.writeInt32LE(hashType, 0)

  // Add the hashType to the end of the hex string
  txHexStr += hashTypeBuf.toString('hex')

  // Convert hex string to buffer and hash256 it
  return bcrypto.hash256(Buffer.from(txHexStr, 'hex'))
}

module.exports = {
  sign
}
