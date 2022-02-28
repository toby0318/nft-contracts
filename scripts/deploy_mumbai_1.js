const { ethers, waffle } = require("hardhat");

const IERC20 = require('../artifacts/contracts/BegoikoERC20.sol/IERC20.json').abi;

async function main() {

    const [deployer] = await ethers.getSigners();

    const provider = waffle.provider;

    var DAO = { address: process.env.DAO };
    console.log('Deploying contracts with the account: ' + deployer.address);
    console.log('Deploying contracts with the account: ' + DAO.address);

    const daiAddress = "0xef45e6E3159e9F302D2B85f6E777791d7B7e98d8";

    // const ohm = new ethers.Contract(ohmAddress, OHMContractABI, deployer);

    const dai = new ethers.Contract(daiAddress, IERC20, deployer);

    // Deploy OHM
    const OHM = await ethers.getContractFactory('BegoikoERC20Token');
    const ohm = await OHM.deploy();
    await ohm.deployed();

    /* ----------- test ------------- */
    ////////////////////////////////////

    var nonce = await provider.getTransactionCount(deployer.address);
    console.log(nonce);
    var startTIme = new Date().getTime();

    console.log("--------------deploy Begoiko finish----------------")

    // Deploy Presale
    const Presale = await ethers.getContractFactory('Presale');
    const presale = await Presale.deploy({ nonce: nonce++ });
    tx = await presale.initialize(ohm.address, dai.address, '10000000', '100000000000', DAO.address, { nonce: nonce++ });
    await tx.wait();
    tx = await ohm.setPresale(presale.address, { nonce: nonce++ });
    await tx.wait();
    tx = await ohm.statePresale(true, { nonce: nonce++ });
    await tx.wait();

    var end = new Date().getTime();

    console.log("deploy ended ", (Number(end) - startTIme) / 1000)

    // var daiLP = await exchangeFactory.getPair(ohm.address,dai.address);
    // var wFTMLP = await exchangeFactory.getPair(ohm.address,dai.address);

    console.log("DAI_ADDRESS: ", dai.address);
    console.log("BEGO_ADDRESS: ", ohm.address);
    console.log("PRESALE_ADDRESS: ", presale.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
