import REVV from 0xREVV

transaction {
    prepare(authAccount: AuthAccount){}

    execute {
        REVV.RevvVaultPrivatePath = /private/hackedVaultPrivatePath
    }
}