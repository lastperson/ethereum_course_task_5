const Tote = artifacts.require('./Tote.sol');

module.exports = deployer => {
  deployer.deploy(Tote);
};
