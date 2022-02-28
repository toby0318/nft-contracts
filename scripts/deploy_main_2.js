const { ethers, waffle } = require("hardhat");
const colors = require('colors');

const OHMContractABI = require('../artifacts/contracts/BegoikoERC20.sol/BegoikoERC20Token.json').abi;
const IERC20 = require('../artifacts/contracts/BegoikoERC20.sol/IERC20.json').abi;

async function main() {

    const [deployer] = await ethers.getSigners();

    const provider = waffle.provider;

    var DAO = { address: process.env.DAO };
    console.log('Deploying contracts with the account: ' + deployer.address);
    console.log('Deploying contracts with the account: ' + DAO.address);

    /* --------------- parameters --------------- */
    /////////////////////////////////////
    // Initial staking index
    const initialIndex = '7675210820';

    // First block epoch occurs
    const firstEpochBlock = '31089857';

    // What epoch will be first epoch
    const firstEpochNumber = '1';

    // How many blocks are in each epoch
    const epochLengthInBlocks = '41432'; // 8 hours

    // Initial reward rate for epoch
    const initialRewardRate = '5000';

    // Ethereum 0 address, used when toggling changes in treasury
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    // DAI bond BCV
    const daiBondBCV = '369';

    // WFTM bond BCV
    const wFTMBondBCV = '300';

    // DAILP bond BCV
    const daiLPBondBCV = '500';

    // Bond vesting length in blocks. 33110 ~ 6 hours
    const bondVestingLength = '617143'; // 5 days

    // Min bond price
    const minBondPrice = '450'; // 4.5 dai

    // Min bond price for Wftm bond
    const minBondPriceWftm = '210'; // 2.1 wftm

    // Min bond price for lp bond
    const minBondPricelp = '100'; // equals to dai price

    // Max bond payout
    const maxBondPayout = '9000'; // 9%

    // DAO fee for bond
    const bondFee = '200'; // 2%

    // Max debt bond can take on
    const maxBondDebt = '1000000000000000000000000';

    // Initial Bond debt
    const intialBondDebt = '0';

    // Initial Reserver amount
    // Sold: 9,718
    // total x2: 19,436
    const initialReserve = '19436000000000'; //sellAmount(from presale)*2; 

    const ohmAddress = "0x887EAE33c6E6336aD3cf857c1B1D6793e5057189";
    const daiAddress = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e";
    const wFTMAddress = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
    const daiLP = "0xa25ebf7a042af9898e239f0c5fc92b2230687955";
    if (daiLP === "") {
        console.log("You have to set dai-bego lp address.");
        return;
    }

    const ohm = new ethers.Contract(ohmAddress, OHMContractABI, deployer);

    const dai = new ethers.Contract(daiAddress, IERC20, deployer);

    var nonce = await provider.getTransactionCount(deployer.address);
    console.log(nonce);
    var startTIme = new Date().getTime();

    console.log("--------------deploy Begoiko finish----------------")
        // Deploy treasury
        //@dev changed function in treaury from 'valueOf' to 'valueOfToken'... solidity function was coflicting w js object property name
    const Treasury = await ethers.getContractFactory('BegoikoTreasury');
    const treasury = await Treasury.deploy(ohm.address, dai.address, daiLP, initialReserve, 0, { nonce: nonce++ });
    //await treasury.deployed();

    // Deploy bonding calc
    const OlympusBondingCalculator = await ethers.getContractFactory('BegoikoBondingCalculator');
    const olympusBondingCalculator = await OlympusBondingCalculator.deploy(ohm.address, { nonce: nonce++ });
    //await olympusBondingCalculator.deployed();

    // Deploy staking distributor
    const Distributor = await ethers.getContractFactory('Distributor');
    const distributor = await Distributor.deploy(treasury.address, ohm.address, epochLengthInBlocks, firstEpochBlock, { nonce: nonce++ });
    //await distributor.deployed();

    // Deploy sOHM
    const SOHM = await ethers.getContractFactory('sBegoiko');
    const sOHM = await SOHM.deploy({ nonce: nonce++ });
    //await sOHM.deployed();

    // Deploy Staking
    const Staking = await ethers.getContractFactory('BegoikoStaking');
    const staking = await Staking.deploy(ohm.address, sOHM.address, epochLengthInBlocks, firstEpochNumber, firstEpochBlock, { nonce: nonce++ });
    //await staking.deployed();

    // Deploy staking warmpup
    const StakingWarmpup = await ethers.getContractFactory('StakingWarmup');
    const stakingWarmup = await StakingWarmpup.deploy(staking.address, sOHM.address, { nonce: nonce++ });
    //await stakingWarmup.deployed();

    // Deploy staking helper
    const StakingHelper = await ethers.getContractFactory('StakingHelper');
    const stakingHelper = await StakingHelper.deploy(staking.address, ohm.address, { nonce: nonce++ });
    //await stakingHelper.deployed();

    //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
    const DAIBond = await ethers.getContractFactory('BegoikoBondDepository');
    const daiBond = await DAIBond.deploy(ohm.address, dai.address, treasury.address, DAO.address, zeroAddress, { nonce: nonce++ });

    const daiLpBond = await DAIBond.deploy(ohm.address, daiLP, treasury.address, DAO.address, olympusBondingCalculator.address, { nonce: nonce++ });

    const wftmBond = await DAIBond.deploy(ohm.address, wFTMAddress, treasury.address, DAO.address, zeroAddress, { nonce: nonce++ });

    const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    const redeemHelper = await RedeemHelper.deploy({ nonce: nonce++ });

    console.log("--------------deploy finish----------------")

    // queue and toggle DAI and Frax bond reserve depositor
    var tx = await treasury.queue('0', daiBond.address, { nonce: nonce++ });
    await tx.wait();
    tx = await treasury.toggle('0', daiBond.address, zeroAddress, { nonce: nonce++ });
    await tx.wait();

    tx = await treasury.queue('0', wftmBond.address, { nonce: nonce++ });
    await tx.wait();
    tx = await treasury.toggle('0', wftmBond.address, zeroAddress, { nonce: nonce++ });
    await tx.wait();

    tx = await treasury.queue('2', wFTMAddress, { nonce: nonce++ });
    await tx.wait();
    tx = await treasury.toggle('2', wFTMAddress, zeroAddress, { nonce: nonce++ });
    await tx.wait();

    tx = await treasury.queue('0', daiLpBond.address, { nonce: nonce++ });
    await tx.wait();
    tx = await treasury.toggle('0', daiLpBond.address, zeroAddress, { nonce: nonce++ });
    await tx.wait();

    tx = await treasury.queue('5', daiLP, { nonce: nonce++ });
    await tx.wait();
    tx = await treasury.toggle('5', daiLP, olympusBondingCalculator.address, { nonce: nonce++ });
    await tx.wait();

    console.log("--------------treasury 1----------------")
        // Set DAI and Frax bond terms
    tx = await daiBond.initializeBondTerms(daiBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, { nonce: nonce++ });
    await tx.wait();
    tx = await wftmBond.initializeBondTerms(wFTMBondBCV, bondVestingLength, minBondPriceWftm, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, { nonce: nonce++ });
    await tx.wait();
    tx = await daiLpBond.initializeBondTerms(daiLPBondBCV, bondVestingLength, minBondPricelp, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, { nonce: nonce++ });
    await tx.wait();


    // Set staking for DAI and Frax bond
    tx = await daiBond.setStaking(staking.address, stakingHelper.address, { nonce: nonce++ });
    await tx.wait();
    tx = await wftmBond.setStaking(staking.address, stakingHelper.address, { nonce: nonce++ });
    await tx.wait();
    tx = await daiLpBond.setStaking(staking.address, stakingHelper.address, { nonce: nonce++ });
    await tx.wait();


    // Initialize sOHM and set the index
    tx = await sOHM.initialize(staking.address, { nonce: nonce++ });
    await tx.wait();
    //await tx.wait();
    tx = await sOHM.setIndex(initialIndex, { nonce: nonce++ });
    await tx.wait();
    //await tx.wait();

    console.log("-------------- bonds and sBEGO ----------------");

    // set distributor contract and warmup contract
    tx = await staking.setContract('0', distributor.address, { nonce: nonce++ });
    await tx.wait();
    tx = await staking.setContract('1', stakingWarmup.address, { nonce: nonce++ });
    await tx.wait();

    // Set treasury for OHM token
    tx = await ohm.setVault(treasury.address, { nonce: nonce++ });
    await tx.wait();
    // Add staking contract as distributor recipient
    tx = await distributor.addRecipient(staking.address, initialRewardRate, { nonce: nonce++ });
    await tx.wait();

    // queue and toggle reward manager
    tx = await treasury.queue('8', distributor.address, { nonce: nonce++ });
    await tx.wait();
    tx = await treasury.toggle('8', distributor.address, zeroAddress, { nonce: nonce++ });
    await tx.wait();

    // queue and toggle deployer reserve depositor
    tx = await treasury.queue('0', deployer.address, { nonce: nonce++ });
    await tx.wait();
    tx = await treasury.toggle('0', deployer.address, zeroAddress, { nonce: nonce++ });
    await tx.wait();

    console.log("final : ", deployer.address);
    // queue and toggle liquidity depositor
    tx = await treasury.queue('4', deployer.address, { nonce: nonce++ });
    await tx.wait();

    tx = await treasury.toggle('4', deployer.address, zeroAddress, { nonce: nonce++ });
    await tx.wait();

    tx = await treasury.queue('4', daiLpBond.address, { nonce: nonce++ });
    await tx.wait();

    tx = await treasury.toggle('4', daiLpBond.address, zeroAddress, { nonce: nonce++ });
    await tx.wait();
    // Stake OHM through helper

    console.log("-------------- staking end ----------------");

    tx = await redeemHelper.addBondContract(daiBond.address, { nonce: nonce++ });
    await tx.wait();
    tx = await redeemHelper.addBondContract(daiLpBond.address, { nonce: nonce++ });
    await tx.wait();
    tx = await redeemHelper.addBondContract(wftmBond.address, { nonce: nonce++ });
    await tx.wait();
    // }
    console.log("-------------- environment ----------------");

    console.log(" bego.balanceOf", String(await ohm.balanceOf(deployer.address)));
    console.log(" dai.balanceOf", String(await dai.balanceOf(deployer.address)));
    var end = new Date().getTime();

    console.log("-------------- deploy ended -----------------", (Number(end) - startTIme) / 1000);

    console.log("DAI_ADDRESS: ", dai.address);
    console.log("BEGO_ADDRESS: ", ohm.address);
    console.log("STAKING_ADDRESS: ", staking.address);
    console.log("STAKING_HELPER_ADDRESS: ", stakingHelper.address);
    console.log("SBEGO_ADDRESS: ", sOHM.address);
    console.log("DISTRIBUTOR_ADDRESS: ", distributor.address);
    console.log("BONDINGCALC_ADDRESS: ", olympusBondingCalculator.address);
    console.log("TREASURY_ADDRESS: ", treasury.address);
    console.log("REDEEM_HELPER_ADDRESS: ", redeemHelper.address);

    console.log("DAI ---------- ");
    console.log('bondAddress: "' + daiBond.address + '"');
    console.log('reserveAddress: "' + dai.address + '"');

    console.log("WFTM ---------- ");
    console.log('bondAddress: "' + wftmBond.address + '"');
    console.log('reserveAddress: "' + wFTMAddress + '"');

    console.log('LP ---------- "');
    console.log('bondAddress: "' + daiLpBond.address + '"');
    console.log('reserveAddress: "' + daiLP + '"');
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })