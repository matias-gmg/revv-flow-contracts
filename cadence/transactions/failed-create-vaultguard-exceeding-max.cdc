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
            guardStoragePath: /storage/revvVaultGuard_02, 
            guardPrivatePath: /private/revvVaultGuard_02   
        )
    }
}