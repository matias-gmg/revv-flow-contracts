import REVV from 0xREVV

transaction {
    prepare(authAccount: AuthAccount){}

    execute {
        REVV.RevvVaultStoragePath = /public/hackedVaultStoragePath
    }
}