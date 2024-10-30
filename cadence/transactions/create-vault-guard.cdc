import "REVVVaultAccess"

transaction(maxAmount: UFix64, vaultProxyAddress: Address) {
    let adminRef: &REVVVaultAccess.Admin
    prepare(acct: auth(BorrowValue) &Account) {
        self.adminRef = acct.storage.borrow<&REVVVaultAccess.Admin>(from: REVVVaultAccess.AdminStoragePath)!        
    }
    execute {
        REVVVaultAccess.createVaultGuard(
            adminRef: self.adminRef, 
            vaultProxyAddress: vaultProxyAddress, 
            maxAmount: maxAmount, 
            guardStoragePath: /storage/revvVaultGuard_03,  // new path for every guard. Cadence / fcl doesn't support passing in Paths as arguments from fcl.
            guardPrivatePath: /private/revvVaultGuard_03,  // new path for every gaurd
            guardWithdrawPath: /storage/revvVaultGuard_03Provider // new path
        )
    }
}