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

  it('shold allow only for admin', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: gambler1}))
    .then(() => asserts.throws(money.getA(0, {from: ADMIN})));
  });

  //MAKE BET

  it('should allow to create bet', () => {
    console.log("MAKE BET");
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 500}))
    .then(() => money.getBet(0, 0, {from: ADMIN}))
    .then(asserts.equal(500));
  });

  it('should emit Bet_was_created event', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 500}))
    .then(result => {
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, 'Bet_was_created')
    });
  });

  it('is event balance increment works?', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 500}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 1500}))
    .then(() => money.getBalance(0, {from: ADMIN}))
    .then(asserts.equal(2000));
  }); 

  it('is count_A increment works?', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 500}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 1500}))
    .then(() => money.getCountA(0, {from: ADMIN}))
    .then(asserts.equal(2));
  }); 

  it('is count_B increment works?', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 500}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 1500}))
    .then(() => money.getCountB(0, {from: ADMIN}))
    .then(asserts.equal(2));
    
  }); 

  it('is value_A increment works?', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 500}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 1500}))
    .then(() => money.getValueA(0, {from: ADMIN}))
    .then(asserts.equal(2000));
  });

  it('is value_B increment works?', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 500}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 1500}))
    .then(() => money.getValueB(0, {from: ADMIN}))
    .then(asserts.equal(2000));
  });

  it('is event balance increment works on second event?', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 500}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 500}))
    .then(() => money.create_event("Team C", "Team D", {from: ADMIN}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 500}))
    .then(() => money.make_bet(1, "Team D", {from: gambler1, value: 1500}))
    .then(() => money.getBalance(1, {from: ADMIN}))
    .then(asserts.equal(2000));
  }); 

  it('is count_A increment works on second event?', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 500}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 100}))
    .then(() => money.create_event("Team C", "Team D", {from: ADMIN}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 500}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 500}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 1500}))
    .then(() => money.getCountA(1, {from: ADMIN}))
    .then(asserts.equal(3));
  }); 

  it('is count_B increment works on second event?', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 500}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 100}))
    .then(() => money.create_event("Team C", "Team D", {from: ADMIN}))
    .then(() => money.make_bet(1, "Team D", {from: gambler1, value: 500}))
    .then(() => money.make_bet(1, "Team D", {from: gambler1, value: 1500}))
    .then(() => money.make_bet(1, "Team D", {from: gambler1, value: 1500}))
    .then(() => money.getCountB(1, {from: ADMIN}))
    .then(asserts.equal(3));
    
  }); 

  it('is value_A increment works on second event?', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 500}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 100}))
    .then(() => money.create_event("Team C", "Team D", {from: ADMIN}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 500}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 1500}))
    .then(() => money.getValueA(1, {from: ADMIN}))
    .then(asserts.equal(2000));
  });

  it('is value_B increment works on second event?', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 500}))
    .then(() => money.make_bet(0, "Team B", {from: gambler1, value: 100}))
    .then(() => money.create_event("Team C", "Team D", {from: ADMIN}))
    .then(() => money.make_bet(1, "Team D", {from: gambler1, value: 500}))
    .then(() => money.make_bet(1, "Team D", {from: gambler1, value: 1500}))
    .then(() => money.getValueB(1, {from: ADMIN}))
    .then(asserts.equal(2000));
  });

  it('should fail when team is not exist', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team C", {from: gambler1, value: 500}))
    .then(() => money.getBetCount(0, {from: ADMIN}))
    .then(asserts.equal(0));
  });

  it('is increment works in second event?', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 500}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 500}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 500}))
    .then(() => money.create_event("Team C", "Team D", {from: ADMIN}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 500}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 500}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 500}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 500}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 500}))
    .then(() => money.getBetCount(1, {from: ADMIN}))
    .then(asserts.equal(5));
  });

  it('shold allow only for user', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: ADMIN, value: 500}))
    .then(() => money.getBetCount(0, {from: ADMIN}))
    .then(asserts.equal(0));
  });

  it('should fail when event is closed', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.close_event(0, "Team A", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 500}))
    .then(() => money.getBetCount(0, {from: ADMIN}))
    .then(asserts.equal(0));
  });

  //CLOSE EVENT

  it('should allow to close event', () => {
    console.log("CLOSE EVENT");
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.close_event(0, "Team A", {from: ADMIN}))
    .then(() => money.getStatus(0, {from: ADMIN}))
    .then(asserts.equal("Closed"));
  });

  it('should emit Event_was_closed event', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.close_event(0, "Team A", {from: ADMIN}))
    .then(result => {
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, 'Event_was_closed')
    });
  });

  it('should fail when team is not exist', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.close_event(0, "Team C", {from: ADMIN}))
    .then(() => money.getStatus(0, {from: ADMIN}))
    .then(asserts.equal("Open"));

  });
  
  it('shold allow only for admin', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.close_event(0, "Team A", {from: gambler1}))
    .then(() => money.getStatus(0, {from: ADMIN}))
    .then(asserts.equal("Open"));

  });

  //GIVING OUT

  it('shold allow to pay money to winners', () => {
    console.log("GIVING OUT MONEY");
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 1000}))
    .then(() => money.make_bet(0, "Team A", {from: gambler2, value: 200}))
    .then(() => money.make_bet(0, "Team B", {from: gambler3, value: 400}))
    .then(() => money.make_bet(0, "Team B", {from: gambler4, value: 600}))
    .then(() => money.make_bet(0, "Team A", {from: gambler5, value: 3200}))
    .then(() => money.close_event(0, "Team A", {from: ADMIN}))
    .then(() => money.give_out_money(0, {from: ADMIN}))
    .then(() => money.money(gambler1))
    .then(asserts.equal(1204))
    .then(() => money.money(gambler2))
    .then(asserts.equal(240))
    .then(() => money.money(gambler3))
    .then(asserts.equal(0))
    .then(() => money.money(gambler4))
    .then(asserts.equal(0))
    .then(() => money.money(gambler5))
    .then(asserts.equal(3854));
  });

  it('shold allow to pay money to admin', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 1000}))
    .then(() => money.make_bet(0, "Team A", {from: gambler2, value: 200}))
    .then(() => money.make_bet(0, "Team B", {from: gambler3, value: 400}))
    .then(() => money.make_bet(0, "Team B", {from: gambler4, value: 600}))
    .then(() => money.make_bet(0, "Team A", {from: gambler5, value: 3200}))
    .then(() => money.close_event(0, "Team A", {from: ADMIN}))
    .then(() => money.give_out_money(0, {from: ADMIN}))
    .then(() => money.money(ADMIN))
    .then(asserts.equal(100));
  });
  
  it('shold allow to pay money to winner on second event', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler2, value: 200}))
    .then(() => money.make_bet(0, "Team B", {from: gambler3, value: 400}))
    .then(() => money.create_event("Team C", "Team D", {from: ADMIN}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 1000}))
    .then(() => money.make_bet(1, "Team C", {from: gambler2, value: 200}))
    .then(() => money.make_bet(1, "Team D", {from: gambler3, value: 400}))
    .then(() => money.make_bet(1, "Team D", {from: gambler4, value: 600}))
    .then(() => money.make_bet(1, "Team C", {from: gambler5, value: 3200}))
    .then(() => money.close_event(1, "Team C", {from: ADMIN}))
    .then(() => money.give_out_money(1, {from: ADMIN}))
    .then(() => money.money(gambler1))
    .then(asserts.equal(1204))
    .then(() => money.money(gambler2))
    .then(asserts.equal(240))
    .then(() => money.money(gambler3))
    .then(asserts.equal(0))
    .then(() => money.money(gambler4))
    .then(asserts.equal(0))
    .then(() => money.money(gambler5))
    .then(asserts.equal(3854));
  });

  it('shold allow to pay money to admin on second event', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler2, value: 200}))
    .then(() => money.make_bet(0, "Team B", {from: gambler3, value: 400}))
    .then(() => money.create_event("Team C", "Team D", {from: ADMIN}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 1000}))
    .then(() => money.make_bet(1, "Team C", {from: gambler2, value: 200}))
    .then(() => money.make_bet(1, "Team D", {from: gambler3, value: 400}))
    .then(() => money.make_bet(1, "Team D", {from: gambler4, value: 600}))
    .then(() => money.make_bet(1, "Team C", {from: gambler5, value: 3200}))
    .then(() => money.close_event(1, "Team C", {from: ADMIN}))
    .then(() => money.give_out_money(1, {from: ADMIN}))
    .then(() => money.money(ADMIN))
    .then(asserts.equal(100));
  });

  it('shold allow only for admin', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 1000}))
    .then(() => money.make_bet(0, "Team A", {from: gambler2, value: 200}))
    .then(() => money.make_bet(0, "Team B", {from: gambler3, value: 400}))
    .then(() => money.make_bet(0, "Team B", {from: gambler4, value: 600}))
    .then(() => money.make_bet(0, "Team A", {from: gambler5, value: 3200}))
    .then(() => money.close_event(0, "Team A", {from: ADMIN}))
    .then(() => money.give_out_money(0, {from: gambler1}))
    .then(() => money.money(ADMIN))
    .then(asserts.equal(0))
    .then(() => money.money(gambler1))
    .then(asserts.equal(0))
    .then(() => money.money(gambler2))
    .then(asserts.equal(0))
    .then(() => money.money(gambler3))
    .then(asserts.equal(0))
    .then(() => money.money(gambler4))
    .then(asserts.equal(0))
    .then(() => money.money(gambler5))
    .then(asserts.equal(0));
  });

  it('should fail when event is open', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 1000}))
    .then(() => money.make_bet(0, "Team A", {from: gambler2, value: 200}))
    .then(() => money.make_bet(0, "Team B", {from: gambler3, value: 400}))
    .then(() => money.make_bet(0, "Team B", {from: gambler4, value: 600}))
    .then(() => money.make_bet(0, "Team A", {from: gambler5, value: 3200}))
    .then(() => money.give_out_money(0, {from: ADMIN}))
    .then(() => money.money(ADMIN))
    .then(asserts.equal(0))
    .then(() => money.money(gambler1))
    .then(asserts.equal(0))
    .then(() => money.money(gambler2))
    .then(asserts.equal(0))
    .then(() => money.money(gambler3))
    .then(asserts.equal(0))
    .then(() => money.money(gambler4))
    .then(asserts.equal(0))
    .then(() => money.money(gambler5))
    .then(asserts.equal(0));
  });

  it('should fail when try to pay money twice', () => {
    return Promise.resolve()
    .then(() => money.create_event("Team A", "Team B", {from: ADMIN}))
    .then(() => money.make_bet(0, "Team A", {from: gambler1, value: 1000}))
    .then(() => money.make_bet(0, "Team A", {from: gambler2, value: 200}))
    .then(() => money.make_bet(0, "Team B", {from: gambler3, value: 1400}))
    .then(() => money.make_bet(0, "Team A", {from: gambler2, value: 200}))
    .then(() => money.make_bet(0, "Team B", {from: gambler3, value: 400}))
    .then(() => money.create_event("Team C", "Team D", {from: ADMIN}))
    .then(() => money.make_bet(1, "Team C", {from: gambler1, value: 1000}))
    .then(() => money.make_bet(1, "Team C", {from: gambler2, value: 200}))
    .then(() => money.make_bet(1, "Team D", {from: gambler3, value: 400}))
    .then(() => money.make_bet(1, "Team D", {from: gambler4, value: 600}))
    .then(() => money.make_bet(1, "Team C", {from: gambler5, value: 3200}))
    .then(() => money.close_event(1, "Team C", {from: ADMIN}))
    .then(() => money.give_out_money(1, {from: ADMIN}))
    .then(() => money.give_out_money(1, {from: ADMIN}))
    .then(() => money.getContractBalance())
    .then(asserts.equal(3202));
  });

  //OTHER

  it('soon...', () => {
    console.log("OTHER");
  
  });

});
