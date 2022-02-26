const GoodDogClubDAO = artifacts.require("./GoodDogClubDAO.sol");

module.exports = async (deployer, network, addresses) => {
    await deployer.deploy(GoodDogClubDAO, { gas: 5000000 });
};
