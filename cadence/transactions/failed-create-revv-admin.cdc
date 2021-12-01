import FungibleToken from 0xFungibleToken
import REVV from 0xREVV

transaction(recipient: Address, amount: UFix64) {

    prepare(authAccount: AuthAccount) {
        let admin <- create REVV.Admin() // Should panic
        destroy admin
    }

    execute { }
     
}