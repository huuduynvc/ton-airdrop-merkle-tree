import { Address, Cell, Dictionary } from '@ton/core';
import { airdropEntryValue } from '../wrappers/Airdrop';
import { NetworkProvider, compile } from '@ton/blueprint';
import { AirdropHelper } from '../wrappers/AirdropHelper';

export async function run(provider: NetworkProvider) {
    // suppose that you have the cell in base64 form stored somewhere
    const dictCell = Cell.fromBase64(''); // Dictionary cell boc base64
    const dict = dictCell.beginParse().loadDictDirect(Dictionary.Keys.BigUint(256), airdropEntryValue);

    const entryIndex = 1n;

    const proof = dict.generateMerkleProof(entryIndex);
    console.log("proof", proof.toBoc().toString('base64'));

    const helper = provider.open(
        AirdropHelper.createFromConfig(
            {
                airdrop: Address.parse(''), //airdrop address
                index: entryIndex,
                proofHash: proof.hash(),
            },
            await compile('AirdropHelper')
        )

        // or create from address
        // AirdropHelper.createFromAddress(Address.parse(''))
    );

    if (!(await provider.isContractDeployed(helper.address))) {
        await helper.sendDeploy(provider.sender());
        await provider.waitForDeploy(helper.address);
    }

    // trigger claim
    await helper.sendClaim(29n, proof);
}
