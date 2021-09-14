import REVVVaultAccess from 0xREVVVaultAccess

transaction {
    let vaultGuardRef:&REVVVaultAccess.VaultGuard
    prepare(acct: AuthAccount) {
        let privatePath = /private/revvVaultGuard_01
        let vaultGuardCap = acct.getCapability<&REVVVaultAccess.VaultGuard>(privatePath)!
        self.vaultGuardRef = vaultGuardCap.borrow()!
    }
    execute {
        // Test to withdraw. Hardcoded amouny and burning for testing only
        let tempVault <- self.vaultGuardRef.withdraw(amount: 1.0)
        destroy tempVault
    }
}