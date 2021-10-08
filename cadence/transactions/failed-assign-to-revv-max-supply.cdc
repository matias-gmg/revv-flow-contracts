import REVV from 0xREVV

transaction {
    prepare(acct: AuthAccount) { }
    execute {
        REVV.MAX_SUPPLY = 100_000_000_000.0 as UFix64
    }
}
