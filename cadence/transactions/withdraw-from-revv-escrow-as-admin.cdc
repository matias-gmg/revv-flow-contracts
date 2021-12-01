import FungibleToken from 0xFungibleToken
import REVV from 0xREVV

transaction(recipient: Address, amount: UFix64) {
    
    let adminRef: &REVV.Admin
    let receiverVault: &REVV.Vault{FungibleToken.Receiver}

    prepare(authAccount: AuthAccount) {

        self.adminRef = authAccount.borrow<&REVV.Admin>(from: REVV.RevvAdminStoragePath)
        ?? panic("Could not borrow an admin reference")

        self.receiverVault = getAccount(recipient).getCapability(REVV.RevvReceiverPublicPath)!
        .borrow<&REVV.Vault{FungibleToken.Receiver}>() ?? panic("Could not borrow a reference to Receiver")
    }
    execute {
        // withdraw from escrow
        let tempVault <- REVV.withdrawFromEscrow(adminRef: self.adminRef, amount: amount);
        // deposit into account's REVV Vault
        self.receiverVault.deposit(from: <- tempVault) 
    }
}