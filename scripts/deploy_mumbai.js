const { ethers, waffle, upgrades } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();

    const provider = waffle.provider;

    console.log('Deploying contracts with the account: ' + deployer.address);
    /* ----------- test ------------- */
    ////////////////////////////////////

    var nonce = await provider.getTransactionCount(deployer.address);
    console.log(nonce);
    var startTIme = new Date().getTime();

    const market = await ethers.getContractFactory("NFTMarket");
    // deploy contracts
    const proxy = await upgrades.deployProxy(market, [], { nonce: nonce++ });
    await proxy.deployed();
    console.log("MARKET_ADDRESS: ", proxy.address);
    // upgrades contracts 
    // const proxy = await upgrades.upgradeProxy("0x62724E7929a2596770278A6422F80841595D4f61", market);

    // const _nfttoken = await ethers.getContractFactory('contracts/NFTBasic(ERC-1155).sol:Terraworld');
    // const nfttoken = await _nfttoken.deploy("Terra", "Terraworld", { nonce: nonce++ });
    // console.log("NFT Token:", nfttoken.address);

    var end = new Date().getTime();

    console.log("deploy ended ", (Number(end) - startTIme) / 1000);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })