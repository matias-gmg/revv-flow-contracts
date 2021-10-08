import REVV from 0xREVV
import FungibleToken from 0xFungibleToken

transaction(address: Address) {
    prepare(authAccount: AuthAccount) {
        let cap = getAccount(address).getCapability<&{FungibleToken.Provider}>(REVV.RevvReceiverPublicPath)
        let vault = cap.borrow()!
        let temp <- vault.withdraw(amount: 1.0 as UFix64)  // hardcoded amount for testing fail scenario
        destroy temp
    }
    execute {

    }
}