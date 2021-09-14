import REVV from 0xREVV
transaction(amount: UFix64) {
    prepare(acct: AuthAccount){
        let tempVault <- REVV.escrowVault.withdraw(amount: amount)
        let vaultRef = acct.borrow<&REVV.Vault>(from: REVV.RevvVaultStoragePath) ?? panic("Could not borrow a reference to the vault resource")
        vaultRef.deposit(from: <- tempVault)
    }
    execute {

    }
}