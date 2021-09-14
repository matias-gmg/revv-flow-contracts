import REVVVaultAccess from 0xREVVVaultAccess

pub fun main(vaultProxyAddress: Address): UFix64 {
    return REVVVaultAccess.getMaxAmountForAccount(vaultProxyAddress: vaultProxyAddress)
}
