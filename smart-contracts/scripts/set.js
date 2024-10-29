// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
// const hreconfig = require("@nomicsfoundation/hardhat-config")
// const fs = require("fs");
const addresses = require("../deployed/votes.json");
const { delay } = require("./utils");

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

        const tokenCA = network === "base" ? "0xb0492857994e2Af4aD0fa41D10BD711d4534f768" : "0x531A412CC29b76CeF128Ad0d5F69aE63d53B3450";
        const delayTime = 3000; // 3000ms

        const events = [
            //     {
            //         title: 'Toshi vs Mochi vs Floppa vs Miggles',
            //         image: '/images/group1.jpg',
            //         startTime: new Date(Date.UTC(2024, 9, 22, 18, 0, 0)),
            //         endTime: new Date(Date.UTC(2024, 9, 23, 18, 0, 0)),
            //         items: [0, 1, 2, 3]
            //     },
            //     {
            //         title: 'Doginme vs Benji vs Boge vs Ski',
            //         image: '/images/group2.jpg',
            //         startTime: new Date(Date.UTC(2024, 9, 22, 18, 0, 0)),
            //         endTime: new Date(Date.UTC(2024, 9, 23, 18, 0, 0)),
            //         items: [4, 5, 6, 7]
            //     },
            //     {
            //         title: 'Crash vs Chomp vs MABA vs Toby',
            //         image: '/images/group3.jpg',
            //         startTime: new Date(Date.UTC(2024, 9, 23, 18, 0, 0)),
            //         endTime: new Date(Date.UTC(2024, 9, 24, 18, 0, 0)),
            //         items: [8, 9, 10, 11]
            //     },
            //     {
            //         title: 'Bepe vs Doomer vs Weirdo vs Normie',
            //         image: '/images/group4.jpg',
            //         startTime: new Date(Date.UTC(2024, 9, 23, 18, 0, 0)),
            //         endTime: new Date(Date.UTC(2024, 9, 24, 18, 0, 0)),
            //         items: [12, 13, 14, 15]
            //     },
            //     {
            //         title: 'Mfer vs Degen vs Chad vs Bario',
            //         image: '/images/group5.jpg',
            //         startTime: new Date(Date.UTC(2024, 9, 24, 18, 0, 0)),
            //         endTime: new Date(Date.UTC(2024, 9, 25, 18, 0, 0)),
            //         items: [16, 17, 18, 19]
            //     },
            //     {
            //         title: 'Okayeg vs Roost vs Caw vs Boda',
            //         image: '/images/group6.jpg',
            //         startTime: new Date(Date.UTC(2024, 9, 24, 18, 0, 0)),
            //         endTime: new Date(Date.UTC(2024, 9, 25, 18, 0, 0)),
            //         items: [20, 21, 22, 23]
            //     },
            //     {
            //         title: 'TYBG vs CTO vs Higher vs Chuck',
            //         image: '/images/group7.jpg',
            //         startTime: new Date(Date.UTC(2024, 9, 25, 18, 0, 0)),
            //         endTime: new Date(Date.UTC(2024, 9, 26, 18, 0, 0)),
            //         items: [24, 25, 26, 27]
            //     },
            //     {
            //         title: 'Birb vs Grug vs Brett vs Keycat',
            //         image: '/images/group8.jpg',
            //         startTime: new Date(Date.UTC(2024, 9, 25, 18, 0, 0)),
            //         endTime: new Date(Date.UTC(2024, 9, 26, 18, 0, 0)),
            //         items: [28, 29, 30, 31]
            //     },
            {
                title: 'Doomer vs Toby vs Toshi vs Boge',
                image: '/images/group9.jpg',
                startTime: new Date(Date.UTC(2024, 9, 29, 18, 0, 0)),
                endTime: new Date(Date.UTC(2024, 9, 30, 18, 0, 0)),
                items: [36, 37, 38, 39]
            },
            {
                title: 'Higher vs Roost vs Brett vs Bario',
                image: '/images/group10.jpg',
                startTime: new Date(Date.UTC(2024, 9, 30, 18, 0, 0)),
                endTime: new Date(Date.UTC(2024, 9, 31, 18, 0, 0)),
                items: [40, 41, 42, 43]
            },
        ]

        let tx;
        for (let idx = 0; idx < events.length; idx++) {
            console.log(`===========${idx}===========`)
            const names = events[idx].title.split(' vs ').map((name) => name.trim());
            console.log('title: ', events[idx].title)
            console.log('imageURI: ', events[idx].image)
            console.log('token: ', tokenCA)
            console.log('minPower: ', hre.ethers.parseUnits('1', 18))
            console.log('startTime: ', parseInt(events[idx].startTime / 1000))
            console.log('endTime: ', parseInt(events[idx].endTime / 1000))
            console.log('names: ', names)
            tx = await votes.createVote(
                events[idx].title,
                events[idx].image,
                tokenCA,
                hre.ethers.parseUnits('1', 18),
                parseInt(events[idx].startTime / 1000),
                parseInt(events[idx].endTime / 1000),
                names
            );
            await tx.wait();
            console.log(`delaying ${delayTime} ms`)
            await delay(delayTime)
            console.log(`delayed`)
        }

        // const vote7 = {
        //     title: 'Birb vs Grug vs Brett vs Keycat',
        //     startTime: new Date(Date.UTC(2024, 9, 25, 18, 0, 0)),
        //     endTime: new Date(Date.UTC(2024, 9, 26, 18, 0, 0)),
        // }

        // const names = vote7.title.split(' vs ').map((name) => name.trim());
        // console.log('names: ', names)
        // tx = await votes.setItems(
        //     7,
        //     names
        // );
        // await tx.wait();

        // console.log(`delaying ${delayTime} ms`)
        // await delay(delayTime)
        // console.log(`delayed`)

        // console.log('startTime: ', parseInt(vote7.startTime / 1000))
        // tx = await votes.setTime(
        //     7,
        //     0,
        //     parseInt(vote7.startTime / 1000)
        // );
        // await tx.wait();

        // console.log(`delaying ${delayTime} ms`)
        // await delay(delayTime)
        // console.log(`delayed`)

        // console.log('endTime: ', parseInt(vote7.endTime / 1000))
        // tx = await votes.setTime(
        //     7,
        //     1,
        //     parseInt(vote7.endTime / 1000)
        // );
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
