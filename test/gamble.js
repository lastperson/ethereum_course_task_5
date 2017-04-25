const Reverter = require('./helpers/reverter');
const Asserts = require('./helpers/asserts');
const Tote = artifacts.require('./Tote.sol');

contract('Tote', function(accounts) {
  const reverter = new Reverter(web3);
  afterEach('revert', reverter.revert);

  const asserts = Asserts(assert);
  const OWNER = accounts[0];
  let money;

  before('setup', () => {
    return Tote.deployed()
    .then(instance => money = instance)
    .then(reverter.snapshot);
  });

  it('soon');

});