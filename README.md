
# REVV token contract and REVVAccessVault contracts

## Overview

REVV is the utility token that serves as the primary currency of purchase, utility, and action across the REVV Motorsport blockchain metaverse. REVV is designed to enable true digital ownership of game assets, as well as driver a Play-to-Earn ecosystem of competitive motorsport gaming experiences. REVV Motorsport blends original content alongside branded titles and content. Today, REVV Motorsport includes licensed titles as F1® Delta Time, MotoGP™ Ignition, Formula E High Voltage, and original titles with REVV Racing. The REVV token itself is a cross-chain asset, with the purpose of aiding interoperability, with the token itself being available today on Binance Smart Chain, Ethereum, and Polygon.

See:
https://www.animocabrands.com/blockchain-projects
https://revvmotorsport.com/
https://www.motogp-ignition.com/

To enable Ethereum REVV holders to play MotoGP Ignition, Animoca has developed a bridge in partnership with Portto to allow users to 'teleport' their Ethereum REVV to FLOW. The bridge will not burn tokens but hold them in escrow.
The bridge will not be part of the audit requested by Animoca but will be part of an audit requested by Portto.

See: 
Portto's Ethereum Flow REVV bridge: https://github.com/portto/revv-contracts

## The REVV token on Flow

The Flow REVV token contract is available here: 
https://github.com/animoca/revv-flow-contracts/blob/master/cadence/contracts/REVV.cdc

The REVV token full implements the FLOW FungibleToken interface. Our intention is that REVV will be usable in any marketplace that implements the FLOW NonFungibleToken interface for payments. We used the FUSD and FLOWToken contracts as reference for development.

The total maximum supply of REVV tokens is 3,000,000,000 (3 billion). All REVV tokens will be minted on contract creation and saved into a vault in the contract-owning account's storage. After the contract has been deployed and init() has run, no more minting should be possible.

We have implemented a mechanism to prevent the burning of REVV. If a user destroys a REVV token, i.e. calls `destroy` on a vault, instead of reducing total supply, the amount will be deposited into the escrow Vault of the REVV contract. In this way, we want to prevent a decreasing supply, since further minting isn't possible. 

The escrow vault doesn't have a withdrawal method, as we haven't decided what to do with the escrowed vault funds yet. The design should allow us to add a withdrawal method later via a contract upgrade. Noone, including the contract-owning account, should be able to remove REVV directly from the escrow vault.

## The REVVAccessVault

The REVVAccesVault contract is available here:
https://github.com/animoca/revv-flow-contracts/blob/master/cadence/contracts/REVVVaultAccess.cdc

To allow Portto to retrieve REVV for use with the Teleport bridge, we've designed the REVVAccessVault contract, which allows Portto to withdraw REVV in multiple transactions up to a limit. Portto creates a ProxyVault in their account, and after Animoca has run a transaction to enable it by setting a capability, Portto will be able to do withdrawals from the Proxy in their account. Animoca can stop withdrawals by unlinking the the ProxyVault's capability.
The contract should allow for multiple VaultProxies in multiple accounts.

### How to use the REVVAccessVault contract

We use Alice and Bob as account names in this explanation, where Alice is the REVV contract owner, and Bob will be given the right to withdraw REVV.

To use REVVAccessVault betweeen two accounts, the following actions would be taken:

#### Usage flow in order:

##### 1.
Alice creates a VaultGuard in her account. The VaultGuard's job is to function as a middleman between Alice's mint Vault and Bob's VaultProxy.  Alice configures the VaultGuard with a max withdrawal amount, and the recipient's account address, as arguments to the Guard's constructor.

See: 
https://github.com/animoca/revv-flow-contracts/blob/master/test/revv.test.js -> "Service can create a VaultGuard(for Bob's future VaultProxy)"
https://github.com/animoca/revv-flow-contracts/blob/master/cadence/transactions/create-vault-guard.cdc

Since we can't pass Path objects as variables to a transaction using Flow's fcl library, and strings can't be cast to paths, the paths are hardcoded in the transaction file.

##### 2.
Bob now creates a VaultProxy in his account storage and creates a public link to allow Alice to enable the VaultProxy later.
The VaultProxy can't withdraw REVV yet, since it hasn't been enabled by Alice.

See: 
https://github.com/animoca/revv-flow-contracts/blob/master/test/revv.test.js -> "Bob can create, save and link to a VaultProxy"
https://github.com/animoca/revv-flow-contracts/blob/master/cadence/transactions/create-vault-proxy.cdc

##### 3.
Alice enables Bob's VaultProxy by giving it the capability to access Alice's VaultGuard.

See: 
https://github.com/animoca/revv-flow-contracts/blob/master/test/revv.test.js -> "Service can set capability for VaultGuard on the Vault Proxy".
https://github.com/animoca/revv-flow-contracts/blob/master/cadence/transactions/set-vault-guard-cap-on-vault-proxy.cdc

##### 4.
Bob can now withdraw REVV from his VaultGuard (and deposit it into his teleport bridge contract's vault).

See: 
https://github.com/animoca/revv-flow-contracts/blob/master/test/revv.test.js -> "Bob can withdraw REVV from his VaultProxy (after the VaultGuard capability has been set".
https://github.com/animoca/revv-flow-contracts/blob/master/cadence/transactions/withdraw-from-vault-proxy.cdc

##### 5. 
If Alice unlinks the VaultProxy's capability, Bob can't withdraw REVV.

See: 
https://github.com/animoca/revv-flow-contracts/blob/master/test/revv.test.js -> "Bob can't withdraw REVV from VaultProxy after VaultGuard capability has been revoked".
https://github.com/animoca/revv-flow-contracts/blob/master/cadence/transactions/revoke-vault-guard.cdc


## How to run tests

Install Flow CLI: https://docs.onflow.org/flow-cli/install/

To run tests locally, run the following command in the project directory:
```
yarn test
```
