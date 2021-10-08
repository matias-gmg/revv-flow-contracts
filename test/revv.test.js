import { expect } from "@jest/globals";
import path from "path";
import { emulator, init, deployContractByName, getAccountAddress, sendTransaction, executeScript } from "flow-js-testing";
import { TX_SUCCESS_STATUS } from "./constants";

jest.setTimeout(10000000);

describe("REVV contract tests.\n\tAccounts:\n\t [+] Service: \towns REVV & REVVVaultAccess contracts.\n\t [+] Alice: \towns a REVV vault (only) but no VaultProxy. \n\t [+] Bob: \towns a ProxyVault.\n\n\tRunning tests:...", () => {

    const serviceAddress = "0xf8d6e0586b0a20c7";
    const addressMap = {};
    addressMap["REVV"] = serviceAddress;
    addressMap["FungibleToken"] = "0xee82856bf20e2aa6";

    beforeAll(async () => {
        const basePath = path.resolve(__dirname, "../cadence");
        const port = 8080;
        init(basePath, port);
        await emulator.start(port);
    });

    afterAll(async () => {
        await emulator.stop();
    });

    test("Deploys REVV contract to Service.", async () => {
        const name = "REVV";
        const totalSupply = "3000000000.00000000";
        const typePrefix = `A.${serviceAddress.slice(2)}.${name}`
        try {
            let tx = await deployContractByName({ name });
            let [depositEvent, mintEvent, tokenInitEvent, contractAdded ] = tx.events;
            expect(depositEvent.type).toEqual(`${typePrefix}.TokensDeposited`);
            expect(depositEvent.data.amount).toEqual(totalSupply);
            expect(depositEvent.data.to).toEqual(serviceAddress);

            expect(mintEvent.type).toEqual(`${typePrefix}.TokensMinted`);
            expect(mintEvent.data.amount).toEqual(totalSupply);

            expect(tokenInitEvent.type).toEqual(`${typePrefix}.TokensInitialized`);
            expect(tokenInitEvent.data.initialSupply).toEqual(totalSupply);

            expect(contractAdded.type).toEqual("flow.AccountContractAdded");
            expect(contractAdded.data.address).toEqual(serviceAddress);
            expect(contractAdded.data.contract).toEqual(name);

        } catch (e) {
            console.log(e);
        }
    });

    test("Deploys REVVVaultAccess contract to Service", async () => {
        const name = "REVVVaultAccess";
        const to = serviceAddress;
        let tx = await deployContractByName({ to, name, addressMap });
        expect(tx.status).toBe(TX_SUCCESS_STATUS);
    });
    
    test("Provisions Alice and Bob with a REVV vault.", async () => {
        const provisionRevvVault = async signer => {
            const tx = await sendTransaction("provision-revv-vault", [signer]);
            expect(tx.status).toBe(TX_SUCCESS_STATUS);
            const revvBalance = await executeScript("get-revv-balance",[signer]);
            expect(revvBalance).toBe('0.00000000');
        }
        const Alice = await getAccountAddress("Alice");
        const Bob = await getAccountAddress("Bob");
        await provisionRevvVault(Alice);
        await provisionRevvVault(Bob);
    });

    test("Transfers REVV from Service to Alice.", async () => {
        const recipient = await getAccountAddress("Alice");
        const amount = '10.0';
        const tx = await sendTransaction("transfer-revv", [serviceAddress], [recipient,amount]);
        expect(tx.status).toBe(TX_SUCCESS_STATUS);
        const revvBalance = await executeScript("get-revv-balance",[recipient]);
        expect(parseFloat(revvBalance)).toBe(parseFloat(amount));
    });

    test("Burning Alice's REVV transfers it to REVV's escrow Vault", async () => {
        const zero = 0.0;
        const burnAmount = '5.0';
        let revvEscrowBalance = await executeScript("get-revv-escrow-balance");
        expect(parseFloat(revvEscrowBalance)).toBe(zero);

        const Alice = await getAccountAddress("Alice");
        const signers = [Alice];
        const tx = await sendTransaction("burn-revv", signers, [burnAmount]);
        expect(tx.status).toBe(TX_SUCCESS_STATUS);

        revvEscrowBalance = await executeScript("get-revv-escrow-balance");
        expect(parseFloat(revvEscrowBalance)).toBe(parseFloat(burnAmount));
    });

    test("Service can't remove REVV directly from the escrow vault", async () => {
        try {
            const amount = '1.0';
            await sendTransaction("failed-access-escrow",[],[amount]);
            throw "Escrow Vault could be accessed! Security Vulnerability!";
        } catch (e) {
            expect(e).toContain("[Error Code: 1101] cadence runtime error Execution failed");
            expect(e).toContain("error: cannot access `escrowVault`: field has contract access");
        }
    });

    test("Alice can't remove REVV directly from the escrow vault", async () => {
        try {
            const amount = '2.0';
            const Alice = await getAccountAddress("Alice");
            const signers = [Alice];
            await sendTransaction("failed-access-escrow",signers,[amount]);
            // If we get here, the tx succeeded - bad news.
            throw `Escrow Vault could be accessed!`;
        } catch (e) {
            // Expected path - tx should throw.
            expect(e).toContain("[Error Code: 1101] cadence runtime error Execution failed");
            expect(e).toContain("error: cannot access `escrowVault`: field has contract access");
        }
    });

    test("Service can create a VaultGuard (for Bob's future VaultProxy)", async () => {
        const Bob = await getAccountAddress("Bob");
        const maxAmount = '1000.0';
        const tx = await sendTransaction("create-vault-guard", [serviceAddress], [maxAmount, Bob]);
        expect(tx.status).toBe(TX_SUCCESS_STATUS);
    });

    test("Anyone can read VaultGuardPaths using a VaultProxy address", async () => {
        const Bob = await getAccountAddress("Bob");
        const guardPaths = await executeScript("get-vault-guard-paths",[Bob]);
        expect(guardPaths.storagePath.identifier).toBe('revvVaultGuard_01');
        expect(guardPaths.privatePath.identifier).toBe('revvVaultGuard_01');
    });

    test("Service can borrow a reference to its own VaultGuard", async () => {
        const tx = await sendTransaction("borrow-vault-guard", [serviceAddress]);
        expect(tx.status).toBe(TX_SUCCESS_STATUS);
    });

    test("Bob can create, save and link to a VaultProxy", async () => {
        const Bob = await getAccountAddress("Bob");
        const tx = await sendTransaction("create-vault-proxy", [Bob]);
        expect(tx.status).toBe(TX_SUCCESS_STATUS);
    });

    test("Anyone can read the guard dictionary and get the vault proxy addresses", async () => {
        const Bob = await getAccountAddress("Bob");
        const addresses = await executeScript("get-proxy-vault-addresses");
        expect(addresses.length).toBe(1);
        expect(addresses[0]).toBe(Bob);
    });

    test("Service can set capability for VaultGuard on the Vault Proxy", async () => {
        const Bob = await getAccountAddress("Bob");
        const tx = await sendTransaction("set-vault-guard-cap-on-vault-proxy", [serviceAddress], [Bob]);
        expect(tx.status).toBe(TX_SUCCESS_STATUS);
    });

    test("Anyone can read the max amount for an address", async () => {
        const Bob = await getAccountAddress("Bob");
        const max = await executeScript("get-max-amount-for-account",[Bob]);
        expect(parseInt(max)).toBe(1000);
    });

    test("Anyone can check that the total authorized REVV equals the guards allocated value", async () => {
        const total = await executeScript("get-total-authorized-amount");
        expect(parseInt(total)).toBe(1000);
    });

    test("Bob can withdraw REVV from his VaultProxy (after the VaultGuard capability has been set", async () => {
        const Bob = await getAccountAddress("Bob");
        const amount = '2.0';
        const tx = await sendTransaction("withdraw-from-vault-proxy", [Bob], [amount]);
        expect(tx.status).toBe(TX_SUCCESS_STATUS);
        const revvBalance = await executeScript("get-revv-balance",[Bob]);
        expect(parseInt(revvBalance)).toBe(2);
    });

    test("A VaultGaurd can't be assigned more REVV than the max total supply", async () => {
        const Alice = await getAccountAddress("Alice");
        const tooHighAmount = '3000000001.0';
        try {
            await sendTransaction("create-vault-guard",[serviceAddress],[tooHighAmount, Alice]);
            throw `VaultGuard could be created with amount higher than max allows.`
        } catch (e) {
            expect(e).toContain('self.totalAuthorizedAmount + maxAmount <=  REVV.MAX_SUPPLY : "Requested max amount + previously authorized amount exceeds max supply"');
        }
    });

    test("Anyone can read the max from the VaultGuard", async () => {
        const Bob = await getAccountAddress("Bob");
        const guardMax = await executeScript("get-vault-guard-max", [Bob]);
        expect(parseInt(guardMax)).toBe(1000);
    });

    test("Bob can't withdraw REVV from VaultProxy after VaultGuard capability has been revoked", async () => {
        const Bob = await getAccountAddress("Bob");
        const tx = await sendTransaction("revoke-vault-guard",[serviceAddress],[Bob]);
        expect(tx.status).toBe(TX_SUCCESS_STATUS);
        try {
            const amount = '1.0';
            await sendTransaction("withdraw-from-vault-proxy", [Bob], [amount]);
            throw `REVV could been withdraw from VaultProxy with revoked Guard capability.`
        } catch (e) {
            expect(e).toContain("pre-condition failed: Can't withdraw. vaultGuardCap.check() failed");
        }
    });

    test("Can't change the REVV totalSupply by writing to the field", async () => {
        try {
            await sendTransaction("failed-assign-to-revv-total-supply");
            throw `Can assign to totalSupply.`
        } catch (e) {
            expect(e).toContain("cannot assign to `totalSupply`: field has public access");
        }

        try {
            await sendTransaction("failed-bitshift-revv-total-supply");
            throw `Can bitshift totalSupply.`
        } catch (e) {
            expect(e).toContain("cannot apply binary operation << to types: `UFix64`, `UFix64`");
        }
    });

    test("Can't change the REVV MAX_SUPPLY to writing to the field", async () => {
        try {
            await sendTransaction("failed-assign-to-revv-max-supply");
            throw `Can assign to MAX_SUPPLY.`
        } catch (e) {
            expect(e).toContain("cannot assign to `MAX_SUPPLY`: field has public access")
        }
    });

    test("Can't emit a Mint event from a tx", async () => {
        try {
            await sendTransaction("failed-emit-mint-event");
            throw `Can emit Mint event from tx.`
        } catch (e) {
            expect(e).toContain("cannot emit imported event type: `REVV.TokensMinted`");
        }
    });

    test("Can't modify RevvAdminStoragePath", async () => {
        try {
            await sendTransaction("failed-assign-to-revv-admin-storage-path");
            throw `Can assign to RevvAdminStoragePath.`
        } catch(e) {
            expect(e).toContain("cannot assign to `RevvAdminStoragePath`: field has public access");
        }
    });

    test("Can't modify RevvBalancePublicPath", async () => {
        try {
            await sendTransaction("failed-assign-to-revv-balance-public-path");
            throw "Can assign to RevvBalancePublicPath"
        } catch (e) {
            expect(e).toContain("cannot assign to `RevvBalancePublicPath`: field has public access")
        }
    });

    test("Can't modify RevvReceiverPublicPath", async () => {
        try {
            await sendTransaction("failed-assign-to-revv-receiver-public-path");
            throw `Can assign to RevvReceiverPublicPath.`
        } catch (e) {
            expect(e).toContain("cannot assign to `RevvReceiverPublicPath`: field has public access");
        }
    });

    test("Can't modify RevvVaultStoragePath", async () => {
        try {
            await sendTransaction("failed-assign-to-revv-vault-storage-path");
            throw "Can assign to RevvVaultStoragePath"
        } catch (e) {
            expect(e).toContain("cannot assign to constant member: `RevvVaultStoragePath`");
        }
    });

    test("Can't modify RevvVaultPrivatePath", async () => {
        try {
            await sendTransaction("failed-assign-to-revv-vault-private-path");
            throw `Can assign to RevvVaultPrivatePath.`
        } catch (e) {
            expect(e).toContain("cannot assign to `RevvVaultPrivatePath`: field has public access");
        }
    });
    
    test("Can't withdraw from REVV mint vault with a public vault balance capability", async () => {
        try {
            await sendTransaction("failed-vault-withdraw-from-balance-public-path");
            throw `Can withdraw from mint vault.`
        } catch (e) {
            expect(e).toContain("error: value of type `&AnyResource{FungibleToken.Balance}` has no member `withdraw`");
        }
    });

    test("Can't withdraw from mint vault with public provider capability", async () => {
        try {
            await sendTransaction("failed-vault-withdraw-from-provider-public-path",[serviceAddress],[serviceAddress]);
            throw `Can withdraw from mint vault.`
        } catch (e) {
            expect(e).toContain("unexpectedly found nil while forcing an Optional value")
        }
    });

    test("Can't withdraw from vault using provider capability for storage path, not even with service account", async () => {
        try {
            await sendTransaction("failed-vault-withdraw-from-storage-path", [serviceAddress], [serviceAddress]);
            throw `Can withdraw from mint vault.`
        } catch (e) {
            expect(e).toContain("expected `PublicPath`, got `StoragePath`");
        }
    });

    test("Service **can** access vault via storage path", async () => {
        const Bob = await getAccountAddress("Bob");
        const tx = await sendTransaction("withdraw-from-revv-mint-vault",[serviceAddress],[serviceAddress]);
    });

    test("A REVV Admin resource can't be created after the REVV contract has been initialized", async () => {
        try {
            await sendTransaction("failed-create-revv-admin-outside-contract")
            throw `Can create Admin outside of contract!`
        } catch(e){
            expect(e).toContain("cannot create resource type outside of containing contract: `REVV.Admin`");
        }
    });

    test("The REVV mint method can't be called from outside the contract", async () => {
        try {
            await sendTransaction("failed-mint-outside-contract");
            throw `Can mint from outside REVV contract!`
        } catch(e){
            expect(e).toContain("cannot access `mint`: function has contract access");
        }
    });

    test("Can't deposit to escrow from outside the contract", async () => {
        try {
            await sendTransaction("failed-deposit-to-escrow-from-outside-revv-contract");
            throw `Can deposit to escrow from outside contract!`
        } catch(e){
            expect(e).toContain("cannot access `depositToEscrow`: function has contract access");
        }
    });

    test("Can't modify REVVVaultAccess's VaultProxyStoragePath", async () => {
        try {
            await sendTransaction("failed-assign-to-revvvaultaccess-vaultproxystoragepath");
            throw `Can modify RevvVaultAccess's VaultProxyStoragePath!`
        } catch(e) {
            expect(e).toContain("error: cannot assign to `VaultProxyStoragePath`: field has public access");
        }
    });

    test("Can't modify REVVVaultAccess's VaultProxyPublicPath", async () => {
        try {
            await sendTransaction("failed-assign-to-revvvaultaccess-vaultproxypublicpath");
            throw `Can modify RevvVaultAccess's VaultProxyPublicPath!`
        } catch(e) {
            expect(e).toContain("cannot assign to `VaultProxyPublicPath`: field has public access");
        }
    });

    test("Can't modify REVVVaultAccess's AdminStoragepath", async () => {
        try {
            await sendTransaction("failed-assign-to-revvvaultaccess-adminstoragepath");
            throw `Can modify RevvVaultAccess's AdminStoragePath!`
        } catch(e) {
            expect(e).toContain("cannot assign to `AdminStoragePath`: field has public access");
        }
    });

    test("Can't modify REVVVaultAccess's totalAuthorizedAmount", async () => {
        try {
            await sendTransaction("failed-assign-to-revvvaultaccess-totalauthorizedamount");
            throw `Can modify RevvVaultAccess's totalAuthorizedAmount!`
        } catch(e) {
            expect(e).toContain("cannot assign to `totalAuthorizedAmount`: field has public access");
        }
    });

    test("Can't modify proxyToGuardMap by field assignment", async () => {
        try {
            await sendTransaction("failed-assign-to-revvvaultaccess-proxytoguardmap");
            throw `Can modify RevvVaultAccess's proxyToGuardMap!`
        } catch(e) {
            expect(e).toContain("cannot access `proxyToGuardMap`: field has contract access");
        }
    });

    test("Can't modify guardToProxyMap by field assignment", async () => {
        try {
            await sendTransaction("failed-assign-to-revvvaultaccess-guardtoproxymap");
            throw `Can modify RevvVaultAccess's guardToProxyMap!`
        } catch(e) {
            expect(e).toContain("cannot access `guardToProxyMap`: field has contract access");
        }
    });

    test("Can't create a RevvVaultAccess Admin outside of contract", async () => {
        try {
            await sendTransaction("failed-create-revvvaultaccess-admin");
            throw `Can create RevvVaultAccess Admin outside of contract!`
        } catch(e) {
            expect(e).toContain("cannot create resource type outside of containing contract: `REVVVaultAccess.Admin`");
        }
    });

    test("Can't create a VaultGuard if admin is nil", async () => {
        try {
            await sendTransaction("failed-create-vaultguard-without-admin");
            throw `Can create a VaultGuard without an admin reference!`
        } catch(e) {
            expect(e).toContain("expected `&REVVVaultAccess.Admin`, got `Never?");
            expect(e).toContain("error: mismatched types");
        }
    });

    test("Can't create a VaultGuard if requested max + previously authorized amount exceeds max supply", async () => {
        try {
            const maxAmount = '100000000000.0';
            await sendTransaction("failed-create-vaultguard-exceeding-max",[serviceAddress],[maxAmount,serviceAddress]);
            throw `Can create a VaultGuard with a max that exceeds allowed amount!`
        } catch (e) {
            expect(e).toContain("error: pre-condition failed: Requested max amount + previously authorized amount exceeds max supply");
        }
    });

    test("Can't create a VaultGuard using existing paths", async () => {
        try {
            //the paths are hardcoded in the tx file
            const Bob = await getAccountAddress("Bob");
            const maxAmount = '1000.0';
            await sendTransaction("create-vault-guard", [serviceAddress], [maxAmount, Bob]);
            await sendTransaction("create-vault-guard", [serviceAddress], [maxAmount, Bob]);
            throw `Can create a VaultGuard using already-used paths! ${SV}`
        } catch (e) {
            expect(e).toContain("error: pre-condition failed: VaultProxy Address already registered");
        }
    });

    test("Can't modify stored VaultGuard", async () => {
        try {
            await sendTransaction("failed-modify-vault-guard-max");
            throw `Can modify a stored VaultGuard's max field!`
        } catch (e) {
            expect(e).toContain("cannot assign to `max`: field has public access");
        }
    });

    test("Can't set max amount on existing VaultGuard", async () => {
        try {
            await sendTransaction("failed-modify-vault-guard-total");
            throw `Can modify a stored VaultGuard's total field!`
        } catch (e) {
            expect(e).toContain("cannot assign to `total`: field has public access");
        }
    });

    test("Can't create a VaultProxy and withdraw funds without the capability being set", async () => {
        //create vaultproxy for alice
        const Alice = await getAccountAddress("Alice");
        const tx = await sendTransaction("create-vault-proxy", [Alice]);
        expect(tx.status).toBe(TX_SUCCESS_STATUS);

        //try to withdraw without VaultGuard capability being set    
        try {
            let amount = '2.0';
            await sendTransaction("withdraw-from-vault-proxy", [Alice], [amount]);
            throw `Can withdraw REVV from a new VaultGuard!`
        } catch (e) {
            expect(e).toContain("Can't withdraw. vaultGuardCap.check() failed");
        }
    });
 
});