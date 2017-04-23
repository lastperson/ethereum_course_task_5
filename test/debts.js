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

  it('should expect 0 when use values < 1 < 0 when borrowing', () => {
    const borrower = accounts[3];
    const value = 0.1;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(0));
  });

  it('should expect 0 when use values < 1 < 0 when repaying', () => {
    const borrower = accounts[3];
    const value = 1000;
    const value2 = 0.1;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.repay(borrower, value2, {from: OWNER}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(value));
  });

/*At the idea stage... maybe will be written correctly soon...

  it('should fail when using address without quotes', () => {
    const borrower = accounts[3];
    const value = 1000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.repay(0x84400d8d9a244482cb7a0a16060bfd42339bbd5b, 1000, {from: OWNER}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(value));
  });

  it('fail when try to use cyrillic word on same address', () => {
    var borrower = "0x84400d8d9a244482cb7a0a16060bfd42339bbd5b";
    var cyrillic = "0x84400d8d9a244482сb7a0a16060bfd42339bbd5b";
    const value = 1000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.borrow(value, {from: cyrillic}))
    .then(() => debts.repay(borrower, value, {from: OWNER}))
    .then(() => debts.repay(cyrillic, value, {from: OWNER}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(value));
  });

  it('fail when address is longer', () => {
    const borrower = "0x2ddd3ebf344e93e68fd16e0eeb0a69e576148fcf1";
    return Promise.resolve()
    .then(() => asserts.throws(debts.repay(borrower, 1, {from: OWNER})))
  });

  it('fail when address is shorter', () => {
    const borrower = "0x2ddd3ebf344e93e68fd16e0eeb0a69e576148fc";
    return Promise.resolve()
    .then(() => asserts.throws(debts.repay(borrower, 1, {from: OWNER})))
  });

  it('should fail on string type in amount when borrowing', () => {
    const borrower = accounts[3];
    const value = 1000;
    return Promise.resolve()
    .then(() => debts.borrow(value, {from: borrower}))
    .then(() => debts.borrow('qwerty', {from: borrower}))
    .then(() => debts.debts(borrower))
    .then(asserts.equal(value));
  });
*/

});
