import REVVVaultAccess from 0xREVVVaultAccess

transaction {
    prepare(acct: AuthAccount){}
    execute {
        //pub fun createVaultGuard( adminRef: &Admin, vaultProxyAddress: Address, maxAmount: UFix64, guardStoragePath: StoragePath, guardPrivatePath: PrivatePath) {  
        let address: Address =  0xf8d6e0586b0a20c7
        let amount: UFix64 = 100_000_000.0
        let storagePath: StoragePath = /storage/path1
        let privatePath: PrivatePath = /private/path2
        REVVVaultAccess.createVaultGuard(adminRef: nil, vaultProxyAddress: address, maxAmount: amount, guardStoragePath: storagePath, guardPrivatePath: privatePath)
    }
}