import REVVVaultAccess from 0xREVVVaultAccess

transaction {
    prepare(acct: AuthAccount){

    }
    execute {
        let admin <- create REVVVaultAccess.Admin() //should throw here
        destroy admin
    }
}