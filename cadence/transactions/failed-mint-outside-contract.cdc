import REVV from 0xREVV

transaction {
    prepare(authAccount: AuthAccount) {}
    
    execute {
        REVV.mint(amount: 1.0 as UFix64) //hardcoded amount for testing fail scenario
    }
}