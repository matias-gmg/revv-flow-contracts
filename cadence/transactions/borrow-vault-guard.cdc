import REVVVaultAccess from 0xREVVVaultAccess

transaction {
    let vaultGuardRef:&REVVVaultAccess.VaultGuard
    prepare(acct: AuthAccount) {
        let privatePath = /private/revvVaultGuard_01
        let vaultGuardCap = acct.getCapability<&REVVVaultAccess.VaultGuard>(privatePath)!
        self.vaultGuardRef = vaultGuardCap.borrow()!
    }
    execute {
       // no action here. This tx just to test reference can be accessed.
    }
}