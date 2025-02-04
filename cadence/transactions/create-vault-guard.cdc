import REVVVaultAccess from 0xREVVVaultAccess

transaction(maxAmount: UFix64, vaultProxyAddress: Address) {
    let adminRef: &REVVVaultAccess.Admin
    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&REVVVaultAccess.Admin>(from: REVVVaultAccess.AdminStoragePath)!        
    }
    execute {
        REVVVaultAccess.createVaultGuard(
            adminRef: self.adminRef, 
            vaultProxyAddress: vaultProxyAddress, 
            maxAmount: maxAmount, 
            guardStoragePath: /storage/revvVaultGuard_01,  // new path for every guard. Cadence / fcl doesn't support passing in Paths as arguments from fcl.
            guardPrivatePath: /private/revvVaultGuard_01   // new path for every gaurd
        )
    }
}