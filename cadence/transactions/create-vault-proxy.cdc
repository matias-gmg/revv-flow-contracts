import REVVVaultAccess from 0xREVVVaultAccess

transaction {
    let authAccount: AuthAccount
    prepare(acct: AuthAccount) {
        self.authAccount = acct;
    }
    execute {
        let vaultProxy <- REVVVaultAccess.createVaultProxy()
        self.authAccount.save(<- vaultProxy, to: REVVVaultAccess.VaultProxyStoragePath)
        self.authAccount.link<&REVVVaultAccess.VaultProxy{REVVVaultAccess.VaultProxyPublic}>(REVVVaultAccess.VaultProxyPublicPath, target: REVVVaultAccess.VaultProxyStoragePath)
    }
}