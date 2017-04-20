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

  it('should allow to repay', () => {
    const borrower = accounts[3];
    const value = 1000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.repay(borrower, value, {from: OWNER}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(0));
  });

  it('should fail on overflow when borrowing', () => {
    const borrower = accounts[3];
    const value = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => asserts.throws(debts.borrow(1, {from: borrower})));
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

  it('should allow to borrow', () => {
    const borrower = accounts[3];
    const value = 5000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(5000));
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
    .then(asserts.equal(1000));
  });

  it('should fail on string type in amount when borrowing', () => {
    const borrower = accounts[3];
    const value = 'qwertyuiop';
    return Promise.resolve()
    .then(() => asserts.throws(debts.borrow(value, {from: borrower})));
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

  it('does safeAdd work?', () => {
    const borrower = accounts[3];
    const value = 5000;
    const value2 = -1000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => asserts.throws(debts.borrow(value2, {from: borrower})));
  });

  it('does safeSub work?', () => {
    const borrower = accounts[3];
    const value = 1000;
    const value2 = 2000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => asserts.throws(debts.repay(value2, {from: OWNER})));
  });

/*it('NULL', () => {
    const borrower = accounts[3];
    const value = null;
    return Promise.resolve()
    .then(() => asserts.throws(debts.borrow(value, {from: borrower}));
  });*/

  it('should fail on ASCII when borrowing', () => {
    const borrower = accounts[3];
    const value = '&#32';
    return Promise.resolve()
    .then(() => asserts.throws(debts.borrow(value, {from: borrower})));
  });

  it('fail when try to use cyrillic word on same address', () => {
    const borrower = "0xf95ccc102cf5bdac0b6f76f41021124a58754f4d";
    const cyrillic = "0xf95ccc102сf5bdac0b6f76f41021124a58754f4d";
    const value = 1000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => asserts.throws(debts.borrow(value, {from: cyrillic})))
    .then(() => debts.repay(borrower, value, {from: OWNER}))
    .then(() => asserts.throws(debts.borrow(cyrillic, value, {from: OWNER})))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(0));
  });

  it('should fail to repay when using minus number through parseInt', () => {
    const borrower = accounts[3];
    const value = parseInt("15",10);
    const value2 = parseInt("-15",10);
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => asserts.throws(debts.borrow(value2, {from: borrower})))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(15));
  });

});
