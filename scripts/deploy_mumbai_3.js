const { ethers, waffle } = require("hardhat");

const treasuryAbi = require('../artifacts/contracts/Treasury.sol/BegoikoTreasury.json').abi;
const begoAbi = require('../artifacts/contracts/BegoikoERC20.sol/BegoikoERC20Token.json').abi;

async function main() {

    const [deployer] = await ethers.getSigners();

    const provider = waffle.provider;

    var DAO = { address: process.env.DAO };

    var nonce = await provider.getTransactionCount(deployer.address);
    console.log(nonce);
    var startTIme = new Date().getTime();

    const begoAddress = "0x6fBEe246b7348F02A04348f160583d3799525001";
    const daiAddress = "0xef45e6E3159e9F302D2B85f6E777791d7B7e98d8";
    const wFTMAddress = "0x9c3c9283d3e44854697cd22d3faa240cfb032889";
    const daiLP = "0xe32e598b931866d54f74211326b939de7fe880fb";
    const treasuryAddress = "0xc090836C4C8fbd66E3903F7ACfeEf6ffa013990E";

    const tresuryContract = new ethers.Contract(treasuryAddress, treasuryAbi, deployer);
    const begoContract = new ethers.Contract(begoAddress, begoAbi, deployer);

    // Deploy Presale
    const _farm = await ethers.getContractFactory('Masterchef');
    const farm = await _farm.deploy(begoAddress, 1645500559, DAO.address, { nonce: nonce++ });

    tx = await farm.updateTreasury(treasuryAddress, { nonce: nonce++ });
    await tx.wait();

    tx = await farm.updateMintable(true, { nonce: nonce++ });
    await tx.wait();

    tx = await tresuryContract.setMintable(farm.address, { nonce: nonce++ });
    await tx.wait();

    tx = await farm.add(1000, daiLP, 400, true, { nonce: nonce++ });
    await tx.wait();

    tx = await farm.add(2000, begoAddress, 0, true, { nonce: nonce++ });
    await tx.wait();

    tx = await farm.add(2000, daiAddress, 0, true, { nonce: nonce++ });
    await tx.wait();

    tx = await begoContract.setFarm(farm.address, { nonce: nonce++ });
    await tx.wait();

    var end = new Date().getTime();

    console.log("deploy ended ", (Number(end) - startTIme) / 1000);
    console.log("FARM_ADDRESS: ", farm.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })