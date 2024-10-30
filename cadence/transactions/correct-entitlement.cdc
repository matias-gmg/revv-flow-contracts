import "REVV"
import "FungibleToken"

transaction() {
    
    prepare(acct: auth(LoadValue, Storage, IssueStorageCapabilityController) &Account) {
        // Create a "private provider" capability (authorized to Withdraw) from the stored Vault

        let providerCap: Capability<auth(FungibleToken.Withdraw) &REVV.Vault> = acct.capabilities.storage.issue<auth(FungibleToken.Withdraw) &REVV.Vault>(
            REVV.RevvVaultStoragePath
        )
        // Remove any existing providers
        let oldProvider: AnyStruct? = acct.storage.load<AnyStruct>(from: REVV.getProviderPath())

        // Save the 'private provider' capability to storage
        acct.storage.save(providerCap, to: REVV.getProviderPath())
    }
    execute {}
}