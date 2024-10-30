import "REVV"
import "FungibleToken"

transaction() {
    
    prepare(acct: auth(BorrowValue, SaveValue, IssueStorageCapabilityController) &Account) {
        // Create a "private provider" capability (authorized to Withdraw) from the stored Vault
        let providerCap: Capability<&REVV.Vault> = acct.capabilities.storage.issue<auth(FungibleToken.Withdraw) &REVV.Vault>(
            REVV.RevvVaultStoragePath
        )

        // Save the 'private provider' capability to storage
        acct.storage.save(providerCap, to: REVV.getProviderPath())
    }
    execute {}
}