import bitcoin from 'bitcoinjs-lib';

let Transaction = bitcoin.Transaction
let bcrypto = bitcoin.crypto;
let bscript = bitcoin.script;
let btemplates = bitcoin.script;
let scriptTypes = btemplates.types;
let ECSignature = btemplates.ecsignature;


var EMPTY_SCRIPT = Buffer.allocUnsafe(0)
var ONE = Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex')

function canSign (input) {
  return input.prevOutScript !== undefined &&
    input.signScript !== undefined &&
    input.pubKeys !== undefined &&
    input.signatures !== undefined &&
    input.signatures.length === input.pubKeys.length &&
    input.pubKeys.length > 0 &&
    (
      input.witness === false ||
      (input.witness === true && input.value !== undefined)
    )
}

function expandOutput (script, scriptType, ourPubKey) {
  var scriptChunks = bscript.decompile(script) || []
  if (!scriptType) {
    scriptType = btemplates.classifyOutput(script)
  }

  var pubKeys = []

  switch (scriptType) {
    // does our hash160(pubKey) match the output scripts?
    case scriptTypes.P2PKH:
      if (!ourPubKey) break

      var pkh1 = scriptChunks[2]
      var pkh2 = bcrypto.hash160(ourPubKey)
      if (pkh1.equals(pkh2)) pubKeys = [ourPubKey]
      break

    // does our hash160(pubKey) match the output scripts?
    case scriptTypes.P2WPKH:
      if (!ourPubKey) break

      var wpkh1 = scriptChunks[1]
      var wpkh2 = bcrypto.hash160(ourPubKey)
      if (wpkh1.equals(wpkh2)) pubKeys = [ourPubKey]
      break

    case scriptTypes.P2PK:
      pubKeys = scriptChunks.slice(0, 1)
      break

    case scriptTypes.MULTISIG:
      pubKeys = scriptChunks.slice(1, -2)
      break

    default: return { scriptType: scriptType }
  }

  return {
    pubKeys: pubKeys,
    scriptType: scriptType,
    signatures: pubKeys.map(function () { return undefined })
  }
}

function checkP2SHInput (input, redeemScriptHash) {
  if (input.prevOutType) {
    if (input.prevOutType !== scriptTypes.P2SH) throw new Error('PrevOutScript must be P2SH')

    var chunks = bscript.decompile(input.prevOutScript)
    if (!chunks) throw new Error('Invalid prevOutScript')
    if (!chunks[1].equals(redeemScriptHash)) throw new Error('Inconsistent hash160(redeemScript)')
  }
}

function checkP2WSHInput (input, witnessScriptHash) {
  if (input.prevOutType) {
    if (input.prevOutType !== scriptTypes.P2WSH) throw new Error('PrevOutScript must be P2WSH')

    var chunks = bscript.decompile(input.prevOutScript)
    if (!chunks) throw new Error('Invalid witnessScript')
    if (!chunks[1].equals(witnessScriptHash)) throw new Error('Inconsistent sha256(witnessScript)')
  }
}

function prepareInput (input, kpPubKey, redeemScript, witnessValue, witnessScript) {
  var expanded
  var prevOutType
  var prevOutScript

  var p2sh = false
  var p2shType
  var redeemScriptHash

  var witness = false
  var p2wsh = false
  var witnessType
  var witnessScriptHash

  var signType
  var signScript

  if (redeemScript && witnessScript) {
    redeemScriptHash = bcrypto.hash160(redeemScript)
    witnessScriptHash = bcrypto.sha256(witnessScript)
    checkP2SHInput(input, redeemScriptHash)

    if (!redeemScript.equals(btemplates.witnessScriptHash.output.encode(witnessScriptHash))) throw new Error('Witness script inconsistent with redeem script')

    expanded = expandOutput(witnessScript, undefined, kpPubKey)
    if (!expanded.pubKeys) throw new Error(expanded.scriptType + ' not supported as witnessScript (' + bscript.toASM(witnessScript) + ')')

    prevOutType = btemplates.types.P2SH
    prevOutScript = btemplates.scriptHash.output.encode(redeemScriptHash)
    p2sh = witness = p2wsh = true
    p2shType = btemplates.types.P2WSH
    signType = witnessType = expanded.scriptType
    signScript = witnessScript
  } else if (redeemScript) {
    redeemScriptHash = bcrypto.hash160(redeemScript)
    checkP2SHInput(input, redeemScriptHash)

    expanded = expandOutput(redeemScript, undefined, kpPubKey)
    if (!expanded.pubKeys) throw new Error(expanded.scriptType + ' not supported as redeemScript (' + bscript.toASM(redeemScript) + ')')

    prevOutType = btemplates.types.P2SH
    prevOutScript = btemplates.scriptHash.output.encode(redeemScriptHash)
    p2sh = true
    signType = p2shType = expanded.scriptType
    signScript = redeemScript
    witness = signType === btemplates.types.P2WPKH
  } else if (witnessScript) {
    witnessScriptHash = bcrypto.sha256(witnessScript)
    checkP2WSHInput(input, witnessScriptHash)

    expanded = expandOutput(witnessScript, undefined, kpPubKey)
    if (!expanded.pubKeys) throw new Error(expanded.scriptType + ' not supported as witnessScript (' + bscript.toASM(witnessScript) + ')')

    prevOutType = btemplates.types.P2WSH
    prevOutScript = btemplates.witnessScriptHash.output.encode(witnessScriptHash)
    witness = p2wsh = true
    signType = witnessType = expanded.scriptType
    signScript = witnessScript
  } else if (input.prevOutType) {
    // embedded scripts are not possible without a redeemScript
    if (input.prevOutType === scriptTypes.P2SH) {
      throw new Error('PrevOutScript is ' + input.prevOutType + ', requires redeemScript')
    }

    if (input.prevOutType === scriptTypes.P2WSH) {
      throw new Error('PrevOutScript is ' + input.prevOutType + ', requires witnessScript')
    }

    prevOutType = input.prevOutType
    prevOutScript = input.prevOutScript
    expanded = expandOutput(input.prevOutScript, input.prevOutType, kpPubKey)
    if (!expanded.pubKeys) return

    witness = (input.prevOutType === scriptTypes.P2WPKH)
    signType = prevOutType
    signScript = prevOutScript
  } else {
    prevOutScript = btemplates.pubKeyHash.output.encode(bcrypto.hash160(kpPubKey))
    expanded = expandOutput(prevOutScript, scriptTypes.P2PKH, kpPubKey)

    prevOutType = scriptTypes.P2PKH
    witness = false
    signType = prevOutType
    signScript = prevOutScript
  }

  if (signType === scriptTypes.P2WPKH) {
    signScript = btemplates.pubKeyHash.output.encode(btemplates.witnessPubKeyHash.output.decode(signScript))
  }

  if (p2sh) {
    input.redeemScript = redeemScript
    input.redeemScriptType = p2shType
  }

  if (p2wsh) {
    input.witnessScript = witnessScript
    input.witnessScriptType = witnessType
  }

  input.pubKeys = expanded.pubKeys
  input.signatures = expanded.signatures
  input.signScript = signScript
  input.signType = signType
  input.prevOutScript = prevOutScript
  input.prevOutType = prevOutType
  input.witness = witness
}

function sign(transactionBuilder, extraBytes, vin, keyPair, redeemScript, hashType, witnessValue, witnessScript){
  if (!transactionBuilder.inputs[vin])
    throw new Error("No input at index: " + vin)

  hashType = hashType || bitcoin.Transaction.SIGHASH_ALL

  var input = transactionBuilder.inputs[vin]

  // if redeemScript was previously provided, enforce consistency
  if (input.redeemScript !== undefined && redeemScript && !input.redeemScript.equals(redeemScript)) {
    throw new Error('Inconsistent redeemScript')
  }

  var kpPubKey = keyPair.publicKey

  // Check both publickKey, getPublicKey, and getPublicKeyBuffer to support all HDNode types (bitcoinjs-lib v3 & bip32 npm & bitcoinjs-lib v4 when it comes out)
  if (!kpPubKey && keyPair.getPublicKey)
    kpPubKey = keyPair.getPublicKey()
  else if (!kpPubKey && keyPair.getPublicKeyBuffer)
    kpPubKey = keyPair.getPublicKeyBuffer()

  if (!canSign(input)) {
    if (witnessValue !== undefined) {
      if (input.value !== undefined && input.value !== witnessValue)
        throw new Error('Input didn\'t match witnessValue')

      input.value = witnessValue
    }

    // @TODO: Add this when SegWit support is needed
    if (!canSign(input)) prepareInput(input, kpPubKey, redeemScript, witnessValue, witnessScript)
    if (!canSign(input)) throw Error(input.prevOutType + ' not supported')
  }

  var signatureHash
  if (input.witness) {
    signatureHash = transactionBuilder.tx.hashForWitnessV0(vin, input.signScript, input.value, hashType)
    // Will need to turn to the following when bitcoinjs-lib v4 comes out
    // signatureHash = transactionBuilder.__tx.hashForWitnessV0(vin, input.signScript, input.value, hashType)
  } else {
    // signatureHash = transactionBuilder.tx.hashForSignature(vin, input.signScript, hashType)
    signatureHash = hashForSignature(transactionBuilder.tx, extraBytes, vin, input.signScript, hashType)
    // Will need to turn to the following when bitcoinjs-lib v4 comes out
    // signatureHash = hashForSignature(transactionBuilder.__tx, extraBytes, vin, input.signScript, hashType)
  }

  var signed = input.pubKeys.some(function (pubKey, i) {
    if (!kpPubKey.equals(pubKey)) return false
    if (input.signatures[i]) throw new Error('Signature already exists')

    if (kpPubKey.length !== 33 && (
      input.signType === scriptTypes.P2WPKH ||
      input.redeemScriptType === scriptTypes.P2WSH ||
      input.prevOutType === scriptTypes.P2WSH
    )) throw new Error('BIP143 rejects uncompressed public keys in P2WPKH or P2WSH')

    let signature = keyPair.sign(signatureHash)


    if (Buffer.isBuffer(signature)) 
      signature = ECSignature.fromRSBuffer(signature)

    input.signatures[i] = signature.toScriptSignature(hashType)
    // Will need to turn to the following when bitcoinjs-lib v4 comes out
    // input.signatures[i] = bscript.signature.encode(signature, hashType)
    return true
  })

  if (!signed) throw new Error('Key pair cannot sign for this input')
}

function hashForSignature(transaction, extraBytes, inIndex, prevOutScript, hashType){
  // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighash_tests.cpp#L29
  if (inIndex >= transaction.ins.length) 
    return ONE

  // ignore OP_CODESEPARATOR
  var ourScript = bitcoin.script.compile(bitcoin.script.decompile(prevOutScript).filter(function (x) {
    return x !== 171 // OP_CODESEPARATOR
  }))

  var txTmp = transaction.clone()

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
    // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighash_tests.cpp#L60
    if (inIndex >= transaction.outs.length) 
      return ONE

    // truncate outputs after
    txTmp.outs.length = inIndex + 1

    // "blank" outputs before
    for (var i = 0; i < inIndex; i++) {
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
  var extraBytesString = extraBytes || "";

  // Get the regular tx hex buffer
  var buffer = Buffer.allocUnsafe(txTmp.__byteLength(false))
  txTmp.__toBuffer(buffer, 0, false)

  // tx hex buffer to string (for appending data)
  var txHexStr = buffer.toString('hex');

  // Append on Extra Bytes (floData)
  txHexStr += extraBytesString;

  // Create hashType buffer
  var hashTypeBuf = Buffer.allocUnsafe(4)
  hashTypeBuf.writeInt32LE(hashType, 0)

  // Add the hashType to the end of the hex string
  txHexStr += hashTypeBuf.toString('hex');

  // Convert hex string to buffer and hash256 it
  return bcrypto.hash256(new Buffer(txHexStr, 'hex'));
}

module.exports = {
  sign
}