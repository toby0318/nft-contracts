const { ethers, waffle } = require("hardhat");

const IERC20 = require('../artifacts/contracts/BegoikoERC20.sol/IERC20.json').abi;

async function main() {

    const [deployer] = await ethers.getSigners();

    const provider = waffle.provider;
    const istest = true;

    var DAO = { address: process.env.DAO };
    console.log('Deployer: ' + deployer.address);
    console.log('DAO: ' + DAO.address);

    console.log("--------------Deploy Begoiko----------------")

    // const daiAddress = "0xD92A265F12662c41C7d57b828314e0C369a36311";

    const initialMint = '10000000000000000000000000';

    // Deploy DAI
    const DAI = await ethers.getContractFactory('DAI');
    const dai = await DAI.deploy( 0 );
    await dai.deployed();
    
    // Deploy 10,000,000 mock DAI and mock Frax
    await dai.mint( deployer.address, initialMint );

    // const ohm = new ethers.Contract(ohmAddress, OHMContractABI, deployer);

    // const dai = new ethers.Contract(daiAddress, IERC20, deployer);

    // Deploy OHM
    const OHM = await ethers.getContractFactory('BegoikoERC20Token');
    const ohm = await OHM.deploy();
    await ohm.deployed();

    /* ----------- test ------------- */
    ////////////////////////////////////

    var nonce = await provider.getTransactionCount(deployer.address);
    console.log(nonce);
    var startTIme = new Date().getTime();

    console.log("--------------Deploy Presale----------------")

    // Deploy Presale
    const Presale = await ethers.getContractFactory('Presale');
    const presale = await Presale.deploy({ nonce: nonce++ });

    tx = await ohm.setPresale(presale.address, { nonce: nonce++ });
    await tx.wait();
    tx = await ohm.statePresale(true, { nonce: nonce++ });
    await tx.wait();

    tx = await presale.initialize(ohm.address, dai.address, '100000', '100000000000000', DAO.address, { nonce: nonce++ });
    await tx.wait();

    // Sale Price

    tx = await presale.setSalePrice('0', '5000000000000000000', { nonce: nonce++ });
    await tx.wait();
    tx = await presale.setSalePrice('1', '3000000000000000000', { nonce: nonce++ });
    await tx.wait();
    tx = await presale.setSalePrice('2', '3000000000000000000', { nonce: nonce++ });
    await tx.wait();
    tx = await presale.setSalePrice('3', '3000000000000000000', { nonce: nonce++ });
    await tx.wait();

    // setNumberOfMembers

    tx = await presale.setNumberOfMembers('1', '50', { nonce: nonce++ });
    await tx.wait();
    tx = await presale.setNumberOfMembers('2', '50', { nonce: nonce++ });
    await tx.wait();
    tx = await presale.setNumberOfMembers('3', '50', { nonce: nonce++ });
    await tx.wait();

    // setMaxPurchase

    tx = await presale.setMaxPurchase('0', '5000000000000000000000', { nonce: nonce++ });
    await tx.wait();
    tx = await presale.setMaxPurchase('1', '334000000000', { nonce: nonce++ });
    await tx.wait();
    tx = await presale.setMaxPurchase('2', '834000000000', { nonce: nonce++ });
    await tx.wait();
    tx = await presale.setMaxPurchase('3', '1677000000000', { nonce: nonce++ });
    await tx.wait();

    if (!istest) {

    console.log("--------------Whitelist----------------")

    // whitelistUsers { BRONZE }

    tx = await presale.whitelistUsers([
    "0xC7341904586FbD2dD93F6de814579783Bb48E177",
    "0x40B431335533B3Ddb4e2fce2988f0f38B137cf90",
    "0x936209b0eD9339EA7E4A8E0ab8Dedf742005FF46",
    "0xf7744e3D3E648CeF16Fb333cb42cA1421e8d9e75",
    "0x718755337b3570A793c2F1010D772bFDD9e528e8",
    "0xe5964fD10170C8291CF97552284D995a006E67aE",
    "0xa0093D6CB42B85843dDFdF7e5672FaB440ac5082",
    "0x7Ce65502904da24B7709209157345E29ec5BD735",
    "0x4d42748371e4eBc32Ec9a81881b012aAb3351CF2",
    "0x616bD9f680A42fe5C8b8FCB3B35731Cf076cE5dF",
    "0x1198533d86810B8E53b3130245D43fDDF69C4F45",
    "0xC4340D3D7E7d900218d676813d78C7e8730F1320",
    "0x6E71bc1a0C50B7356EC5Ff9E54088e55ef63E1A8",
    "0xDBAE33cB544c344Fc279dcB036eec738ed96a211",
    "0xD6Da79f7211f456AFA9f10aaa92accf57f395478",
    "0x06803DaE59191B9119433534ee645f95CF32D62d",
    "0xe4268D71A8271c746408fF4A7E8f68b1dEe4898b",
    "0x00787efbdC5687270F3485aE689df213b76e1941",
    "0x296D02Ee3DA3B0Cd63e6dd6F0cEd03Eca67B22f6",
    "0x30f9B6187D417821f2B352A1Fc7c76547C08b8EF",
    "0x4c890Dc20f7D99D0135396A08d07d1518a45a1DD",
    "0xA8bBfd5Cf218EBe7fA3E6Da94B63790Ba6Bc11DE",
    "0x3692D074b988E146EAC4C304F3Bf3e533E576bCB",
    "0xbd12625f79413d31Fa3eFDFC54322C1f586647d4",
    "0xE1C7Cb303c250bAD00a9857FCf09927752B0B46F",
    "0x1b318a7Eb2FAEa1BfA1A6BbE28e43d8e49766b31",
    "0x4e46F0E3b0cB868cC55A2bCDf61d4b59365064Cc",
    "0x78a7e8387936e9B8F37483b8400907A621b4a3Ce",
    "0xa21455eBd7F12FEcC651f83f974A16cD851A40BE",
    "0x6Ece4Ba51109834965196535D9Ab7E541EF6A4f5",
    "0x641A6bD5429986Fec4613BFE0Ac35f62d841a179",
    "0x82fcA92920C6Fbd78Ae1A9532cFa7D0B64F84c6B",
    "0xD1F4152Fc565B7a662315851107dcE3827f89fAf"], '1', { nonce: nonce++ });

    await tx.wait();

    // whitelistUsers { GOLDEN }

    tx = await presale.whitelistUsers([
    "0xF319e446fc96eFC91BD513C5FF4180A0C17b68B9",
    "0xf9D3FF027dE380672b3bD7A7d112A79AD7cbf61d",
    "0xE09FA9EDB5F40915591F029f186CA34a3768aD3E",
    "0x0E9601A8f84a207A3A6574AF02dEF91a116Ff08b",
    "0xa491bA1F41Cbc74528EdC3B65654D3ef9806aC27",
    "0x586a4Ddc63C8b4235b734922Fc3Ec409766E6880",
    "0xe74cdDA1A840DC3a72148F8088660914816c02Ff",
    "0x881D1B10c367b71920bFea1f0343a1715d50b737",
    "0x65Af794C070A220232eB09c047A0F280a850dA69",
    "0xD800a40842Ffc4C08fF47b155ff05F5325b45eCd",
    "0xbB4Efc75C83ba019e5aC9F0E95Bc3386a9d17F00",
    "0xC39452cD9C172feb8EC429ACF12Dd7d049Fa6B76"], '2', { nonce: nonce++ });

    await tx.wait();

    // whitelistUsers { OG }

    tx = await presale.whitelistUsers([
    "0x52fcB76136C569A2f00F4976eB1A9666DC6305b8",
    "0x05DDD8B37531c774F95a53281FEb3Aa20B18e0Ec",
    "0x226d1e6C589A2642A24C93B4F35f06426970e30C",
    "0xCa2317D92251DFF5259bEFf8643dB6a0363FE09c",
    "0x488d684cF542bd34149a1332351D46681bFb7937",
    "0xc7C88DF363b0c808bE0c6D9C3F647f392fE06F14",
    "0x4d2132c5C7602009Bb35796415838b92fA0cDA9e",
    "0xca4A31c7ebcb126C60Fab495a4D7b545422f3AAF",
    "0x769038496db10dF8FB18CB7c071A5Cf12e4a99ce"], '3', { nonce: nonce++ });

    await tx.wait();
}

console.log("--------------Presale Finished----------------")

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