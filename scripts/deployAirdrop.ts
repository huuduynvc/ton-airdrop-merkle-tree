import { Address, beginCell, toNano } from '@ton/core';
import { Airdrop, AirdropEntry, generateEntriesDictionary } from '../wrappers/Airdrop';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const entries: AirdropEntry[] = [
            {
                address: Address.parse(""), // whitelist address
                amount: 1 // nft amount
            }
          ];

    const dict = generateEntriesDictionary(entries);
    const dictCell = beginCell().storeDictDirect(dict).endCell();
    console.log(`Dictionary cell (store it somewhere on your backend: ${dictCell.toBoc().toString('base64')}`);
    const merkleRoot = BigInt('0x' + dictCell.hash().toString('hex'));

    const airdrop = provider.open(
        Airdrop.createFromConfig(
            {
                merkleRoot,
                helperCode: await compile('AirdropHelper'),
            },
            await compile('Airdrop')
        )
    );


    await airdrop.sendDeploy(provider.sender(), toNano('0.05'), Address.parse('')); // nft collection address

    await provider.waitForDeploy(airdrop.address);
}
