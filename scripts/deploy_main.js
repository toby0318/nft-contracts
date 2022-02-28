const { ethers, waffle } = require("hardhat");
const colors = require('colors');

const OHMContractABI = require('../artifacts/contracts/BegoikoERC20.sol/BegoikoERC20Token.json').abi;
const IERC20 = require('../artifacts/contracts/BegoikoERC20.sol/IERC20.json').abi;
const routerAbi = require("../artifacts/contracts/mocks/dexRouter.sol/PancakeswapRouter.json").abi;
const factoryAbi = require("../artifacts/contracts/mocks/dexfactory.sol/PancakeswapFactory.json").abi;

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
    const firstEpochBlock = '30138071';

    // What epoch will be first epoch
    const firstEpochNumber = '1';

    // How many blocks are in each epoch
    const epochLengthInBlocks = '2200';

    // Initial reward rate for epoch
    const initialRewardRate = '3000';

    // Ethereum 0 address, used when toggling changes in treasury
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    // DAI bond BCV
    const daiBondBCV = '369';

    // WFTM bond BCV
    const wFTMBondBCV = '300';

    // DAILP bond BCV
    const daiLPBondBCV = '500';

    // Bond vesting length in blocks. 33110 ~ 9 hours
    const bondVestingLength = '33110';

    // Min bond price
    const minBondPrice = '500';

    // Max bond payout
    const maxBondPayout = '6239676'

    // DAO fee for bond
    const bondFee = '200';

    // Max debt bond can take on
    const maxBondDebt = '16520000000000';

    // Initial Bond debt
    const intialBondDebt = '0'

    const largeApproval = '100000000000000000000000000000000';

    // Deploy OHM
    // const OHM = await ethers.getContractFactory('BegoikoERC20Token');
    // const ohm = await OHM.deploy({nonce : nonce++});
    // await ohm.deployed();

    // const dai = {address : process.env.DAI};

    // const wFTM = {address : process.env.WFTM};


    /* ----------- test ------------- */
    ////////////////////////////////////

    const initialMint = '10000000000000000000000000000';

    // var exchangeRouter;
    // var exchangeFactory;
    // var wETH;
    // const ohmAddress = "0xFEA12359959B382eD70c3d77Ee1d3ecbA2af5E6A";
    const daiAddress = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e";
    const wFTMAddress = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
    const exchangeRouterAddress = "0xF491e7B69E4244ad4002BC14e878a34207E38c29";
    const exchangeFactoryAddress = "0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3";

    // const ohm = new ethers.Contract(ohmAddress, OHMContractABI, deployer);

    const dai = new ethers.Contract(daiAddress, IERC20, deployer);
    // const wFTM = new ethers.Contract(wFTMAddress, IERC20, deployer);

    const exchangeRouter = new ethers.Contract(exchangeRouterAddress, routerAbi, deployer);
    const exchangeFactory = new ethers.Contract(exchangeFactoryAddress, factoryAbi, deployer);

    // Deploy OHM
    const OHM = await ethers.getContractFactory('BegoikoERC20Token');
    const ohm = await OHM.deploy();
    await ohm.deployed();

    // Deploy DAI
    // const DAI = await ethers.getContractFactory('DAI');
    // const dai = await DAI.deploy(0);
    // await dai.deployed();

    // Deploy 10,000,000 mock DAI and mock Frax
    // await dai.mint(deployer.address, initialMint);

    {

        tx = await dai.approve(exchangeRouter.address, ethers.utils.parseUnits("1000000", 18));

        tx = await exchangeFactory.createPair(ohm.address, dai.address);
        var daiLP = await exchangeFactory.getPair(ohm.address, dai.address);
    }

    /* ----------- test ------------- */
    ////////////////////////////////////

    var nonce = await provider.getTransactionCount(deployer.address);
    console.log(nonce);
    var startTIme = new Date().getTime();

    console.log("--------------deploy Begoiko finish----------------")
        // Deploy treasury
        //@dev changed function in treaury from 'valueOf' to 'valueOfToken'... solidity function was coflicting w js object property name
    const Treasury = await ethers.getContractFactory('BegoikoTreasury');
    const treasury = await Treasury.deploy(ohm.address, dai.address, daiLP, 0, { nonce: nonce++ });
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

    // Deploy Presale
    const Presale = await ethers.getContractFactory('Presale');
    const presale = await Presale.deploy({ nonce: nonce++ });
    tx = await presale.initialize(ohm.address, dai.address, '100000000', '100000000000', '10000000000000', DAO.address, { nonce: nonce++ });
    await tx.wait();
    tx = await ohm.setPresale(presale.address, { nonce: nonce++ });
    await tx.wait();
    tx = await ohm.statePresale(true, { nonce: nonce++ });
    await tx.wait();

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

    console.log("--------------deploy finish----------------")

    {
        // queue and toggle DAI and Frax bond reserve depositor
        var tx = await treasury.queue('0', daiBond.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        await tx.wait();
        tx = await treasury.toggle('0', daiBond.address, zeroAddress, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        await tx.wait();

        tx = await treasury.queue('0', wftmBond.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        await tx.wait();
        tx = await treasury.toggle('0', wftmBond.address, zeroAddress, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        await tx.wait();

        tx = await treasury.queue('2', wFTMAddress, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        await tx.wait();
        tx = await treasury.toggle('2', wFTMAddress, zeroAddress, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        await tx.wait();

        tx = await treasury.queue('0', daiLpBond.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        await tx.wait();
        tx = await treasury.toggle('0', daiLpBond.address, zeroAddress, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        await tx.wait();

        tx = await treasury.queue('5', daiLP, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        await tx.wait();
        tx = await treasury.toggle('5', daiLP, olympusBondingCalculator.address, { nonce: nonce++, gasLimit: "200000", gasPrice: "200000000000" });
        await tx.wait();

        console.log("--------------treasury 1----------------")
            // Set DAI and Frax bond terms
        tx = await daiBond.initializeBondTerms(daiBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, { nonce: nonce++ });
        tx = await wftmBond.initializeBondTerms(wFTMBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, { nonce: nonce++ });
        tx = await daiLpBond.initializeBondTerms(daiLPBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, { nonce: nonce++ });


        // Set staking for DAI and Frax bond
        tx = await daiBond.setStaking(staking.address, stakingHelper.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        tx = await wftmBond.setStaking(staking.address, stakingHelper.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        tx = await daiLpBond.setStaking(staking.address, stakingHelper.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });


        // Initialize sOHM and set the index
        tx = await sOHM.initialize(staking.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        //await tx.wait();
        tx = await sOHM.setIndex(initialIndex, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        //await tx.wait();

        console.log("-------------- bonds and sBEGO ----------------");

        // set distributor contract and warmup contract
        tx = await staking.setContract('0', distributor.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        await tx.wait();
        tx = await staking.setContract('1', stakingWarmup.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        await tx.wait();

        // Set treasury for OHM token
        tx = await ohm.setVault(treasury.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        // Add staking contract as distributor recipient
        tx = await distributor.addRecipient(staking.address, initialRewardRate, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });

        // queue and toggle reward manager
        tx = await treasury.queue('8', distributor.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        tx = await treasury.toggle('8', distributor.address, zeroAddress, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });

        // queue and toggle deployer reserve depositor
        tx = await treasury.queue('0', deployer.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        tx = await treasury.toggle('0', deployer.address, zeroAddress, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });

        console.log("final : ", deployer.address);
        // queue and toggle liquidity depositor
        tx = await treasury.queue('4', deployer.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });

        tx = await treasury.toggle('4', deployer.address, zeroAddress, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });

        tx = await treasury.queue('4', daiLpBond.address, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });

        tx = await treasury.toggle('4', daiLpBond.address, zeroAddress, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
        // Stake OHM through helper
    }
    console.log("-------------- environment ----------------");

    var tx = await dai.approve(treasury.address, largeApproval, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
    var tx = await ohm.approve(stakingHelper.address, '1000000000000000000000000', { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });
    var tx = await dai.approve(daiBond.address, largeApproval, { nonce: nonce++, gasLimit: "100000", gasPrice: "200000000000" });

    console.log(" bego.balanceOf", String(await ohm.balanceOf(deployer.address)))
    console.log(" dai.balanceOf", String(await dai.balanceOf(deployer.address)))

    // console.log("debtRatio", ethers.utils.formatUnits(await daiBond.debtRatio()));

    // console.log("bondPriceInUSD", ethers.utils.formatUnits(await daiBond.bondPriceInUSD()));

    // console.log(ethers.utils.formatUnits(await daiBond.payoutFor("10000000000000000000"), 18));

    // await daiBond.deposit('10000000000000000000', '60000', deployer.address, { nonce: nonce++ });
    //dai, wFTM - ohm add liquidity
    console.log("OHM: " + ohm.address);
    console.log("DAI: " + dai.address);
    var end = new Date().getTime();


    // console.log("LP debtRatio", ethers.utils.formatUnits(await daiLpBond.debtRatio()));
    // console.log("LP bondPriceInUSD", ethers.utils.formatUnits(await daiLpBond.bondPriceInUSD()));

    console.log("deploy ended ", (Number(end) - startTIme) / 1000)

    // var daiLP = await exchangeFactory.getPair(ohm.address,dai.address);
    // var wFTMLP = await exchangeFactory.getPair(ohm.address,dai.address);

    console.log("DAI_ADDRESS: ", dai.address);
    console.log("BEGO_ADDRESS: ", ohm.address);
    console.log("STAKING_ADDRESS: ", staking.address);
    console.log("STAKING_HELPER_ADDRESS: ", stakingHelper.address);
    console.log("SBEGO_ADDRESS: ", sOHM.address);
    console.log("DISTRIBUTOR_ADDRESS: ", distributor.address);
    console.log("BONDINGCALC_ADDRESS: ", olympusBondingCalculator.address);
    console.log("TREASURY_ADDRESS: ", treasury.address);
    console.log("PRESALE_ADDRESS: ", presale.address);

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