import REVVVaultAccess from 0xREVVVaultAccess

transaction {
    prepare(authAccount: AuthAccount){}

    execute {
        REVVVaultAccess.proxyToGuardMap = {}
    }
}