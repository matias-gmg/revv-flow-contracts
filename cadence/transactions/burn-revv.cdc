import REVV from 0xREVV

transaction(amount: UFix64) {
    prepare(acct: AuthAccount) {

        let vaultRef = acct.borrow<&REVV.Vault>(from: REVV.RevvVaultStoragePath)
        ?? panic("Could not borrow a reference to the vault resource")

        let tempVault <- vaultRef.withdraw(amount: amount) as! @REVV.Vault

        destroy tempVault
    }
    execute {

    }
}