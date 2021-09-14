import FungibleToken from 0xFungibleToken
import REVV from 0xREVV
transaction {
    let revvVaultRef: &{FungibleToken.Provider}
    prepare(authAccount: AuthAccount) {
        self.revvVaultRef = authAccount.borrow<&{FungibleToken.Provider}>(from: REVV.RevvVaultStoragePath)!
    }
    execute {
        let temp <- self.revvVaultRef.withdraw(amount: 10.0 as UFix64)
        REVV.depositToEscrow(from: <- temp)
    }
}