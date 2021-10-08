import REVV from 0xREVV

transaction {
    prepare(acct: AuthAccount) { }
    execute {
        emit REVV.TokensMinted(amount: 1.0) // hardcoded amount for testing fail scenario
    }
}