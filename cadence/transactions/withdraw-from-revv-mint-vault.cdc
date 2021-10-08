import FungibleToken from 0xFungibleToken
import REVV from 0xREVV

transaction(recipient: Address, amount: UFix64) {
    let mintVault:&FungibleToken.Vault
    let receiverVault:&REVV.Vault{FungibleToken.Receiver}
    prepare(authAccount: AuthAccount) {
        self.mintVault = authAccount.borrow<&FungibleToken.Vault>(from: REVV.RevvVaultStoragePath)!
        self.receiverVault = getAccount(recipient).getCapability(REVV.RevvReceiverPublicPath)!
            .borrow<&REVV.Vault{FungibleToken.Receiver}>() ?? panic("Could not borrow a reference to Receiver")
    }
    execute {
        let tempVault <- self.mintVault.withdraw(amount: amount)
        self.receiverVault.deposit(from: <- tempVault)    
    }
}