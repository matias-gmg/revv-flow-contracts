import REVV from 0xREVV

transaction {
    prepare(authAccount: AuthAccount) {}
    
    execute {
        let admin <- create REVV.Admin()
        destroy admin
    }
}