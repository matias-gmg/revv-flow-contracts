import REVVVaultAccess from 0xREVVVaultAccess

transaction(vaultProxyAddress: Address, maxAmount: UFix64) {

    let adminRef: &REVVVaultAccess.Admin
    let guardStoragePath: StoragePath
    let guardPrivatePath: PrivatePath

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&REVVVaultAccess.Admin>(from: REVVVaultAccess.AdminStoragePath)!

        self.guardStoragePath = /storage/revvVaultGuard_01  // new path for every guard
        self.guardPrivatePath = /private/revvVaultGuard_01 // new path for every gaurd
    }
    execute {
        REVVVaultAccess.createVaultGuard(adminRef: self.adminRef, vaultProxyAddress: vaultProxyAddress, maxAmount: maxAmount, guardStoragePath: self.guardStoragePath, guardPrivatePath: self.guardPrivatePath)
    }
}