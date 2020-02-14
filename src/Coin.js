import * as bip32 from 'bip32'
import EventEmitter from 'eventemitter3'

import Account from './Account'
import TransactionBuilder from './TransactionBuilder'

const COIN_START = 0x80000000

/**
 * Manage Accounts for a specific Coin
 */
class Coin {
  /**
   * Create a new Coin object to interact with Accounts and Chains for that coin. This spawns a BIP44 compatible wallet.
   *
   * ##### Examples
   * Create a new Coin using a specified seed.
   *```
   *import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
   *```
   * Create a new Coin using a specified seed, don't auto discover.
   *```
   *import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin, false)
   *```
   * @param  {string} node - BIP32 Node already derived to m/44'
   * @param  {CoinInfo} coin - The CoinInfo containing network & version variables
   * @param  {Object} [options] - The Options for spawning the Coin
   * @param  {boolean} [options.discover=true] - Should the Coin auto-discover Accounts and Chains
   * @param  {Object} [options.serializedData] - The Data to de-serialize from
   * @return {Coin}
   */
  constructor (node, coin, options) {
    if (typeof node === 'string') { this.seed = node } else { this.seed = node.toBase58() }

    this.coin = coin

    this.discover = true

    if (options && options.discover !== undefined) { this.discover = options.discover }

    const purposeNode = bip32.fromBase58(this.seed)
    purposeNode.network = this.coin.network

    let bip44Num = this.coin.network.slip44

    // Check if we need to convert the hexa to the index
    if (bip44Num >= COIN_START) { bip44Num -= COIN_START }

    this.root = purposeNode.derivePath(bip44Num + "'")

    this.accounts = {}

    // Setup EventEmitter to notify when we have changed
    this.eventEmitter = new EventEmitter()

    if (options && options.serializedData) { this.deserialize(options.serializedData) }

    if (this.discover) {
      this.discoverAccounts()
    }
  }

  serialize () {
    const serializedAccounts = {}

    for (const accountNumber in this.accounts) {
      serializedAccounts[accountNumber] = this.accounts[accountNumber].serialize()
    }

    return {
      name: this.coin.name,
      network: this.coin.network,
      seed: this.seed,
      accounts: serializedAccounts
    }
  }

  deserialize (serializedData) {
    if (serializedData) {
      if (serializedData.accounts) {
        for (const accountNumber in serializedData.accounts) {
          if (!Object.prototype.hasOwnProperty.call(serializedData.accounts, accountNumber)) continue
          const accountMaster = bip32.fromBase58(serializedData.accounts[accountNumber].extendedPrivateKey, this.coin.network)

          this.accounts[accountNumber] = new Account(accountMaster, this.coin, {
            discover: false,
            serializedData: serializedData.accounts[accountNumber]
          })
        }
      }
    }
  }

  /**
   * Get the balance for the entire coin, or a specific address/array of addresses
   * @param  {Object} [options] - Specific options defining what balance to get back
   * @param {Boolean} [options.discover=true] - Should the Coin discover Accounts
   * @param {number|Array.<number>} [options.accounts=All Accounts in Coin] - Get Balance for defined Accounts
   * @param {string|Array.<string>} [options.addresses=All Addresses in each Account in Coin] - Get Balance for defined Addresses
   * @example <caption> Get Balance for entire Coin</caption>
   * import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
   * bitcoin.getBalance().then((balance) => {
   *    console.log(balance)
   * })
   * @return {Promise<number>} A Promise that will resolve to the balance of the entire Coin
   */
  async getBalance (options) {
    if (!options || (options && options.discover === undefined) || (options && options.discover === true)) {
      try {
        await this.discoverAccounts()
      } catch (e) { throw new Error('Unable to Discover Coin Accounts for getBalance! \n' + e) }
    }

    const accountsToSearch = []

    // Check if we are an array (ex. [0,1,2]) or just a number (ex. 1)
    if (options && Array.isArray(options.accounts)) {
      for (const accNum of options.accounts) {
        if (!isNaN(accNum)) {
          accountsToSearch.push(accNum)
        }
      }
    } else if (options && !isNaN(options.accounts)) {
      accountsToSearch.push(options.accounts)
    } else {
      for (const accNum in this.accounts) {
        accountsToSearch.push(accNum)
      }
    }

    let totalBalance = 0

    let addrsToSearch

    if (options && options.addresses && (typeof options.addresses === 'string' || Array.isArray(options.addresses))) {
      addrsToSearch = options.addresses
    }

    for (const accNum of accountsToSearch) {
      if (this.accounts[accNum]) {
        try {
          const balanceRes = await this.accounts[accNum].getBalance({
            discover: false,
            addresses: addrsToSearch,
            id: accNum
          })

          totalBalance += balanceRes.balance
        } catch (e) { throw new Error('Unable to get Coin balance! \n' + e) }
      }
    }

    return totalBalance
  }

  /**
   * Get a specific Address
   * @param  {number} [accountNumber=0] - Number of the account you wish to get the Address from
   * @param  {number} [chainNumber=0] - Number of the Chain you wish to get the Address from
   * @param  {number} [addressIndex=0] - Index of the Address you wish to get
   * @return {Address}
   */
  getAddress (accountNumber, chainNumber, addressIndex) {
    return this.getAccount(accountNumber || 0).getAddress(chainNumber, addressIndex)
  }

  /**
   * Get the Main Address for a specific Account number.
   * This is the Address at index 0 on the External Chain of the Account.
   * @param  {number} [accountNumber=0] - Number of the Account you wish to get
   * @example <caption>Get Main Address for Coin</caption>
   * import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
   * let mainAddress = bitcoin.getMainAddress()
   * @example <caption>Get Main Address for Account #1 on Coin</caption>
   * import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
   * let mainAddress = bitcoin.getMainAddress(1)
   * @return {Address}
   */
  getMainAddress (accountNumber) {
    return this.getAccount(accountNumber || 0).getMainAddress()
  }

  /**
   * Send a Payment to specified Addresses and Amounts
   * @param  {Object} options - the options for the specific transaction being sent
   * @param {OutputAddress|Array.<OutputAddress>} options.to - Define outputs for the Payment
   * @param {string|Array.<string>} [options.from=All Addresses in Coin] - Define what public address(es) you wish to send from
   * @param {number|Array.<number>} [options.fromAccounts=All Accounts in Coin] - Define what Accounts you wish to send from
   * @param {Boolean} [options.discover=true] - Should discovery happen before sending payment
   * @param {string} [options.floData=""] - Flo data to attach to the transaction
   * @return {Promise<string>} - Returns a promise that will resolve to the success TXID
   */
  sendPayment (options) {
    return new Promise((resolve, reject) => {
      if (!options) { reject(new Error('You must define your payment options!')) }

      const processPayment = () => {
        let sendFrom = []

        let allAddresses = []

        // Add all Addresses from selected accounts to array
        for (const account in this.accounts) {
          // Check if we are defining what accounts to send the payment from
          if (options.fromAccounts) {
            // Check if it is a single account number, or an array of account numbers
            if (typeof options.fromAccounts === 'number') {
              // If we match the passed account number, set the grabbed addresses
              if (options.fromAccounts === parseInt(account)) {
                allAddresses = this.accounts[account].getAddresses()
              }
            } else if (Array.isArray(options.fromAccounts)) {
              // If we are an array, iterate through
              for (const acs of options.fromAccounts) {
                if (acs === parseInt(account)) {
                  allAddresses = allAddresses.concat(this.accounts[account].getAddresses())
                }
              }
            }
          } else {
            allAddresses = allAddresses.concat(this.accounts[account].getAddresses())
          }
        }

        // Check if we define what address we wish to send from
        if (options.from) {
          // Check if it is a single from address or an array
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
          sendFrom = allAddresses
        }

        if (sendFrom.length === 0) {
          reject(new Error('No Addresses match defined options.from Addresses!'))
          return
        }

        const newOpts = options

        newOpts.from = sendFrom

        const txb = new TransactionBuilder(this.coin, newOpts)
        txb.sendTX().then(resolve).catch(reject)
      }

      if (options.discover === false) {
        processPayment()
      } else {
        this.discoverAccounts().then(processPayment).catch(reject)
      }
    })
  }

  /**
   * Get the Extended Private Key for the root path. This is derived at m/44'/coinType'
   * @example <caption>Get the Extended Private Key for the entire Coin</caption>
   * import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
   * let extPrivateKey = bitcoin.getExtendedPrivateKey()
   * // extPrivateKey = xprv9x8MQtHNRrGgrnWPkUxjUC57DWKgkjobwAYUFedxVa2FAA5qaQuGqLkJnVcszqomTar51PCR8JiKnGGgzK9eJKGjbpUirKPVHxH2PU2Rc93
   * @return {string} The Extended Private Key
   */
  getExtendedPrivateKey () {
    return this.root.toBase58()
  }

  /**
   * Get the Neutered Extended Public Key for the root path. This is derived at m/44'/coinType'
   * @example <caption>Get the Extended Private Key for the entire Coin</caption>
   * import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
   * let extPublicKey = bitcoin.getExtendedPrivateKey()
   * // extPublicKey = xpub6B7hpPpGGDpz5GarrWVjqL1qmYABACXTJPU5433a3uZE2xQz7xDXP94ndkjrxogjordTDSDaHY4i5G4HqRH6E9FJZk2F4ED4cbnprW2Vm9v
   * @return {string} The Extended Public Key
   */
  getExtendedPublicKey () {
    return this.root.neutered().toBase58()
  }

  /**
   * Get the Account at the specified number
   * @param  {number} [accountNumber=0]
   * @example <caption>Get Default Account</caption>
   * import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
   * let account = bitcoin.getAccount()
   * @example <caption>Get Account #1</caption>
   * import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
   * let account = bitcoin.getAccount(1)
   * @return {Account}
   */
  getAccount (accountNumber) {
    let num = accountNumber || 0

    if (typeof accountNumber === 'string' && !isNaN(parseInt(accountNumber))) { num = parseInt(accountNumber) }

    if (!this.accounts[num]) { return this.addAccount(num) }

    return this.accounts[num]
  }

  /**
   * Get all Accounts on the Coin
   * @example
   * import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
   * let accounts = bitcoin.getAccounts()
   * // accounts = {
   * //   0: Account,
   * //   1: Account
   * // }
   * @return {Object.<number, Account>} Returns a JSON object with accounts
   */
  getAccounts () {
    return this.accounts
  }

  /**
   * Add the Account at the specified number, if it already exists, it returns the Account.
   * If the Account does not exist, it will create it and then return it.
   * @param  {number} [accountNumber=0]
   * @param {Boolean} [discover=discover Set in Coin Constructor] - Should the Account start auto-discovery.
   * @example
   * import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
   * let account = bitcoin.addAccount(1)
   * @return {Account}
   */
  addAccount (accountNumber, discover) {
    let num = accountNumber || 0

    if (typeof accountNumber === 'string' && !isNaN(parseInt(accountNumber))) { num = parseInt(accountNumber) }

    // if the account has already been added, just return
    if (this.accounts[num]) { return this.getAccount(num) }

    const accountMaster = this.root.deriveHardened(num)

    let shouldDiscover

    if (discover !== undefined) { shouldDiscover = discover } else { shouldDiscover = this.discover }

    const account = new Account(accountMaster, this.coin, { discover: shouldDiscover })

    this.accounts[num] = account

    return this.getAccount(num)
  }

  /**
   * Get the CoinInfo for the Coin
   * @example
   * import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin)
   * let coinInfo = bitcoin.getCoinInfo()
   * // coinInfo = Networks.bitcoin
   * @return {CoinInfo}
   */
  getCoinInfo () {
    return this.coin
  }

  getHighestAccountNumber () {
    let highestAccountNumber = 0

    for (const accNum in this.accounts) {
      if (accNum > highestAccountNumber) { highestAccountNumber = accNum }
    }

    return parseInt(highestAccountNumber)
  }

  /**
   * Discover all Accounts for the Coin
   * @example
   * import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin, false)
   * bitcoin.discoverAccounts().then((accounts) => {
   *   console.log(accounts.length)
   * })
   * @return {Promise<Array.<Account>>} Returns a Promise that will resolve to an Array of Accounts once complete
   */
  async discoverAccounts () {
    // Reset the internal accounts
    this.accounts = {}

    // Get the Account #0 and start discovery there.
    try {
      await this.getAccount(0).discoverChains()
    } catch (e) { throw new Error('Unable to discoverAccounts! \n' + e) }

    while (this.accounts[this.getHighestAccountNumber()].getUsedAddresses().length > 0) {
      try {
        await this.getAccount(this.getHighestAccountNumber() + 1, false).discoverChains()
      } catch (e) { throw new Error('Unable to discover account #' + (this.getHighestAccountNumber() + 1) + '\n' + e) }
    }

    const discoveredAccounts = []

    for (const accNum in this.accounts) {
      discoveredAccounts.push(this.accounts[accNum])
    }

    this.SubscribeToAccountWebsocketUpdates()

    return discoveredAccounts
  }

  /**
   * Internal function used to subscribe to WebSocket updates for All Discovered Accounts
   */
  SubscribeToAccountWebsocketUpdates () {
    const accounts = this.getAccounts()

    for (const index in accounts) {
      if (!Object.prototype.hasOwnProperty.call(accounts, index)) continue
      accounts[index].onWebsocketUpdate(this.HandleWebsocketUpdate.bind(this))
    }
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
   * import { Coin, Networks } from 'oip-hdmw'
   *
   * let bitcoin = new Coin('00000000000000000000000000000000', Networks.bitcoin, false)
   *
   * bitcoin.onWebsocketUpdate((address) => {
   *     console.log(address.getPublicAddress() + " Received a Websocket Update!")
   * })
   */
  onWebsocketUpdate (subscriberFunction) {
    this.eventEmitter.on('websocketUpdate', subscriberFunction)
  }
}

module.exports = Coin
