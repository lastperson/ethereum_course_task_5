const Reverter = require('./helpers/reverter');
const Asserts = require('./helpers/asserts');
const Debts = artifacts.require('./Debts.sol');

contract('Debts', function(accounts) {
  const reverter = new Reverter(web3);
  afterEach('revert', reverter.revert);

  const asserts = Asserts(assert);
  const OWNER = accounts[0];
  let debts;

  before('setup', () => {
    return Debts.deployed()
    .then(instance => debts = instance)
    .then(reverter.snapshot);
  });

  it('should fail on overflow when borrowing', () => {
    const borrower = accounts[3];
    const value = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => asserts.throws(debts.borrow(1, {from: borrower})));
  });

  it('should fail on underflow when repaying', () => {
    const borrower = accounts[3];
    const value = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    return Promise.resolve()
    .then(() => debts.borrow(1, {from: borrower}))
    .then(() => asserts.throws(debts.repay(value, {from: OWNER})));
  });

  it('should emit Borrowed event on borrow', () => {
    const borrower = accounts[3];
    const value = 1000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(result => {
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, 'Borrowed');
      assert.equal(result.logs[0].args.by, borrower);
      assert.equal(result.logs[0].args.value.valueOf(), value);
    });
  });

  it('should emit Repayed event on repay', () => {
    const borrower = accounts[3];
    const value = 1000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.repay(borrower, value, {from: OWNER}))
    .then(result => {
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, 'Repayed');
      assert.equal(result.logs[0].args.by, borrower);
      assert.equal(result.logs[0].args.value.valueOf(), value);
    })
  });

  it('should allow to borrow', () => {
    const borrower = accounts[3];
    const value = 5000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(value));
  });

  it('should allow to repay', () => {
    const borrower = accounts[3];
    const value = 1000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.repay(borrower, value, {from: OWNER}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(0));
  });

  it('should not allow owner to borrow', () => {
    const borrower = accounts[3];
    const value = 5000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: OWNER}))
    .then(() => debts.debts(OWNER))
    .then(asserts.equal(0));
  });

  it('should not allow not owner to repay', () => {
    const borrower = accounts[3];
    const value = 1000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.repay(borrower, value, {from: borrower}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(value));
  });

  it('should allow to view the owner address', () => {
      return Promise.resolve()
      .then(() => debts.owner())
      .then(asserts.equal(OWNER));
  });

  it('does addition work?', () => {
    const borrower = accounts[3];
    const value = 5000;
    const value2 = 5000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.borrow(value2, {from: borrower}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(10000));
  });

  it('does subtraction work?', () => {
    const borrower = accounts[3];
    const value = 1000;
    const value2 = 2000;
    const value3 = 1000;
    const value4 = 2000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.borrow(value2, {from: borrower}))
    .then(() => debts.repay(borrower, value3, {from: OWNER}))
    .then(() => debts.repay(borrower, value4, {from: OWNER}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(0));
  });

  it('null', () => {
    const borrower = accounts[3];
    return Promise.resolve()
    .then(() => debts.borrow(null, {from: borrower}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(0));
  });

  it('should allow others to see their debts', () => {
    const borrower = accounts[3];
    const borrower2 = accounts[5];
    const value = 1000;
    const value2 = 2000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.borrow(value2, {from: borrower2}))
    .then(() => debts.debts.call(borrower, {from: borrower}))
    .then(asserts.equal(value))
    .then(() => debts.debts.call(borrower2, {from: borrower2}))
    .then(asserts.equal(value2));
  });

  it('should allow owner to see others debts', () => {
    const borrower = accounts[3];
    const borrower2 = accounts[5];
    const value = 1000;
    const value2 = 2000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.borrow(value2, {from: borrower2}))
    .then(() => debts.debts.call(borrower, {from: OWNER}))
    .then(asserts.equal(value))
    .then(() => debts.debts.call(borrower2, {from: OWNER}))
    .then(asserts.equal(value2));
  });

});
