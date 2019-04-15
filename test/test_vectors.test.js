/* eslint-env jest */
import Wallet from '../src/Wallet'

describe('Test vector 1', () => {
  test('Chain m', () => {
    let w = new Wallet(Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex'), { discover: false })

    expect(w.master_node.toBase58()).toBe('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi')
  })
})

// These test vectors generated at: https://iancoleman.io/bip39/
describe('BIP44 Test Vectors', () => {
  let w = new Wallet('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', { discover: false })

  test('BIP32 Root Key', () => {
    expect(w.master_node.toBase58()).toBe('xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu')
  })
  test('Bitcoin', () => {
    let bitcoin = w.getCoin('bitcoin')
    let a_zero = bitcoin.getAccount(0)
    expect(a_zero.account_master.toBase58()).toBe('xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb')

    expect(a_zero.account.chains[0].__parent.toBase58()).toBe('xprvA1Lvv1qpvx3f8iuRHfaEG45fyvDc3h7Ur5afz5SyRfkAsZ2765KfFfmg6Q9oEJDgf4UdYHphzzJybLykZfznUMKL2KNUU8pLRQgstN5kmFe')

    expect(a_zero.getAddress(0, 0).getPublicAddress()).toBe('1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA')
    expect(a_zero.getAddress(0, 0).getPrivateAddress()).toBe('L4p2b9VAf8k5aUahF1JCJUzZkgNEAqLfq8DDdQiyAprQAKSbu8hf')

    expect(a_zero.getAddress(0, 1).getPublicAddress()).toBe('1Ak8PffB2meyfYnbXZR9EGfLfFZVpzJvQP')
    expect(a_zero.getAddress(0, 1).getPrivateAddress()).toBe('KzJgGiEeGUVWmPR97pVWDnCVraZvM2fnrCVrg2irV4353HciE6Un')

    expect(a_zero.getAddress(0, 2).getPublicAddress()).toBe('1MNF5RSaabFwcbtJirJwKnDytsXXEsVsNb')
    expect(a_zero.getAddress(0, 2).getPrivateAddress()).toBe('L4BL9ZGzuQJFoRqGfjsgHeYzD1C72y2VmJaY6sqdtaRkfxUFrJXu')

    expect(a_zero.getAddress(0, 3).getPublicAddress()).toBe('1MVGa13XFvvpKGZdX389iU8b3qwtmAyrsJ')
    expect(a_zero.getAddress(0, 3).getPrivateAddress()).toBe('Kzj5uojwkWiBXY5TBxuYZYuDhYnWnHh9rjBz2j8j2kpBXYEoT4Kk')

    expect(a_zero.getAddress(0, 4).getPublicAddress()).toBe('1Gka4JdwhLxRwXaC6oLNH4YuEogeeSwqW7')
    expect(a_zero.getAddress(0, 4).getPrivateAddress()).toBe('KyDaMAANJW6LfNvATYzYnAaoE5EUaHUZ2pyUziQSeBumkDkKNcpC')
  })

  test('Litecoin', () => {
    let litecoin = w.getCoin('litecoin')
    let a_zero = litecoin.getAccount(0)
    expect(a_zero.account_master.toBase58()).toBe('Ltpv7735AbcbmL1gbgDWj2ezvs59rh4RM1oTN2BKTKbfe3146FCPCNFbBBSWfuV9vCJNMXD9LuHpQnqVWpn2hbMhikqPdoGqbS3ptdPoNWEvvgR')

    expect(a_zero.account.chains[0].__parent.toBase58()).toBe('Ltpv7APhV388fzWLjCMFhZdJ4LuH467JCW5wVZUTYLz9RKvhknSMYVfmEbhycmWcZANDQAFLwURBT8Hyxr5yAYj7VTFpdurJmXBkr4FEKVQPVMv')

    expect(a_zero.getAddress(0, 0).getPublicAddress()).toBe('LUWPbpM43E2p7ZSh8cyTBEkvpHmr3cB8Ez')
    expect(a_zero.getAddress(0, 0).getPrivateAddress()).toBe('T5b4RiWRs7XG8xZ2bCHBoJcn4JrpMTbGRFYXgoZHd7nD8izwqhMK')

    expect(a_zero.getAddress(0, 1).getPublicAddress()).toBe('Ldatw8ZjgMGNUo5HMN6RgCrjmh7q494Si3')
    expect(a_zero.getAddress(0, 1).getPrivateAddress()).toBe('T4QBn73zHJgjKQ6cFGBqfiz52rHs4UYJHrhVRBdCzSepMjb9stje')

    expect(a_zero.getAddress(0, 2).getPublicAddress()).toBe('LX4YojYdeBk3TtUcryCcgAqYxjicKfK7AD')
    expect(a_zero.getAddress(0, 2).getPrivateAddress()).toBe('T8p29oRNZpvaE1QbpQ2Fr3kQcrgfzT9KjvzwapwgsqBdMotY6kQW')

    expect(a_zero.getAddress(0, 3).getPublicAddress()).toBe('LgbbqoBcNc8voAvrrk3ZyqCU3Y4H24aauc')
    expect(a_zero.getAddress(0, 3).getPrivateAddress()).toBe('TAmkryn9J21FDTd7X8sdekLkg9s3R6hKeVix1DDcTaHN8NeVDzUK')

    expect(a_zero.getAddress(0, 4).getPublicAddress()).toBe('LiNDwbwBhX9djY7tb3gWvrXjuWQNerLjnP')
    expect(a_zero.getAddress(0, 4).getPrivateAddress()).toBe('TAZvHfx7H1pBm7KhNv4cUdq4mckYQypuHiBA77TASJ2E64duinTC')
  })
})
