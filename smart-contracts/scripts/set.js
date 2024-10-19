// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
// const hreconfig = require("@nomicsfoundation/hardhat-config")
// const fs = require("fs");
const addresses = require("../../deployed/votes.json");

async function main() {
    try {
        console.log('setting...')
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
        console.log(`Setter address is ${deployer.address}`);
        console.log(`Setter balance is ${hre.ethers.formatEther(balance)} ETH`);

        // console.log('config Votes');
        const Votes = await ethers.getContractFactory("Votes");
        // TODO
        const votes = await Votes.attach(addresses[network].TransparentUpgradeableProxy); // Votes

        let tx;
        // tx = await votes.setDead("0xDDca8B4f8B0783eDdBe021E3a7871BCA65A5E593");
        // await tx.wait();

        console.log('config OK')
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
