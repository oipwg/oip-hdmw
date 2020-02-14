import bip32utils from '@oipwg/bip32-utils'
import EventEmitter from 'eventemitter3'

import Address from './Address'
import TransactionBuilder from './TransactionBuilder'
import { discovery } from './util'

// Class Constants
const GAP_LIMIT = 20

const CUSTOM_ADDRESS_FUNCTION = (node, network) => {
  return { address: node, network: network }
}

/**
 * A BIP32 Node that manages Derivation of Chains and Addresses. This is created from the [`bip32` npm package managed by `bitcoinjs`](https://github.com/bitcoinjs/bip32).
 * @typedef {Object} bip32
 * @example <caption>Spawn a Bitcoin bip32 Node</caption>
 * import * as bip32 from 'bip32';
 *
 * let bip32Node = bip32.fromBase58("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
 * @example <caption>Spawn a Flo bip32 Node</caption>
 * import * as bip32 from 'bip32';
 * import { Networks } from 'oip-hdmw';
 *
 * let bip32Node = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
 */

/**
 * A BIP32 Chain manager. This is created from the [`@oipwg/bip32-utils` npm package managed by `oipwg`](https://github.com/oipwg/bip32-utils).
 * @typedef {Object} bip32utilschain
 * @example
 * import * as bip32 from 'bip32';
 * import bip32utils from '@oipwg/bip32-utils';
 *
 * let bip32Node = bip32.fromBase58("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
 * let chain = new bip32utils.Chain(bip32Node)
 */

/**
 * Manages Chains and Addresses for a specific BIP32/BIP44 Account
 */
class Account {
  /**
   * Create a new Account to manage Chains and Addresses for based on a BIP32 Node
   *
   * ##### Examples
   * Create a Bitcoin Account
   * ```
   * import { Account, Networks } from 'oip-hdmw';
   *
   * let accountMaster = bip32.fromBase58("xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb")
   *
   * let account = new Account(accountMaster, Networks.bitcoin);
   * ```
   * Create a Flo Account
   * ```
   * import { Account, Networks } from 'oip-hdmw';
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo);
   * ```
   * @param  {bip32} accountMaster - The BIP32 Node to derive Chains and Addresses from.
   * @param  {CoinInfo} coin - The CoinInfo for the Account
   * @param {Object} [options] - The Options of the Account
   * @param  {boolean} [options.discover=true] - Should the Account auto-discover Chains and Addresses
   * @param {Object} [options.serializedData] - Serialized data to load the Account from
   * @return {Account}
   */
  constructor (accountMaster, coin, options) {
    this.accountMaster = accountMaster
    this.coin = coin || {}

    const external = this.accountMaster.derive(0)
    const internal = this.accountMaster.derive(1)

    this.account = new bip32utils.Account([
      new bip32utils.Chain(external, undefined, CUSTOM_ADDRESS_FUNCTION),
      new bip32utils.Chain(internal, undefined, CUSTOM_ADDRESS_FUNCTION)
    ])

    this.addresses = {}

    this.chains = {
      0: {
        index: 0,
        lastUpdate: 0
      },
      1: {
        index: 1,
        lastUpdate: 0
      }
    }

    // Setup EventEmitter to notify when we have changed
    this.eventEmitter = new EventEmitter()

    this.discover = true

    if (options && options.discover !== undefined) { this.discover = options.discover }

    // Discover both External and Internal chains
    if (options && options.serializedData) { this.deserialize(options.serializedData) }

    if (this.discover) {
      this.discoverChains()
    }
  }

  serialize () {
    const addresses = this.getAddresses()

    const serializedAddresses = addresses.map((address) => {
      return address.serialize()
    })

    return {
      extendedPrivateKey: this.getExtendedPrivateKey(),
      addresses: serializedAddresses,
      chains: this.chains
    }
  }

  deserialize (serializedData) {
    if (serializedData) {
      // Rehydrate Addresses
      if (serializedData.addresses) {
        const rehydratedAddresses = []

        for (const address of serializedData.addresses) {
          rehydratedAddresses.push(new Address(address.wif, this.coin, address))
        }

        for (const address of rehydratedAddresses) {
          this.addresses[address.getPublicAddress()] = address
        }
      }
      // Rehydrate Chain info
      if (serializedData.chains) {
        this.chains = serializedData.chains
      }
    }
  }

  /**
   * Get the Main Address for a specified Chain and Index on the Chain.
   * @param  {number}    [chainNumber=0] - Number of the specific chain you want to get the Main Address for
   * @param  {number} [mainAddressNumber=0] - Index of the Main Address on the specified chain
   * @example
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * let address = account.getMainAddress()
   * // address.getPublicAddress() = FPznv9i9iHX5vt4VMbH9x2LgUcrjtSn4cW
   * @return {Address}
   */
  getMainAddress (chainNumber, mainAddressNumber) {
    return this.getAddress(chainNumber, mainAddressNumber)
  }

  /**
   * Get the Address for a specified Chain and Index on the Chain.
   * @param  {number}    [chainNumber=0] - Number of the specific chain you want to get the Address from
   * @param  {number} [addressNumber=0] - Index of the Address on the specified chain
   * @example <caption>Get the address on Chain `0` at Index `10`</caption>
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * let address = account.getAddress(0, 10)
   * // address.getPublicAddress() = F8P6nUvDfcHikqdUnoQaGPBVxoMcUSpGDp
   * @return {Address}
   */
  getAddress (chainNumber, addressNumber) {
    const addr = CUSTOM_ADDRESS_FUNCTION(this.account.getChain(chainNumber || 0).__parent.derive(addressNumber || 0), this.coin.network)

    const tmpHydratedAddr = new Address(addr, this.coin, false)

    // Attempt to match to address that we already have
    if (this.addresses[tmpHydratedAddr.getPublicAddress()]) { return this.addresses[tmpHydratedAddr.getPublicAddress()] } else { this.addresses[tmpHydratedAddr.getPublicAddress()] = tmpHydratedAddr }

    return tmpHydratedAddr
  }

  /**
   * Get all derived Addresses for the entire Account, or just for a specific Chain.
   * @param  {number}    [chainNumber] - Number of the specific chain you want to get the Addresses from
   * @example <caption>Get all Addresses on the Account</caption>
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * let addresses = account.getAddresses()
   * // addresses = [Address, Address, Address]
   * @example <caption>Get the addresses on Chain `0`</caption>
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * let addresses = account.getAddresses(0)
   * // addresses = [Address, Address, Address]
   * @return {Array.<Address>}
   */
  getAddresses (chainNumber) {
    const addrs = []

    if (chainNumber && typeof chainNumber === 'number') {
      for (const addr in this.addresses) {
        const chain = this.account.getChain(chainNumber)
        const addresses = chain.addresses.map((ad) => {
          return new Address(ad, this.coin, false)
        })
        for (const adr of addresses) {
          if (adr.getPublicAddress() === this.addresses[addr].getPublicAddress()) {
            addrs.push(this.addresses[addr])
          }
        }
      }
    } else {
      for (const addr in this.addresses) {
        addrs.push(this.addresses[addr])
      }
    }

    return addrs
  }

  /**
   * Get all Used Addresses (addresses that have received at least 1 tx) for the entire Account, or just for a specific Chain.
   * @param  {number}    [chainNumber] - Number of the specific chain you want to get the Addresses from
   * @example <caption>Get all Used Addresses on the Account</caption>
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * let addresses = account.getUsedAddresses()
   * // addresses = [Address, Address, Address]
   * @example <caption>Get the addresses on Chain `0`</caption>
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * let addresses = account.getUsedAddresses(0)
   * // addresses = [Address, Address, Address]
   * @return {Array.<Address>}
   */
  getUsedAddresses (chainNumber) {
    const usedAddresses = []
    const allAddresses = this.getAddresses()

    for (const address of allAddresses) {
      if (address.getTotalReceived() > 0) { usedAddresses.push(address) }
    }

    return usedAddresses
  }

  /**
   * Get the Balance for the entire Account
   * @example
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * account.getBalance({ discover: true }).then((balance) => {
   *   console.log(balance);
   * })
   * @param {Object} [options] Specific options defining what balance to get back
   * @param {Boolean} [options.discover=true] - Should the Account discover Chains and Addresses
   * @param {string|Array.<string>} [options.addresses] - Address, or Addresses to get the balance of
   * @param {number} [options.id] - The ID number to return when the Promise resolves
   * @return {Promise<number>} - Returns a Promise that will resolve to the total balance.
   */
  async getBalance (options) {
    let discover = this.discover

    if (options && options.discover !== undefined) { discover = options.discover }

    if (discover) {
      try {
        await this.discoverChains()
      } catch (e) {
        throw new Error('Unable to discover Account Chains in Account getBalance! \n' + e)
      }
    }

    let totalBal = 0

    // Iterate through each of the addresses we have found
    for (const addr in this.addresses) {
      // Are we searching only for a single addresses balance?
      if (options && options.addresses && typeof options.addresses === 'string') {
        if (addr === options.addresses) {
          totalBal += this.addresses[addr].getBalance()
        }
        // Are we searching for only the addresses in an array?
      } else if (options && options.addresses && Array.isArray(options.addresses)) {
        for (const ad of options.addresses) {
          if (addr === ad) {
            totalBal += this.addresses[addr].getBalance()
          }
        }
        // If not the first two, then just add them all up :)
      } else {
        totalBal += this.addresses[addr].getBalance()
      }
    }

    const balanceData = {
      balance: totalBal
    }

    if (options && options.id) { balanceData.id = options.id }

    return balanceData
  }

  /**
   * Get the Next Chain Address for a specified chain
   * @param  {number} [chainNumber=0] - The specific chain that you want to get the next address from
   * @example <caption>Get the next Chain Address on Chain #1</caption>
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * let address = account.getNextChainAddress(1)
   * @return {Address}
   */
  getNextChainAddress (chainNumber) {
    return new Address(this.account.getChain(chainNumber || 0).next(), this.coin, false)
  }

  /**
   * Get the Next Change Address from the "Internal" chain
   * @example
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * let address = account.getNextChangeAddress()
   * @return {Address}
   */
  getNextChangeAddress () {
    // We use Chain 1 since that is the "Internal" chain used for generating change addresses.
    return this.getNextChainAddress(1)
  }

  /**
   * Send a Payment to specified Addresses and Amounts
   * @param  {Object} options - the options for the specific transaction being sent
   * @param {OutputAddress|Array.<OutputAddress>} options.to - Define outputs for the Payment
   * @param {string|Array.<string>} [options.from=All Addresses in Account] - Define what public address(es) you wish to send from
   * @param {Boolean} [options.discover=true] - Should discovery happen before sending payment
   * @param {string} [options.floData=""] - Flo data to attach to the transaction
   * @return {Promise<string>} - Returns a promise that will resolve to the success TXID
   */
  sendPayment (options) {
    return new Promise((resolve, reject) => {
      if (!options) { reject(new Error('You must define your payment options!')) }

      const processPayment = () => {
        const sendFrom = []

        const allAddresses = this.getAddresses()

        // Check if we define what address we wish to send from
        if (options.from) {
          if (typeof options.from === 'string') {
            for (const address of allAddresses) {
              if (address.getPublicAddress() === options.from) {
                sendFrom.push(address)
              }
            }
          } else if (Array.isArray(options.from)) {
            for (const adr of options.from) {
              for (const address of allAddresses) {
                if (address.getPublicAddress() === adr) {
                  sendFrom.push(address)
                }
              }
            }
          }
          // else add all the addresses on the Account that have received any txs
        } else {
          for (const address of allAddresses) {
            if (address.getBalance() >= 0) {
              sendFrom.push(address)
            }
          }
        }

        if (sendFrom.length === 0) {
          reject(new Error('No Addresses match defined options.from Addresses!'))
          return
        }

        const newOpts = options

        newOpts.from = sendFrom

        const txb = new TransactionBuilder(this.coin, newOpts)

        txb.sendTX().then(resolve)
      }

      if (options.discover === false) {
        processPayment()
      } else {
        this.discoverChains().then(processPayment)
      }
    })
  }

  /**
   * Get the Extended Private Key for the Account
   * @example
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * let extPrivateKey = account.getExtendedPrivateKey()
   * // extPrivateKey = Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC
   * @return {string}
   */
  getExtendedPrivateKey () {
    return this.accountMaster.toBase58()
  }

  /**
   * Get the Extended Public Key for the Account
   * @example
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * let extPublicKey = account.getExtendedPublicKey()
   * // extPublicKey = Fpub1BPo8vEQqDkoDQmDqcJ8WFHD331AMpd7VU7atCJsix8xbHwN6K9wfDLjZKnW9fUw5uJg8UJMLhQ5W7gTxv6DbkfPoeJbBpMaUHrULxzVnSy
   * @return {string}
   */
  getExtendedPublicKey () {
    return this.accountMaster.neutered().toBase58()
  }

  /**
   * Get the specified Chain number
   * @param {number} chainNumber - The number of the chain you are requesting
   * @example <caption>Get Chain 0</caption>
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * let chain = account.getChain(0)
   * @return {bip32utilschain}
   */
  getChain (chainNumber) {
    return this.account.getChain(chainNumber)
  }

  async DiscoverChain (chainNumber, gapLimit) {
    const chains = this.account.getChains()
    const chain = chains[chainNumber].clone()

    let discovered

    try {
      discovered = await discovery(chain, gapLimit, this.ChainPromise, chainNumber, this.coin)
    } catch (e) {
      throw new Error('Discovery error in DiscoverChain #' + chainNumber + ' \n' + e)
    }

    // throw away EACH unused address AFTER the last unused address
    const unused = discovered.checked - discovered.used
    for (let j = 1; j < unused; ++j) chain.pop()

    // override the internal chain
    this.account.chains[discovered.chainIndex] = chain

    for (const address of discovered.addresses) { this.addresses[address.getPublicAddress()] = address }

    return discovered
  }

  async ChainPromise (addresses, coin) {
    const results = {}
    const allAddresses = []

    const addressPromises = []

    for (const addr of addresses) {
      const address = new Address(addr, coin, false)

      const addressUpdatePromise = address.updateState()

      // This will only be called for any rejections AFTER the first one,
      // please take a look at the comment below for more info.
      addressUpdatePromise.catch((e) => { console.warn(`An Address Discovery Promise failed during Account Discovery! ${e}\n${e.stack}`) })

      addressPromises.push(addressUpdatePromise)
    }

    let promiseResponses = []

    try {
      promiseResponses = await Promise.all(addressPromises)
    } catch (e) {
      // This will still be called even though we use prom.catch() above.
      // The first promise rejection will be caught here, all other promises
      // that reject AFTER the first, will be caught in the above prom.catch() function.

      throw new Error(`Account Discovery failure in ChainPromise! ${e}\n${e.stack}`)
    }

    for (const address of promiseResponses) {
      if (address.getTotalReceived() > 0) {
        results[address.getPublicAddress()] = true
      } else {
        results[address.getPublicAddress()] = false
      }

      // Store all addresses
      allAddresses.push(address)
    }

    return { results: results, addresses: allAddresses }
  }

  /**
   * Discover Used and Unused addresses for a specified Chain number
   * @param  {number} chainNumber - The number of the chain you wish to discover
   * @example <caption>Discover Chain 0</caption>
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * account.discoverChain(0).then((acc) => {
   *   console.log(acc.getChain(0).addresses)
   * })
   * @return {Promise<Account>} - A Promise that once finished will resolve to the Account (now with discovery done)
   */
  async discoverChain (chainNumber) {
    try {
      await this.DiscoverChain(chainNumber, GAP_LIMIT)
    } catch (e) {
      throw new Error('Unable to discoverChain #' + chainNumber + '! \n' + e)
    }

    this.chains[chainNumber] = { lastUpdate: Date.now() }

    return this
  }

  /**
   * Discover all Chains
   * @example
   * import * as bip32 from 'bip32'
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   * account.discoverChains().then((acc) => {
   *   console.log(acc.getChain(0).addresses)
   *   console.log(acc.getChain(1).addresses)
   * })
   * @return {Promise<Account>} - A Promise that once finished will resolve to the Account (now with discovery done)
   */
  async discoverChains () {
    const chainsToDiscover = [0, 1]

    let account

    // Do each chain one at a time in case it crashes and errors out.
    for (const c of chainsToDiscover) {
      try {
        account = await this.discoverChain(c)
      } catch (e) {
        throw new Error('Unable to discoverChains! \n' + e)
      }
    }

    this.SubscribeToAddressWebsocketUpdates()

    return account
  }

  /**
   * Internal function used to subscribe to WebSocket updates for All Discovered Addresses
   */
  SubscribeToAddressWebsocketUpdates () {
    const allAddresses = this.getAddresses()

    for (const address of allAddresses) { address.onWebsocketUpdate(this.HandleWebsocketUpdate.bind(this)) }
  }

  /**
   * Internal function used to process Address updates streaming in from Websockets,
   * emits an update that can be subscribed to with onWebsocketUpdate
   * @param  {Object} update - Websocket Update Data
   */
  HandleWebsocketUpdate (update) {
    this.eventEmitter.emit('websocketUpdate', update)
  }

  /**
   * Subscribe to events that are emitted when an Address update is received via Websocket
   * @param  {function} subscriberFunction - The function you want called when there is an update
   *
   * @example
   * import { Account, Networks } from 'oip-hdmw'
   *
   * let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
   *
   * let account = new Account(accountMaster, Networks.flo, false);
   *
   * account.onWebsocketUpdate((address) => {
   *     console.log(address.getPublicAddress() + " Received a Websocket Update!")
   * })
   */
  onWebsocketUpdate (subscriberFunction) {
    this.eventEmitter.on('websocketUpdate', subscriberFunction)
  }
}

module.exports = Account
