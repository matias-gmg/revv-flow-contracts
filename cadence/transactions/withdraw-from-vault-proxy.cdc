import REVV from 0xREVV
import REVVVaultAccess from 0xREVVVaultAccess

transaction(amount: UFix64) {
    let vaultProxyRef: &REVVVaultAccess.VaultProxy
    let ownedRevvVaultRef: &REVV.Vault 
    prepare(acct: AuthAccount) {
        self.vaultProxyRef = acct.borrow<&REVVVaultAccess.VaultProxy>(from: REVVVaultAccess.VaultProxyStoragePath)!
        self.ownedRevvVaultRef = acct.borrow<&REVV.Vault>(from: REVV.RevvVaultStoragePath)!
    }
    execute {
        let tempVault <- self.vaultProxyRef.withdraw(amount: amount)
        self.ownedRevvVaultRef.deposit(from: <- tempVault)
    }
}