import { Wallet } from '../src'

test('get flo change xpub', () => {
    let wallet = new Wallet('estate juice outdoor attract region can enroll flat split pledge decline price', {discover: false})
    console.log(wallet.getMnemonic())
    // const btc = wallet.getCoin('bitcoin')
    // let btcAccount = btc.getAccount(0)
    // let btcChange = btcAccount.account_master.derive(0)
    // console.log(btcChange.neutered().toBase58())

    const flo = wallet.getCoin('flo')
    const floAccount = flo.getAccount(0)
    // const addr = floAccount.getMainAddress().getPrivateAddress()
    // console.log(addr)
    let floChange = floAccount.account_master.derive(0)
    console.log(floChange.neutered().toBase58())
    // console.log(btc.getMainAddress().getPublicAddress())
    // console.log(flo.getExtendedPublicKey())
    // console.log(flo.getMainAddress().getPublicAddress())
})