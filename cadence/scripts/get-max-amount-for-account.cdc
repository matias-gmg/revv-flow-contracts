import REVVVaultAccess from 0xREVVVaultAccess

pub fun main(address: Address): UFix64 {
    return REVVVaultAccess.getMaxAmountForAccount(vaultProxyAddress: address)
}