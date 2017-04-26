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

  //CREATE EVENT

  it('should allow to create event', () => {
    console.log("CREATE EVENT");

  });
  
  it('shold allow only for admin', () => {


  });

  it('should emit Event_was_created event', () => {


  });

  //MAKE BET

  it('should allow to create bet', () => {
    console.log("MAKE BET");

  });

  it('should fail when event ID is not exist', () => {


  });

  it('should fail when team is not exist', () => {


  });
  
  it('shold allow only for user', () => {


  });

  it('should emit Bet_was_created event', () => {


  });

  it('should fail when event is closed', () => {


  });

  it('is count_TEAM increment works', () => {


  }); 

  it('is value_TEAM increment works', () => {


  });

  //NOMINATE WINNER

  it('should allow to nominate winner', () => {
    console.log("NOMINATE WINNER");

  });

  it('should fail when event ID is not exist', () => {


  });
  
  it('should fail when team is not exist', () => {


  });

  it('shold allow only for admin', () => {


  });

  it('should emit Event_was_closed event', () => {


  });

  it('should fail when event is closed', () => {


  });

  //BET SHOW

  it('should allow to show event info', () => {
    console.log("EVENT SHOW");


  });

  it('should fail when event ID is not exist', () => {


  });

  //BET SHOW

  it('should allow to show bet info', () => {
    console.log("BET SHOW");


  });

  it('should fail when bet ID is not exist', () => {


  });

  //MONEY SHOW

  it('should allow to show money', () => {
    console.log("MONEY SHOW");


  });

  it('should fail when address is not exist', () => {


  });

  //OTHER

  it('soon...', () => {
    console.log("OTHER");
  
  });


});
