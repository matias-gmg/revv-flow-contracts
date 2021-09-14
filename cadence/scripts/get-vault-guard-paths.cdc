import REVVVaultAccess from 0xREVVVaultAccess

pub fun main(vaultProxyAddress: Address): REVVVaultAccess.VaultGuardPaths? {
    return REVVVaultAccess.getVaultGuardPaths(vaultProxyAddress: vaultProxyAddress)
}