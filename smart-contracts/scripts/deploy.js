// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
// const hreconfig = require("@nomicsfoundation/hardhat-config")
const fs = require("fs");
let addresses = {}
try {
    addresses = require("../deployed/votes.json");
} catch (error) {

}

async function main() {
    try {
        console.log('deploying...')
        // const retVal = await hreconfig.hreInit(hre)
        // if (!retVal) {
        //   console.log('hardhat error!');
        //   return false;
        // }
        // await hre.run('clean')
        // await hre.run('compile')

        // console.log('deployer Info');
        const [deployer] = await hre.ethers.getSigners();
        const balance = await hre.ethers.provider.getBalance(deployer); // Get the balance of the deployer's account
        const network = `${hre.ethers.provider._networkName}`
        console.log(`Selected Network is ${network}`)
        console.log(`Deployer address is ${deployer.address}`);
        console.log(`Deployer balance is ${hre.ethers.formatEther(balance)} ETH`);

        console.log('deploy Votes');

        const votes = await hre.ethers.deployContract("Votes");
        await votes.waitForDeployment();
        console.log(`Votes deployed to ${votes.target}`);

        console.log('deploy TransparentUpgradeableProxy');

        const params = [
        ];
        console.log('hre.ethers.params: ', params)
        const funcSign = hre.ethers.id('initialize()').slice(0, 10);
        console.log('hre.ethers.funcSign: ', funcSign)
        const paramsData = params.map((item) => hre.ethers.zeroPadValue(hre.ethers.toBeArray(item), 32).replace("0x", "")).join('');
        console.log('hre.ethers.paramsData: ', paramsData)
        const bytesData = funcSign + paramsData;
        console.log('hre.ethers.bytesData: ', bytesData)

        const transparentUpgradeableProxy = await hre.ethers.deployContract("contracts/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy", [
            votes.target, // logic
            deployer.address, // initialOwner
            bytesData, // _data
        ]);
        await transparentUpgradeableProxy.waitForDeployment();
        console.log(`TransparentUpgradeableProxy deployed to ${transparentUpgradeableProxy.target}`);

        fs.writeFileSync(`deployed/votes.json`, JSON.stringify({
            ...addresses,
            [network]: {
                'Implementation': votes.target,
                'ProxyAdmin': '',
                'TransparentUpgradeableProxy': transparentUpgradeableProxy.target,
            }
        }, null, 2))
        console.log('deploy OK')
    } catch (error) {
        console.log(error)
        // console.log('error')
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
