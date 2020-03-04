'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const bufferutils_1 = require('@oipwg/bitcoinjs-lib/src/bufferutils')
const bcrypto = require('@oipwg/bitcoinjs-lib/src/crypto')
const bscript = require('@oipwg/bitcoinjs-lib/src/script')
const script_1 = require('@oipwg/bitcoinjs-lib/src/script')
const types = require('@oipwg/bitcoinjs-lib/src/types')
const typeforce = require('typeforce')
const varuint = require('varuint-bitcoin')

function varSliceSize (someScript) {
  const length = someScript.length
  return varuint.encodingLength(length) + length
}

function vectorSize (someVector) {
  const length = someVector.length
  return (
    varuint.encodingLength(length) +
    someVector.reduce((sum, witness) => {
      return sum + varSliceSize(witness)
    }, 0)
  )
}

const EMPTY_SCRIPT = Buffer.allocUnsafe(0)
const EMPTY_WITNESS = []
const ZERO = Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000000',
  'hex',
)
const ONE = Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000001',
  'hex',
)
const VALUE_UINT64_MAX = Buffer.from('ffffffffffffffff', 'hex')
const BLANK_OUTPUT = {
  script: EMPTY_SCRIPT,
  valueBuffer: VALUE_UINT64_MAX,
}

function isOutput (out) {
  return out.value !== undefined
}

class FloTransaction {
  constructor () {
    this.version = 1
    this.locktime = 0
    this.ins = []
    this.outs = []
    this.floData = Buffer.allocUnsafe(0)
  }

  static fromBuffer (buffer, _NO_STRICT) {
    const bufferReader = new bufferutils_1.BufferReader(buffer)
    const tx = new FloTransaction()
    tx.version = bufferReader.readInt32()
    const marker = bufferReader.readUInt8()
    const flag = bufferReader.readUInt8()
    let hasWitnesses = false
    if (
      marker === FloTransaction.ADVANCED_TRANSACTION_MARKER &&
      flag === FloTransaction.ADVANCED_TRANSACTION_FLAG
    ) {
      hasWitnesses = true
    } else {
      bufferReader.offset -= 2
    }
    const vinLen = bufferReader.readVarInt()
    for (let i = 0; i < vinLen; ++i) {
      tx.ins.push({
        hash: bufferReader.readSlice(32),
        index: bufferReader.readUInt32(),
        script: bufferReader.readVarSlice(),
        sequence: bufferReader.readUInt32(),
        witness: EMPTY_WITNESS,
      })
    }
    const voutLen = bufferReader.readVarInt()
    for (let i = 0; i < voutLen; ++i) {
      tx.outs.push({
        value: bufferReader.readUInt64(),
        script: bufferReader.readVarSlice(),
      })
    }
    if (hasWitnesses) {
      for (let i = 0; i < vinLen; ++i) {
        tx.ins[i].witness = bufferReader.readVector()
      }
      // was this pointless?
      if (!tx.hasWitnesses())
        throw new Error('FloTransaction has superfluous witness data')
    }
    tx.locktime = bufferReader.readUInt32()
    if (tx.version >= 2)
      tx.floData = bufferReader.readVarSlice()
    if (_NO_STRICT) return tx
    if (bufferReader.offset !== buffer.length)
      throw new Error('FloTransaction has unexpected data')
    return tx
  }

  static fromHex (hex) {
    return FloTransaction.fromBuffer(Buffer.from(hex, 'hex'), false)
  }

  static isCoinbaseHash (buffer) {
    typeforce(types.Hash256bit, buffer)
    for (let i = 0; i < 32; ++i) {
      if (buffer[i] !== 0) return false
    }
    return true
  }

  isCoinbase () {
    return (
      this.ins.length === 1 && FloTransaction.isCoinbaseHash(this.ins[0].hash)
    )
  }

  addInput (hash, index, sequence, scriptSig) {
    typeforce(
      types.tuple(
        types.Hash256bit,
        types.UInt32,
        types.maybe(types.UInt32),
        types.maybe(types.Buffer),
      ),
      arguments,
    )
    if (types.Null(sequence)) {
      sequence = FloTransaction.DEFAULT_SEQUENCE
    }
    // Add the input and return the input's index
    return (
      this.ins.push({
        hash,
        index,
        script: scriptSig || EMPTY_SCRIPT,
        sequence: sequence,
        witness: EMPTY_WITNESS,
      }) - 1
    )
  }

  addOutput (scriptPubKey, value) {
    typeforce(types.tuple(types.Buffer, types.Satoshi), arguments)
    // Add the output and return the output's index
    return (
      this.outs.push({
        script: scriptPubKey,
        value,
      }) - 1
    )
  }

  hasWitnesses () {
    return this.ins.some(x => {
      return x.witness.length !== 0
    })
  }

  weight () {
    const base = this.byteLength(false)
    const total = this.byteLength(true)
    return base * 3 + total
  }

  virtualSize () {
    return Math.ceil(this.weight() / 4)
  }

  byteLength (_ALLOW_WITNESS = true) {
    const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses()
    return (
      (hasWitnesses ? 10 : 8) +
      (this.version >= 2 ? varSliceSize(this.floData) : 0) +
      varuint.encodingLength(this.ins.length) +
      varuint.encodingLength(this.outs.length) +
      this.ins.reduce((sum, input) => {
        return sum + 40 + varSliceSize(input.script)
      }, 0) +
      this.outs.reduce((sum, output) => {
        return sum + 8 + varSliceSize(output.script)
      }, 0) +
      (hasWitnesses
        ? this.ins.reduce((sum, input) => {
          return sum + vectorSize(input.witness)
        }, 0)
        : 0)
    )
  }

  clone () {
    const newTx = new FloTransaction()
    newTx.version = this.version
    newTx.locktime = this.locktime
    newTx.floData = this.floData
    newTx.ins = this.ins.map(txIn => {
      return {
        hash: txIn.hash,
        index: txIn.index,
        script: txIn.script,
        sequence: txIn.sequence,
        witness: txIn.witness,
      }
    })
    newTx.outs = this.outs.map(txOut => {
      return {
        script: txOut.script,
        value: txOut.value,
      }
    })
    return newTx
  }

  /**
   * Hash floTransaction for signing a specific input.
   *
   * Bitcoin uses a different hash for each signed floTransaction input.
   * This method copies the floTransaction, makes the necessary changes based on the
   * hashType, and then hashes the result.
   * This hash can then be used to sign the provided floTransaction input.
   */
  hashForSignature (inIndex, prevOutScript, hashType) {
    typeforce(
      types.tuple(types.UInt32, types.Buffer, /* types.UInt8 */ types.Number),
      arguments,
    )
    // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighash_tests.cpp#L29
    if (inIndex >= this.ins.length) return ONE
    // ignore OP_CODESEPARATOR
    const ourScript = bscript.compile(
      bscript.decompile(prevOutScript).filter(x => {
        return x !== script_1.OPS.OP_CODESEPARATOR
      }),
    )
    const txTmp = this.clone()
    // SIGHASH_NONE: ignore all outputs? (wildcard payee)
    if ((hashType & 0x1f) === FloTransaction.SIGHASH_NONE) {
      txTmp.outs = []
      // ignore sequence numbers (except at inIndex)
      txTmp.ins.forEach((input, i) => {
        if (i === inIndex) return
        input.sequence = 0
      })
      // SIGHASH_SINGLE: ignore all outputs, except at the same index?
    } else if ((hashType & 0x1f) === FloTransaction.SIGHASH_SINGLE) {
      // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighash_tests.cpp#L60
      if (inIndex >= this.outs.length) return ONE
      // truncate outputs after
      txTmp.outs.length = inIndex + 1
      // "blank" outputs before
      for (let i = 0; i < inIndex; i++) {
        txTmp.outs[i] = BLANK_OUTPUT
      }
      // ignore sequence numbers (except at inIndex)
      txTmp.ins.forEach((input, y) => {
        if (y === inIndex) return
        input.sequence = 0
      })
    }
    // SIGHASH_ANYONECANPAY: ignore inputs entirely?
    if (hashType & FloTransaction.SIGHASH_ANYONECANPAY) {
      txTmp.ins = [txTmp.ins[inIndex]]
      txTmp.ins[0].script = ourScript
      // SIGHASH_ALL: only ignore input scripts
    } else {
      // "blank" others input scripts
      txTmp.ins.forEach(input => {
        input.script = EMPTY_SCRIPT
      })
      txTmp.ins[inIndex].script = ourScript
    }
    // serialize and hash
    const buffer = Buffer.allocUnsafe(txTmp.byteLength(false) + 4)
    buffer.writeInt32LE(hashType, buffer.length - 4)
    txTmp.__toBuffer(buffer, 0, false)
    return bcrypto.hash256(buffer)
  }

  hashForWitnessV0 (inIndex, prevOutScript, value, hashType) {
    typeforce(
      types.tuple(types.UInt32, types.Buffer, types.Satoshi, types.UInt32),
      arguments,
    )
    let tbuffer = Buffer.from([])
    let bufferWriter
    let hashOutputs = ZERO
    let hashPrevouts = ZERO
    let hashSequence = ZERO
    if (!(hashType & FloTransaction.SIGHASH_ANYONECANPAY)) {
      tbuffer = Buffer.allocUnsafe(36 * this.ins.length)
      bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0)
      this.ins.forEach(txIn => {
        bufferWriter.writeSlice(txIn.hash)
        bufferWriter.writeUInt32(txIn.index)
      })
      hashPrevouts = bcrypto.hash256(tbuffer)
    }
    if (
      !(hashType & FloTransaction.SIGHASH_ANYONECANPAY) &&
      (hashType & 0x1f) !== FloTransaction.SIGHASH_SINGLE &&
      (hashType & 0x1f) !== FloTransaction.SIGHASH_NONE
    ) {
      tbuffer = Buffer.allocUnsafe(4 * this.ins.length)
      bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0)
      this.ins.forEach(txIn => {
        bufferWriter.writeUInt32(txIn.sequence)
      })
      hashSequence = bcrypto.hash256(tbuffer)
    }
    if (
      (hashType & 0x1f) !== FloTransaction.SIGHASH_SINGLE &&
      (hashType & 0x1f) !== FloTransaction.SIGHASH_NONE
    ) {
      const txOutsSize = this.outs.reduce((sum, output) => {
        return sum + 8 + varSliceSize(output.script)
      }, 0)
      tbuffer = Buffer.allocUnsafe(txOutsSize)
      bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0)
      this.outs.forEach(out => {
        bufferWriter.writeUInt64(out.value)
        bufferWriter.writeVarSlice(out.script)
      })
      hashOutputs = bcrypto.hash256(tbuffer)
    } else if (
      (hashType & 0x1f) === FloTransaction.SIGHASH_SINGLE &&
      inIndex < this.outs.length
    ) {
      const output = this.outs[inIndex]
      tbuffer = Buffer.allocUnsafe(8 + varSliceSize(output.script))
      bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0)
      bufferWriter.writeUInt64(output.value)
      bufferWriter.writeVarSlice(output.script)
      hashOutputs = bcrypto.hash256(tbuffer)
    }
    tbuffer = Buffer.allocUnsafe(156 + varSliceSize(prevOutScript))
    bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0)
    const input = this.ins[inIndex]
    bufferWriter.writeUInt32(this.version)
    bufferWriter.writeSlice(hashPrevouts)
    bufferWriter.writeSlice(hashSequence)
    bufferWriter.writeSlice(input.hash)
    bufferWriter.writeUInt32(input.index)
    bufferWriter.writeVarSlice(prevOutScript)
    bufferWriter.writeUInt64(value)
    bufferWriter.writeUInt32(input.sequence)
    bufferWriter.writeSlice(hashOutputs)
    bufferWriter.writeUInt32(this.locktime)
    if (this.version >= 2)
      bufferWriter.writeVarSlice(this.floData)
    bufferWriter.writeUInt32(hashType)
    return bcrypto.hash256(tbuffer)
  }

  getHash (forWitness) {
    // wtxid for coinbase is always 32 bytes of 0x00
    if (forWitness && this.isCoinbase()) return Buffer.alloc(32, 0)
    return bcrypto.hash256(this.__toBuffer(undefined, undefined, forWitness))
  }

  getId () {
    // floTransaction hash's are displayed in reverse order
    return bufferutils_1.reverseBuffer(this.getHash(false)).toString('hex')
  }

  toBuffer (buffer, initialOffset) {
    return this.__toBuffer(buffer, initialOffset, true)
  }

  toHex () {
    return this.toBuffer(undefined, undefined).toString('hex')
  }

  setInputScript (index, scriptSig) {
    typeforce(types.tuple(types.Number, types.Buffer), arguments)
    this.ins[index].script = scriptSig
  }

  setWitness (index, witness) {
    typeforce(types.tuple(types.Number, [types.Buffer]), arguments)
    this.ins[index].witness = witness
  }

  __toBuffer (buffer, initialOffset, _ALLOW_WITNESS = false) {
    if (!buffer) buffer = Buffer.allocUnsafe(this.byteLength(_ALLOW_WITNESS))
    const bufferWriter = new bufferutils_1.BufferWriter(
      buffer,
      initialOffset || 0,
    )
    bufferWriter.writeInt32(this.version)
    const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses()
    if (hasWitnesses) {
      bufferWriter.writeUInt8(FloTransaction.ADVANCED_TRANSACTION_MARKER)
      bufferWriter.writeUInt8(FloTransaction.ADVANCED_TRANSACTION_FLAG)
    }
    bufferWriter.writeVarInt(this.ins.length)
    this.ins.forEach(txIn => {
      bufferWriter.writeSlice(txIn.hash)
      bufferWriter.writeUInt32(txIn.index)
      bufferWriter.writeVarSlice(txIn.script)
      bufferWriter.writeUInt32(txIn.sequence)
    })
    bufferWriter.writeVarInt(this.outs.length)
    this.outs.forEach(txOut => {
      if (isOutput(txOut)) {
        bufferWriter.writeUInt64(txOut.value)
      } else {
        bufferWriter.writeSlice(txOut.valueBuffer)
      }
      bufferWriter.writeVarSlice(txOut.script)
    })
    if (hasWitnesses) {
      this.ins.forEach(input => {
        bufferWriter.writeVector(input.witness)
      })
    }
    bufferWriter.writeUInt32(this.locktime)
    if (this.version >= 2)
      bufferWriter.writeVarSlice(this.floData)
    // avoid slicing unless necessary
    if (initialOffset !== undefined)
      return buffer.slice(initialOffset, bufferWriter.offset)
    return buffer
  }
}

FloTransaction.DEFAULT_SEQUENCE = 0xffffffff
FloTransaction.SIGHASH_ALL = 0x01
FloTransaction.SIGHASH_NONE = 0x02
FloTransaction.SIGHASH_SINGLE = 0x03
FloTransaction.SIGHASH_ANYONECANPAY = 0x80
FloTransaction.ADVANCED_TRANSACTION_MARKER = 0x00
FloTransaction.ADVANCED_TRANSACTION_FLAG = 0x01

const bip174_1 = require('bip174')
const utils_1 = require('bip174/src/lib/utils')
const address_1 = require('@oipwg/bitcoinjs-lib/src/address')
const crypto_1 = require('@oipwg/bitcoinjs-lib/src/crypto')
const ecpair_1 = require('@oipwg/bitcoinjs-lib/src/ecpair')
const networks_1 = require('@oipwg/bitcoinjs-lib/src/networks')
const payments = require('@oipwg/bitcoinjs-lib/src/payments')
const transaction_1 = require('@oipwg/bitcoinjs-lib/src/transaction')
/**
 * These are the default arguments for a Psbt instance.
 */
const DEFAULT_OPTS = {
  /**
   * A bitcoinjs Network object. This is only used if you pass an `address`
   * parameter to addOutput. Otherwise it is not needed and can be left default.
   */
  network: networks_1.bitcoin,
  /**
   * When extractTransaction is called, the fee rate is checked.
   * THIS IS NOT TO BE RELIED ON.
   * It is only here as a last ditch effort to prevent sending a 500 BTC fee etc.
   */
  maximumFeeRate: 5000,
}

/**
 * Psbt class can parse and generate a PSBT binary based off of the BIP174.
 * There are 6 roles that this class fulfills. (Explained in BIP174)
 *
 * Creator: This can be done with `new Psbt()`
 * Updater: This can be done with `psbt.addInput(input)`, `psbt.addInputs(inputs)`,
 *   `psbt.addOutput(output)`, `psbt.addOutputs(outputs)` when you are looking to
 *   add new inputs and outputs to the PSBT, and `psbt.updateGlobal(itemObject)`,
 *   `psbt.updateInput(itemObject)`, `psbt.updateOutput(itemObject)`
 *   addInput requires hash: Buffer | string; and index: number; as attributes
 *   and can also include any attributes that are used in updateInput method.
 *   addOutput requires script: Buffer; and value: number; and likewise can include
 *   data for updateOutput.
 *   For a list of what attributes should be what types. Check the bip174 library.
 *   Also, check the integration tests for some examples of usage.
 * Signer: There are a few methods. signAllInputs and signAllInputsAsync, which will search all input
 *   information for your pubkey or pubkeyhash, and only sign inputs where it finds
 *   your info. Or you can explicitly sign a specific input with signInput and
 *   signInputAsync. For the async methods you can create a SignerAsync object
 *   and use something like a hardware wallet to sign with. (You must implement this)
 * Combiner: psbts can be combined easily with `psbt.combine(psbt2, psbt3, psbt4 ...)`
 *   the psbt calling combine will always have precedence when a conflict occurs.
 *   Combine checks if the internal bitcoin transaction is the same, so be sure that
 *   all sequences, version, locktime, etc. are the same before combining.
 * Input Finalizer: This role is fairly important. Not only does it need to construct
 *   the input scriptSigs and witnesses, but it SHOULD verify the signatures etc.
 *   Before running `psbt.finalizeAllInputs()` please run `psbt.validateSignaturesOfAllInputs()`
 *   Running any finalize method will delete any data in the input(s) that are no longer
 *   needed due to the finalized scripts containing the information.
 * Transaction Extractor: This role will perform some checks before returning a
 *   Transaction object. Such as fee rate not being larger than maximumFeeRate etc.
 */
class FloPsbt {
  constructor (opts = {}, data = new bip174_1.Psbt(new FloPsbtTransaction())) {
    this.data = data
    // set defaults
    this.opts = Object.assign({}, DEFAULT_OPTS, opts)
    this.__CACHE = {
      __NON_WITNESS_UTXO_TX_CACHE: [],
      __NON_WITNESS_UTXO_BUF_CACHE: [],
      __TX_IN_CACHE: {},
      __TX: this.data.globalMap.unsignedTx.tx,
    }
    if (this.data.inputs.length === 0) this.setVersion(2)
    // Make data hidden when enumerating
    const dpew = (obj, attr, enumerable, writable) =>
      Object.defineProperty(obj, attr, {
        enumerable,
        writable,
      })
    dpew(this, '__CACHE', false, true)
    dpew(this, 'opts', false, true)
  }

  static fromBase64 (data, opts = {}) {
    const buffer = Buffer.from(data, 'base64')
    return this.fromBuffer(buffer, opts)
  }

  static fromHex (data, opts = {}) {
    const buffer = Buffer.from(data, 'hex')
    return this.fromBuffer(buffer, opts)
  }

  static fromBuffer (buffer, opts = {}) {
    const psbtBase = bip174_1.Psbt.fromBuffer(buffer, transactionFromBuffer)
    const psbt = new Psbt(opts, psbtBase)
    checkTxForDupeIns(psbt.__CACHE.__TX, psbt.__CACHE)
    return psbt
  }

  get inputCount () {
    return this.data.inputs.length
  }

  combine (...those) {
    this.data.combine(...those.map(o => o.data))
    return this
  }

  clone () {
    // TODO: more efficient cloning
    const res = Psbt.fromBuffer(this.data.toBuffer())
    res.opts = JSON.parse(JSON.stringify(this.opts))
    return res
  }

  setMaximumFeeRate (satoshiPerByte) {
    check32Bit(satoshiPerByte) // 42.9 BTC per byte IS excessive... so throw
    this.opts.maximumFeeRate = satoshiPerByte
  }

  setVersion (version) {
    check32Bit(version)
    checkInputsForPartialSig(this.data.inputs, 'setVersion')
    const c = this.__CACHE
    c.__TX.version = version
    c.__EXTRACTED_TX = undefined
    return this
  }

  setLocktime (locktime) {
    check32Bit(locktime)
    checkInputsForPartialSig(this.data.inputs, 'setLocktime')
    const c = this.__CACHE
    c.__TX.locktime = locktime
    c.__EXTRACTED_TX = undefined
    return this
  }

  setFloData (flodata) {
    // check32Bit(locktime);
    checkInputsForPartialSig(this.data.inputs, 'setFloData')
    const c = this.__CACHE
    c.__TX.floData = flodata
    c.__EXTRACTED_TX = undefined
    return this
  }

  setInputSequence (inputIndex, sequence) {
    check32Bit(sequence)
    checkInputsForPartialSig(this.data.inputs, 'setInputSequence')
    const c = this.__CACHE
    if (c.__TX.ins.length <= inputIndex) {
      throw new Error('Input index too high')
    }
    c.__TX.ins[inputIndex].sequence = sequence
    c.__EXTRACTED_TX = undefined
    return this
  }

  addInputs (inputDatas) {
    inputDatas.forEach(inputData => this.addInput(inputData))
    return this
  }

  addInput (inputData) {
    if (
      arguments.length > 1 ||
      !inputData ||
      inputData.hash === undefined ||
      inputData.index === undefined
    ) {
      throw new Error(
        `Invalid arguments for Psbt.addInput. ` +
        `Requires single object with at least [hash] and [index]`,
      )
    }
    checkInputsForPartialSig(this.data.inputs, 'addInput')
    const c = this.__CACHE
    this.data.addInput(inputData)
    const txIn = c.__TX.ins[c.__TX.ins.length - 1]
    checkTxInputCache(c, txIn)
    const inputIndex = this.data.inputs.length - 1
    const input = this.data.inputs[inputIndex]
    if (input.nonWitnessUtxo) {
      addNonWitnessTxCache(this.__CACHE, input, inputIndex)
    }
    c.__FEE = undefined
    c.__FEE_RATE = undefined
    c.__EXTRACTED_TX = undefined
    return this
  }

  addOutputs (outputDatas) {
    outputDatas.forEach(outputData => this.addOutput(outputData))
    return this
  }

  addOutput (outputData) {
    if (
      arguments.length > 1 ||
      !outputData ||
      outputData.value === undefined ||
      (outputData.address === undefined && outputData.script === undefined)
    ) {
      throw new Error(
        `Invalid arguments for Psbt.addOutput. ` +
        `Requires single object with at least [script or address] and [value]`,
      )
    }
    checkInputsForPartialSig(this.data.inputs, 'addOutput')
    const { address } = outputData
    if (typeof address === 'string') {
      const { network } = this.opts
      const script = address_1.toOutputScript(address, network)
      outputData = Object.assign(outputData, { script })
    }
    const c = this.__CACHE
    this.data.addOutput(outputData)
    c.__FEE = undefined
    c.__FEE_RATE = undefined
    c.__EXTRACTED_TX = undefined
    return this
  }

  extractTransaction (disableFeeCheck) {
    if (!this.data.inputs.every(isFinalized)) throw new Error('Not finalized')
    const c = this.__CACHE
    if (!disableFeeCheck) {
      checkFees(this, c, this.opts)
    }
    if (c.__EXTRACTED_TX) return c.__EXTRACTED_TX
    const tx = c.__TX.clone()
    inputFinalizeGetAmts(this.data.inputs, tx, c, true)
    return tx
  }

  getFeeRate () {
    return getTxCacheValue(
      '__FEE_RATE',
      'fee rate',
      this.data.inputs,
      this.__CACHE,
    )
  }

  getFee () {
    return getTxCacheValue('__FEE', 'fee', this.data.inputs, this.__CACHE)
  }

  finalizeAllInputs () {
    utils_1.checkForInput(this.data.inputs, 0) // making sure we have at least one
    range(this.data.inputs.length).forEach(idx => this.finalizeInput(idx))
    return this
  }

  finalizeInput (inputIndex, finalScriptsFunc = getFinalScripts) {
    const input = utils_1.checkForInput(this.data.inputs, inputIndex)
    const { script, isP2SH, isP2WSH, isSegwit } = getScriptFromInput(
      inputIndex,
      input,
      this.__CACHE,
    )
    if (!script) throw new Error(`No script found for input #${inputIndex}`)
    checkPartialSigSighashes(input)
    const { finalScriptSig, finalScriptWitness } = finalScriptsFunc(
      inputIndex,
      input,
      script,
      isSegwit,
      isP2SH,
      isP2WSH,
    )
    if (finalScriptSig) this.data.updateInput(inputIndex, { finalScriptSig })
    if (finalScriptWitness)
      this.data.updateInput(inputIndex, { finalScriptWitness })
    if (!finalScriptSig && !finalScriptWitness)
      throw new Error(`Unknown error finalizing input #${inputIndex}`)
    this.data.clearFinalizedInput(inputIndex)
    return this
  }

  validateSignaturesOfAllInputs () {
    utils_1.checkForInput(this.data.inputs, 0) // making sure we have at least one
    const results = range(this.data.inputs.length).map(idx =>
      this.validateSignaturesOfInput(idx),
    )
    return results.reduce((final, res) => res === true && final, true)
  }

  validateSignaturesOfInput (inputIndex, pubkey) {
    const input = this.data.inputs[inputIndex]
    const partialSig = (input || {}).partialSig
    if (!input || !partialSig || partialSig.length < 1)
      throw new Error('No signatures to validate')
    const mySigs = pubkey
      ? partialSig.filter(sig => sig.pubkey.equals(pubkey))
      : partialSig
    if (mySigs.length < 1) throw new Error('No signatures for this pubkey')
    const results = []
    let hashCache
    let scriptCache
    let sighashCache
    for (const pSig of mySigs) {
      const sig = bscript.signature.decode(pSig.signature)
      const { hash, script } =
        sighashCache !== sig.hashType
          ? getHashForSig(
          inputIndex,
          Object.assign({}, input, { sighashType: sig.hashType }),
          this.__CACHE,
          )
          : { hash: hashCache, script: scriptCache }
      sighashCache = sig.hashType
      hashCache = hash
      scriptCache = script
      checkScriptForPubkey(pSig.pubkey, script, 'verify')
      const keypair = ecpair_1.fromPublicKey(pSig.pubkey)
      results.push(keypair.verify(hash, sig.signature))
    }
    return results.every(res => res === true)
  }

  signAllInputsHD (
    hdKeyPair,
    sighashTypes = [transaction_1.Transaction.SIGHASH_ALL],
  ) {
    if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
      throw new Error('Need HDSigner to sign input')
    }
    const results = []
    for (const i of range(this.data.inputs.length)) {
      try {
        this.signInputHD(i, hdKeyPair, sighashTypes)
        results.push(true)
      } catch (err) {
        results.push(false)
      }
    }
    if (results.every(v => v === false)) {
      throw new Error('No inputs were signed')
    }
    return this
  }

  signAllInputsHDAsync (
    hdKeyPair,
    sighashTypes = [transaction_1.Transaction.SIGHASH_ALL],
  ) {
    return new Promise((resolve, reject) => {
      if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
        return reject(new Error('Need HDSigner to sign input'))
      }
      const results = []
      const promises = []
      for (const i of range(this.data.inputs.length)) {
        promises.push(
          this.signInputHDAsync(i, hdKeyPair, sighashTypes).then(
            () => {
              results.push(true)
            },
            () => {
              results.push(false)
            },
          ),
        )
      }
      return Promise.all(promises).then(() => {
        if (results.every(v => v === false)) {
          return reject(new Error('No inputs were signed'))
        }
        resolve()
      })
    })
  }

  signInputHD (
    inputIndex,
    hdKeyPair,
    sighashTypes = [transaction_1.Transaction.SIGHASH_ALL],
  ) {
    if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
      throw new Error('Need HDSigner to sign input')
    }
    const signers = getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair)
    signers.forEach(signer => this.signInput(inputIndex, signer, sighashTypes))
    return this
  }

  signInputHDAsync (
    inputIndex,
    hdKeyPair,
    sighashTypes = [transaction_1.Transaction.SIGHASH_ALL],
  ) {
    return new Promise((resolve, reject) => {
      if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
        return reject(new Error('Need HDSigner to sign input'))
      }
      const signers = getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair)
      const promises = signers.map(signer =>
        this.signInputAsync(inputIndex, signer, sighashTypes),
      )
      return Promise.all(promises)
        .then(() => {
          resolve()
        })
        .catch(reject)
    })
  }

  signAllInputs (
    keyPair,
    sighashTypes = [transaction_1.Transaction.SIGHASH_ALL],
  ) {
    if (!keyPair || !keyPair.publicKey)
      throw new Error('Need Signer to sign input')
    // TODO: Add a pubkey/pubkeyhash cache to each input
    // as input information is added, then eventually
    // optimize this method.
    const results = []
    for (const i of range(this.data.inputs.length)) {
      try {
        this.signInput(i, keyPair, sighashTypes)
        results.push(true)
      } catch (err) {
        console.error(err)
        results.push(false)
      }
    }
    if (results.every(v => v === false)) {
      throw new Error('No inputs were signed')
    }
    return this
  }

  signAllInputsAsync (
    keyPair,
    sighashTypes = [transaction_1.Transaction.SIGHASH_ALL],
  ) {
    return new Promise((resolve, reject) => {
      if (!keyPair || !keyPair.publicKey)
        return reject(new Error('Need Signer to sign input'))
      // TODO: Add a pubkey/pubkeyhash cache to each input
      // as input information is added, then eventually
      // optimize this method.
      const results = []
      const promises = []
      for (const [i] of this.data.inputs.entries()) {
        promises.push(
          this.signInputAsync(i, keyPair, sighashTypes).then(
            () => {
              results.push(true)
            },
            () => {
              results.push(false)
            },
          ),
        )
      }
      return Promise.all(promises).then(() => {
        if (results.every(v => v === false)) {
          return reject(new Error('No inputs were signed'))
        }
        resolve()
      })
    })
  }

  signInput (
    inputIndex,
    keyPair,
    sighashTypes = [transaction_1.Transaction.SIGHASH_ALL],
  ) {
    if (!keyPair || !keyPair.publicKey)
      throw new Error('Need Signer to sign input')
    const { hash, sighashType } = getHashAndSighashType(
      this.data.inputs,
      inputIndex,
      keyPair.publicKey,
      this.__CACHE,
      sighashTypes,
    )
    const partialSig = [
      {
        pubkey: keyPair.publicKey,
        signature: bscript.signature.encode(keyPair.sign(hash), sighashType),
      },
    ]
    this.data.updateInput(inputIndex, { partialSig })
    return this
  }

  signInputAsync (
    inputIndex,
    keyPair,
    sighashTypes = [transaction_1.Transaction.SIGHASH_ALL],
  ) {
    return new Promise((resolve, reject) => {
      if (!keyPair || !keyPair.publicKey)
        return reject(new Error('Need Signer to sign input'))
      const { hash, sighashType } = getHashAndSighashType(
        this.data.inputs,
        inputIndex,
        keyPair.publicKey,
        this.__CACHE,
        sighashTypes,
      )
      Promise.resolve(keyPair.sign(hash)).then(signature => {
        const partialSig = [
          {
            pubkey: keyPair.publicKey,
            signature: bscript.signature.encode(signature, sighashType),
          },
        ]
        this.data.updateInput(inputIndex, { partialSig })
        resolve()
      })
    })
  }

  toBuffer () {
    return this.data.toBuffer()
  }

  toHex () {
    return this.data.toHex()
  }

  toBase64 () {
    return this.data.toBase64()
  }

  updateGlobal (updateData) {
    this.data.updateGlobal(updateData)
    return this
  }

  updateInput (inputIndex, updateData) {
    this.data.updateInput(inputIndex, updateData)
    if (updateData.nonWitnessUtxo) {
      addNonWitnessTxCache(
        this.__CACHE,
        this.data.inputs[inputIndex],
        inputIndex,
      )
    }
    return this
  }

  updateOutput (outputIndex, updateData) {
    this.data.updateOutput(outputIndex, updateData)
    return this
  }

  addUnknownKeyValToGlobal (keyVal) {
    this.data.addUnknownKeyValToGlobal(keyVal)
    return this
  }

  addUnknownKeyValToInput (inputIndex, keyVal) {
    this.data.addUnknownKeyValToInput(inputIndex, keyVal)
    return this
  }

  addUnknownKeyValToOutput (outputIndex, keyVal) {
    this.data.addUnknownKeyValToOutput(outputIndex, keyVal)
    return this
  }

  clearFinalizedInput (inputIndex) {
    this.data.clearFinalizedInput(inputIndex)
    return this
  }
}

/**
 * This function is needed to pass to the bip174 base class's fromBuffer.
 * It takes the "transaction buffer" portion of the psbt buffer and returns a
 * Transaction (From the bip174 library) interface.
 */
const transactionFromBuffer = buffer => new PsbtTransaction(buffer)

/**
 * This class implements the Transaction interface from bip174 library.
 * It contains a @oipwg/bitcoinjs-lib Transaction object.
 */
class FloPsbtTransaction {
  constructor (buffer = Buffer.from([2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])) {
    this.tx = FloTransaction.fromBuffer(buffer)
    checkTxEmpty(this.tx)
    Object.defineProperty(this, 'tx', {
      enumerable: false,
      writable: true,
    })
  }

  getInputOutputCounts () {
    return {
      inputCount: this.tx.ins.length,
      outputCount: this.tx.outs.length,
    }
  }

  addInput (input) {
    if (
      input.hash === undefined ||
      input.index === undefined ||
      (!Buffer.isBuffer(input.hash) && typeof input.hash !== 'string') ||
      typeof input.index !== 'number'
    ) {
      throw new Error('Error adding input.')
    }
    const hash =
      typeof input.hash === 'string'
        ? bufferutils_1.reverseBuffer(Buffer.from(input.hash, 'hex'))
        : input.hash
    this.tx.addInput(hash, input.index, input.sequence)
  }

  addOutput (output) {
    if (
      output.script === undefined ||
      output.value === undefined ||
      !Buffer.isBuffer(output.script) ||
      typeof output.value !== 'number'
    ) {
      throw new Error('Error adding output.')
    }
    this.tx.addOutput(output.script, output.value)
  }

  toBuffer () {
    return this.tx.toBuffer()
  }
}

function canFinalize (input, script, scriptType) {
  switch (scriptType) {
    case 'pubkey':
    case 'pubkeyhash':
    case 'witnesspubkeyhash':
      return hasSigs(1, input.partialSig)
    case 'multisig':
      const p2ms = payments.p2ms({ output: script })
      return hasSigs(p2ms.m, input.partialSig, p2ms.pubkeys)
    default:
      return false
  }
}

function hasSigs (neededSigs, partialSig, pubkeys) {
  if (!partialSig) return false
  let sigs
  if (pubkeys) {
    sigs = pubkeys
      .map(pkey => {
        const pubkey = ecpair_1.fromPublicKey(pkey, { compressed: true })
          .publicKey
        return partialSig.find(pSig => pSig.pubkey.equals(pubkey))
      })
      .filter(v => !!v)
  } else {
    sigs = partialSig
  }
  if (sigs.length > neededSigs) throw new Error('Too many signatures')
  return sigs.length === neededSigs
}

function isFinalized (input) {
  return !!input.finalScriptSig || !!input.finalScriptWitness
}

function isPaymentFactory (payment) {
  return script => {
    try {
      payment({ output: script })
      return true
    } catch (err) {
      return false
    }
  }
}

const isP2MS = isPaymentFactory(payments.p2ms)
const isP2PK = isPaymentFactory(payments.p2pk)
const isP2PKH = isPaymentFactory(payments.p2pkh)
const isP2WPKH = isPaymentFactory(payments.p2wpkh)
const isP2WSHScript = isPaymentFactory(payments.p2wsh)

function check32Bit (num) {
  if (
    typeof num !== 'number' ||
    num !== Math.floor(num) ||
    num > 0xffffffff ||
    num < 0
  ) {
    throw new Error('Invalid 32 bit integer')
  }
}

function checkFees (psbt, cache, opts) {
  const feeRate = cache.__FEE_RATE || psbt.getFeeRate()
  const vsize = cache.__EXTRACTED_TX.virtualSize()
  const satoshis = feeRate * vsize
  if (feeRate >= opts.maximumFeeRate) {
    throw new Error(
      `Warning: You are paying around ${(satoshis / 1e8).toFixed(8)} in ` +
      `fees, which is ${feeRate} satoshi per byte for a transaction ` +
      `with a VSize of ${vsize} bytes (segwit counted as 0.25 byte per ` +
      `byte). Use setMaximumFeeRate method to raise your threshold, or ` +
      `pass true to the first arg of extractTransaction.`,
    )
  }
}

function checkInputsForPartialSig (inputs, action) {
  inputs.forEach(input => {
    let throws = false
    let pSigs = []
    if ((input.partialSig || []).length === 0) {
      if (!input.finalScriptSig && !input.finalScriptWitness) return
      pSigs = getPsigsFromInputFinalScripts(input)
    } else {
      pSigs = input.partialSig
    }
    pSigs.forEach(pSig => {
      const { hashType } = bscript.signature.decode(pSig.signature)
      const whitelist = []
      const isAnyoneCanPay =
        hashType & FloTransaction.SIGHASH_ANYONECANPAY
      if (isAnyoneCanPay) whitelist.push('addInput')
      const hashMod = hashType & 0x1f
      switch (hashMod) {
        case FloTransaction.SIGHASH_ALL:
          break
        case FloTransaction.SIGHASH_SINGLE:
        case FloTransaction.SIGHASH_NONE:
          whitelist.push('addOutput')
          whitelist.push('setInputSequence')
          break
      }
      if (whitelist.indexOf(action) === -1) {
        throws = true
      }
    })
    if (throws) {
      throw new Error('Can not modify transaction, signatures exist.')
    }
  })
}

function checkPartialSigSighashes (input) {
  if (!input.sighashType || !input.partialSig) return
  const { partialSig, sighashType } = input
  partialSig.forEach(pSig => {
    const { hashType } = bscript.signature.decode(pSig.signature)
    if (sighashType !== hashType) {
      throw new Error('Signature sighash does not match input sighash type')
    }
  })
}

function checkScriptForPubkey (pubkey, script, action) {
  const pubkeyHash = crypto_1.hash160(pubkey)
  const decompiled = bscript.decompile(script)
  if (decompiled === null) throw new Error('Unknown script error')
  const hasKey = decompiled.some(element => {
    if (typeof element === 'number') return false
    return element.equals(pubkey) || element.equals(pubkeyHash)
  })
  if (!hasKey) {
    throw new Error(
      `Can not ${action} for this input with the key ${pubkey.toString('hex')}`,
    )
  }
}

function checkTxEmpty (tx) {
  const isEmpty = tx.ins.every(
    input =>
      input.script &&
      input.script.length === 0 &&
      input.witness &&
      input.witness.length === 0,
  )
  if (!isEmpty) {
    throw new Error('Format Error: Transaction ScriptSigs are not empty')
  }
}

function checkTxForDupeIns (tx, cache) {
  tx.ins.forEach(input => {
    checkTxInputCache(cache, input)
  })
}

function checkTxInputCache (cache, input) {
  const key =
    bufferutils_1.reverseBuffer(Buffer.from(input.hash)).toString('hex') +
    ':' +
    input.index
  if (cache.__TX_IN_CACHE[key]) throw new Error('Duplicate input detected.')
  cache.__TX_IN_CACHE[key] = 1
}

function scriptCheckerFactory (payment, paymentScriptName) {
  return (inputIndex, scriptPubKey, redeemScript) => {
    const redeemScriptOutput = payment({
      redeem: { output: redeemScript },
    }).output
    if (!scriptPubKey.equals(redeemScriptOutput)) {
      throw new Error(
        `${paymentScriptName} for input #${inputIndex} doesn't match the scriptPubKey in the prevout`,
      )
    }
  }
}

const checkRedeemScript = scriptCheckerFactory(payments.p2sh, 'Redeem script')
const checkWitnessScript = scriptCheckerFactory(
  payments.p2wsh,
  'Witness script',
)

function getTxCacheValue (key, name, inputs, c) {
  if (!inputs.every(isFinalized))
    throw new Error(`PSBT must be finalized to calculate ${name}`)
  if (key === '__FEE_RATE' && c.__FEE_RATE) return c.__FEE_RATE
  if (key === '__FEE' && c.__FEE) return c.__FEE
  let tx
  let mustFinalize = true
  if (c.__EXTRACTED_TX) {
    tx = c.__EXTRACTED_TX
    mustFinalize = false
  } else {
    tx = c.__TX.clone()
  }
  inputFinalizeGetAmts(inputs, tx, c, mustFinalize)
  if (key === '__FEE_RATE') return c.__FEE_RATE
  else if (key === '__FEE') return c.__FEE
}

function getFinalScripts (inputIndex, input, script, isSegwit, isP2SH, isP2WSH) {
  const scriptType = classifyScript(script)
  if (!canFinalize(input, script, scriptType))
    throw new Error(`Can not finalize input #${inputIndex}`)
  return prepareFinalScripts(
    script,
    scriptType,
    input.partialSig,
    isSegwit,
    isP2SH,
    isP2WSH,
  )
}

function prepareFinalScripts (
  script,
  scriptType,
  partialSig,
  isSegwit,
  isP2SH,
  isP2WSH,
) {
  let finalScriptSig
  let finalScriptWitness
  // Wow, the payments API is very handy
  const payment = getPayment(script, scriptType, partialSig)
  const p2wsh = !isP2WSH ? null : payments.p2wsh({ redeem: payment })
  const p2sh = !isP2SH ? null : payments.p2sh({ redeem: p2wsh || payment })
  if (isSegwit) {
    if (p2wsh) {
      finalScriptWitness = witnessStackToScriptWitness(p2wsh.witness)
    } else {
      finalScriptWitness = witnessStackToScriptWitness(payment.witness)
    }
    if (p2sh) {
      finalScriptSig = p2sh.input
    }
  } else {
    if (p2sh) {
      finalScriptSig = p2sh.input
    } else {
      finalScriptSig = payment.input
    }
  }
  return {
    finalScriptSig,
    finalScriptWitness,
  }
}

function getHashAndSighashType (
  inputs,
  inputIndex,
  pubkey,
  cache,
  sighashTypes,
) {
  const input = utils_1.checkForInput(inputs, inputIndex)
  const { hash, sighashType, script } = getHashForSig(
    inputIndex,
    input,
    cache,
    sighashTypes,
  )
  checkScriptForPubkey(pubkey, script, 'sign')
  return {
    hash,
    sighashType,
  }
}

function getHashForSig (inputIndex, input, cache, sighashTypes) {
  const unsignedTx = cache.__TX
  const sighashType =
    input.sighashType || FloTransaction.SIGHASH_ALL
  if (sighashTypes && sighashTypes.indexOf(sighashType) < 0) {
    const str = sighashTypeToString(sighashType)
    throw new Error(
      `Sighash type is not allowed. Retry the sign method passing the ` +
      `sighashTypes array of whitelisted types. Sighash type: ${str}`,
    )
  }
  let hash
  let script
  if (input.nonWitnessUtxo) {
    const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(
      cache,
      input,
      inputIndex,
    )
    const prevoutHash = unsignedTx.ins[inputIndex].hash
    const utxoHash = nonWitnessUtxoTx.getHash()
    // If a non-witness UTXO is provided, its hash must match the hash specified in the prevout
    if (!prevoutHash.equals(utxoHash)) {
      throw new Error(
        `Non-witness UTXO hash for input #${inputIndex} doesn't match the hash specified in the prevout`,
      )
    }
    const prevoutIndex = unsignedTx.ins[inputIndex].index
    const prevout = nonWitnessUtxoTx.outs[prevoutIndex]
    if (input.redeemScript) {
      // If a redeemScript is provided, the scriptPubKey must be for that redeemScript
      checkRedeemScript(inputIndex, prevout.script, input.redeemScript)
      script = input.redeemScript
    } else {
      script = prevout.script
    }
    if (isP2WSHScript(script)) {
      if (!input.witnessScript)
        throw new Error('Segwit input needs witnessScript if not P2WPKH')
      checkWitnessScript(inputIndex, script, input.witnessScript)
      hash = unsignedTx.hashForWitnessV0(
        inputIndex,
        input.witnessScript,
        prevout.value,
        sighashType,
      )
      script = input.witnessScript
    } else if (isP2WPKH(script)) {
      // P2WPKH uses the P2PKH template for prevoutScript when signing
      const signingScript = payments.p2pkh({ hash: script.slice(2) }).output
      hash = unsignedTx.hashForWitnessV0(
        inputIndex,
        signingScript,
        prevout.value,
        sighashType,
      )
    } else {
      hash = unsignedTx.hashForSignature(inputIndex, script, sighashType)
    }
  } else if (input.witnessUtxo) {
    let _script // so we don't shadow the `let script` above
    if (input.redeemScript) {
      // If a redeemScript is provided, the scriptPubKey must be for that redeemScript
      checkRedeemScript(
        inputIndex,
        input.witnessUtxo.script,
        input.redeemScript,
      )
      _script = input.redeemScript
    } else {
      _script = input.witnessUtxo.script
    }
    if (isP2WPKH(_script)) {
      // P2WPKH uses the P2PKH template for prevoutScript when signing
      const signingScript = payments.p2pkh({ hash: _script.slice(2) }).output
      hash = unsignedTx.hashForWitnessV0(
        inputIndex,
        signingScript,
        input.witnessUtxo.value,
        sighashType,
      )
      script = _script
    } else if (isP2WSHScript(_script)) {
      if (!input.witnessScript)
        throw new Error('Segwit input needs witnessScript if not P2WPKH')
      checkWitnessScript(inputIndex, _script, input.witnessScript)
      hash = unsignedTx.hashForWitnessV0(
        inputIndex,
        input.witnessScript,
        input.witnessUtxo.value,
        sighashType,
      )
      // want to make sure the script we return is the actual meaningful script
      script = input.witnessScript
    } else {
      throw new Error(
        `Input #${inputIndex} has witnessUtxo but non-segwit script: ` +
        `${_script.toString('hex')}`,
      )
    }
  } else {
    throw new Error('Need a Utxo input item for signing')
  }
  return {
    script,
    sighashType,
    hash,
  }
}

function getPayment (script, scriptType, partialSig) {
  let payment
  switch (scriptType) {
    case 'multisig':
      const sigs = getSortedSigs(script, partialSig)
      payment = payments.p2ms({
        output: script,
        signatures: sigs,
      })
      break
    case 'pubkey':
      payment = payments.p2pk({
        output: script,
        signature: partialSig[0].signature,
      })
      break
    case 'pubkeyhash':
      payment = payments.p2pkh({
        output: script,
        pubkey: partialSig[0].pubkey,
        signature: partialSig[0].signature,
      })
      break
    case 'witnesspubkeyhash':
      payment = payments.p2wpkh({
        output: script,
        pubkey: partialSig[0].pubkey,
        signature: partialSig[0].signature,
      })
      break
  }
  return payment
}

function getPsigsFromInputFinalScripts (input) {
  const scriptItems = !input.finalScriptSig
    ? []
    : bscript.decompile(input.finalScriptSig) || []
  const witnessItems = !input.finalScriptWitness
    ? []
    : bscript.decompile(input.finalScriptWitness) || []
  return scriptItems
    .concat(witnessItems)
    .filter(item => {
      return Buffer.isBuffer(item) && bscript.isCanonicalScriptSignature(item)
    })
    .map(sig => ({ signature: sig }))
}

function getScriptFromInput (inputIndex, input, cache) {
  const unsignedTx = cache.__TX
  const res = {
    script: null,
    isSegwit: false,
    isP2SH: false,
    isP2WSH: false,
  }
  res.isP2SH = !!input.redeemScript
  res.isP2WSH = !!input.witnessScript
  if (input.witnessScript) {
    res.script = input.witnessScript
  } else if (input.redeemScript) {
    res.script = input.redeemScript
  } else {
    if (input.nonWitnessUtxo) {
      const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(
        cache,
        input,
        inputIndex,
      )
      const prevoutIndex = unsignedTx.ins[inputIndex].index
      res.script = nonWitnessUtxoTx.outs[prevoutIndex].script
    } else if (input.witnessUtxo) {
      res.script = input.witnessUtxo.script
    }
  }
  if (input.witnessScript || isP2WPKH(res.script)) {
    res.isSegwit = true
  }
  return res
}

function getSignersFromHD (inputIndex, inputs, hdKeyPair) {
  const input = utils_1.checkForInput(inputs, inputIndex)
  if (!input.bip32Derivation || input.bip32Derivation.length === 0) {
    throw new Error('Need bip32Derivation to sign with HD')
  }
  const myDerivations = input.bip32Derivation
    .map(bipDv => {
      if (bipDv.masterFingerprint.equals(hdKeyPair.fingerprint)) {
        return bipDv
      } else {
        return
      }
    })
    .filter(v => !!v)
  if (myDerivations.length === 0) {
    throw new Error(
      'Need one bip32Derivation masterFingerprint to match the HDSigner fingerprint',
    )
  }
  const signers = myDerivations.map(bipDv => {
    const node = hdKeyPair.derivePath(bipDv.path)
    if (!bipDv.pubkey.equals(node.publicKey)) {
      throw new Error('pubkey did not match bip32Derivation')
    }
    return node
  })
  return signers
}

function getSortedSigs (script, partialSig) {
  const p2ms = payments.p2ms({ output: script })
  // for each pubkey in order of p2ms script
  return p2ms.pubkeys
    .map(pk => {
      // filter partialSig array by pubkey being equal
      return (
        partialSig.filter(ps => {
          return ps.pubkey.equals(pk)
        })[0] || {}
      ).signature
      // Any pubkey without a match will return undefined
      // this last filter removes all the undefined items in the array.
    })
    .filter(v => !!v)
}

function scriptWitnessToWitnessStack (buffer) {
  let offset = 0

  function readSlice (n) {
    offset += n
    return buffer.slice(offset - n, offset)
  }

  function readVarInt () {
    const vi = varuint.decode(buffer, offset)
    offset += varuint.decode.bytes
    return vi
  }

  function readVarSlice () {
    return readSlice(readVarInt())
  }

  function readVector () {
    const count = readVarInt()
    const vector = []
    for (let i = 0; i < count; i++) vector.push(readVarSlice())
    return vector
  }

  return readVector()
}

function sighashTypeToString (sighashType) {
  let text =
    sighashType & FloTransaction.SIGHASH_ANYONECANPAY
      ? 'SIGHASH_ANYONECANPAY | '
      : ''
  const sigMod = sighashType & 0x1f
  switch (sigMod) {
    case FloTransaction.SIGHASH_ALL:
      text += 'SIGHASH_ALL'
      break
    case FloTransaction.SIGHASH_SINGLE:
      text += 'SIGHASH_SINGLE'
      break
    case FloTransaction.SIGHASH_NONE:
      text += 'SIGHASH_NONE'
      break
  }
  return text
}

function witnessStackToScriptWitness (witness) {
  let buffer = Buffer.allocUnsafe(0)

  function writeSlice (slice) {
    buffer = Buffer.concat([buffer, Buffer.from(slice)])
  }

  function writeVarInt (i) {
    const currentLen = buffer.length
    const varintLen = varuint.encodingLength(i)
    buffer = Buffer.concat([buffer, Buffer.allocUnsafe(varintLen)])
    varuint.encode(i, buffer, currentLen)
  }

  function writeVarSlice (slice) {
    writeVarInt(slice.length)
    writeSlice(slice)
  }

  function writeVector (vector) {
    writeVarInt(vector.length)
    vector.forEach(writeVarSlice)
  }

  writeVector(witness)
  return buffer
}

function addNonWitnessTxCache (cache, input, inputIndex) {
  cache.__NON_WITNESS_UTXO_BUF_CACHE[inputIndex] = input.nonWitnessUtxo
  const tx = FloTransaction.fromBuffer(input.nonWitnessUtxo)
  cache.__NON_WITNESS_UTXO_TX_CACHE[inputIndex] = tx
  const self = cache
  const selfIndex = inputIndex
  delete input.nonWitnessUtxo
  Object.defineProperty(input, 'nonWitnessUtxo', {
    enumerable: true,
    get () {
      const buf = self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex]
      const txCache = self.__NON_WITNESS_UTXO_TX_CACHE[selfIndex]
      if (buf !== undefined) {
        return buf
      } else {
        const newBuf = txCache.toBuffer()
        self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = newBuf
        return newBuf
      }
    },
    set (data) {
      self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = data
    },
  })
}

function inputFinalizeGetAmts (inputs, tx, cache, mustFinalize) {
  let inputAmount = 0
  inputs.forEach((input, idx) => {
    if (mustFinalize && input.finalScriptSig)
      tx.ins[idx].script = input.finalScriptSig
    if (mustFinalize && input.finalScriptWitness) {
      tx.ins[idx].witness = scriptWitnessToWitnessStack(
        input.finalScriptWitness,
      )
    }
    if (input.witnessUtxo) {
      inputAmount += input.witnessUtxo.value
    } else if (input.nonWitnessUtxo) {
      const nwTx = nonWitnessUtxoTxFromCache(cache, input, idx)
      const vout = tx.ins[idx].index
      const out = nwTx.outs[vout]
      inputAmount += out.value
    }
  })
  const outputAmount = tx.outs.reduce((total, o) => total + o.value, 0)
  const fee = inputAmount - outputAmount
  if (fee < 0) {
    throw new Error('Outputs are spending more than Inputs')
  }
  const bytes = tx.virtualSize()
  cache.__FEE = fee
  cache.__EXTRACTED_TX = tx
  cache.__FEE_RATE = Math.floor(fee / bytes)
}

function nonWitnessUtxoTxFromCache (cache, input, inputIndex) {
  const c = cache.__NON_WITNESS_UTXO_TX_CACHE
  if (!c[inputIndex]) {
    addNonWitnessTxCache(cache, input, inputIndex)
  }
  return c[inputIndex]
}

function classifyScript (script) {
  if (isP2WPKH(script)) return 'witnesspubkeyhash'
  if (isP2PKH(script)) return 'pubkeyhash'
  if (isP2MS(script)) return 'multisig'
  if (isP2PK(script)) return 'pubkey'
  return 'nonstandard'
}

function range (n) {
  return [...Array(n).keys()]
}

exports.FloPsbt = FloPsbt
exports.FloTransaction = FloTransaction
exports.FloPsbtTransaction = FloPsbtTransaction
