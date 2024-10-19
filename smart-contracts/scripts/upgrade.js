// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
// const hreconfig = require("@nomicsfoundation/hardhat-config")
const fs = require("fs");
const addresses = require("../../deployed/votes.json");

async function main() {
  try {
    console.log('upgrading...')
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
    console.log(`Upgrader address is ${deployer.address}`);
    console.log(`Upgrader balance is ${hre.ethers.formatEther(balance)} ETH`);

    console.log('deploy Votes');

    const votes = await hre.ethers.deployContract("Votes");
    await votes.waitForDeployment();
    console.log(`Votes deployed to ${votes.target}`);

    console.log('upgrade Proxy');

    const ProxyAdmin = await hre.ethers.getContractFactory("contracts/TransparentUpgradeableProxy.sol:ProxyAdmin");
    // TODO
    const proxyAdmin = ProxyAdmin.attach(hre.ethers.isAddress(addresses[network]?.ProxyAdmin) ? addresses[network]?.ProxyAdmin : ""); // ProxyAdmin

    let tx = await proxyAdmin.upgradeAndCall(
      addresses[network].TransparentUpgradeableProxy, // proxy
      votes.target, // implementation
      '0x', // data
    );

    await tx.wait();

    fs.writeFileSync('deployed/votes.json', JSON.stringify({
      ...addresses,
      [network]: {
        'Implementation': votes.target,
        'ProxyAdmin': proxyAdmin.target,
        'TransparentUpgradeableProxy': addresses[network].TransparentUpgradeableProxy,
      }
    }, null, 2))
    console.log('upgraded Proxy')
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
