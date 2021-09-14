import REVV from 0xREVV

transaction {
    prepare(acct: AuthAccount) { }
    execute {
        REVV.totalSupply = 1.0 as UFix64
    }
}