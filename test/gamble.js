const Reverter = require('./helpers/reverter');
const Asserts = require('./helpers/asserts');
const Tote = artifacts.require('./Tote.sol');

contract('Tote', function(accounts) {
  const reverter = new Reverter(web3);
  afterEach('revert', reverter.revert);

  const asserts = Asserts(assert);
  const ADMIN = accounts[0];
  const gambler1 = accounts[1];
  const gambler2 = accounts[2];
  const gambler3 = accounts[3];
  const gambler4 = accounts[4];
  const gambler5 = accounts[5];


  let money;

  before('setup', () => {
    return Tote.deployed()
    .then(instance => money = instance)
    .then(reverter.snapshot);
  });

  //CREATE EVENT

  it('should allow to create event', () => {
    console.log("CREATE EVENT");
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.getA(0, {from: ADMIN}))
    .then(asserts.equal("Team A"))
    .then(() => money.getB(0, {from: ADMIN}))
    .then(asserts.equal("Team B"))
  });

  it('should emit Event_was_created event', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(result => {
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, 'Event_was_created')
    });
  });

  //MAKE BET

  it('should allow to create bet', () => {
    console.log("MAKE BET");
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, 500, "Team A", {from: gambler1}))
    .then(() => money.getBet(0, {from: ADMIN}))
    .then(asserts.equal(500));
  });

  it('should emit Bet_was_created event', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, 500, "Team A", {from: gambler1}))
    .then(result => {
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, 'Bet_was_created')
    });
  });

  it('is count_A increment works', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, 500, "Team A", {from: gambler1}))
    .then(() => money.make_bet(0, 1500, "Team A", {from: gambler1}))
    .then(() => money.getCountA(0, {from: ADMIN}))
    .then(asserts.equal(2));
  }); 

  it('is count_B increment works', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, 500, "Team B", {from: gambler1}))
    .then(() => money.make_bet(0, 1500, "Team B", {from: gambler1}))
    .then(() => money.getCountB(0, {from: ADMIN}))
    .then(asserts.equal(2));
    
  }); 

  it('is value_A increment works', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, 500, "Team A", {from: gambler1}))
    .then(() => money.make_bet(0, 1500, "Team A", {from: gambler1}))
    .then(() => money.getValueA(0, {from: ADMIN}))
    .then(asserts.equal(2000));
  });

  it('is value_B increment works', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, 500, "Team B", {from: gambler1}))
    .then(() => money.make_bet(0, 1500, "Team B", {from: gambler1}))
    .then(() => money.getValueB(0, {from: ADMIN}))
    .then(asserts.equal(2000));
  });

  //NOMINATE WINNER

  it('should allow to nominate winner', () => {
    console.log("NOMINATE WINNER");
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, 1000, "Team A", {from: gambler1}))
    .then(() => money.make_bet(0, 200, "Team A", {from: gambler2}))
    .then(() => money.make_bet(0, 400, "Team B", {from: gambler3}))
    .then(() => money.nominate_winner(0, "Team A", {from: ADMIN}))
    .then(() => money.getStatus(0, {from: ADMIN}))
    .then(asserts.equal("Close"));
  });

  it('should emit Event_was_closed event', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, 1000, "Team A", {from: gambler1}))
    .then(() => money.make_bet(0, 200, "Team A", {from: gambler2}))
    .then(() => money.make_bet(0, 400, "Team B", {from: gambler3}))
    .then(() => money.nominate_winner(0, "Team A", {from: ADMIN}))
    .then(result => {
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, 'Event_was_closed')
    });
  });

  it('shold allow to pay money to winner', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, 1000, "Team A", {from: gambler1}))
    .then(() => money.make_bet(0, 200, "Team A", {from: gambler2}))
    .then(() => money.make_bet(0, 400, "Team B", {from: gambler3}))
    .then(() => money.make_bet(0, 600, "Team B", {from: gambler4}))
    .then(() => money.make_bet(0, 3200, "Team A", {from: gambler5}))
    .then(() => money.nominate_winner(0, "Team A", {from: ADMIN}))
    .then(() => money.money(gambler1))
    .then(asserts.equal(1204))
    .then(() => money.money(gambler2))
    .then(asserts.equal(240))
    .then(() => money.money(gambler5))
    .then(asserts.equal(3854));
  });

  it('shold allow to pay money to admin', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, 1000, "Team A", {from: gambler1}))
    .then(() => money.make_bet(0, 200, "Team A", {from: gambler2}))
    .then(() => money.make_bet(0, 400, "Team B", {from: gambler3}))
    .then(() => money.make_bet(0, 600, "Team B", {from: gambler4}))
    .then(() => money.make_bet(0, 3200, "Team A", {from: gambler5}))
    .then(() => money.nominate_winner(0, "Team A", {from: ADMIN}))
    .then(() => money.money(ADMIN))
    .then(asserts.equal(100));
  });

  //OTHER

  it('soon...', () => {
    console.log("OTHER");
  
  });


});
