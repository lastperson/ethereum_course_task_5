pragma solidity 0.4.8;

contract Tote {
    
    struct Event {
        uint _balance;
        string team_A;
        string team_B;
        uint count_A;
        uint count_B;
        uint value_A;
        uint value_B;
        uint bet_count;
        string winner;
        string _status;
        mapping(uint => Bet) _bet;
    }

    struct Bet {
        uint bet_value;
        uint event_id;
        string team;
        address gambler;
    }

    Event[] public _event;
    address public admin;
    mapping(address => uint) public money;
    
    event Event_was_created(string b, string c);
    event Bet_was_created(address c, uint a, uint b, string l);
    event Event_was_closed(string wn);
    event The_money_was_given_out(uint k);

    function Tote() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) {
            return;
        }
        _;
    }

    modifier onlyNotAdmin() {
        if (msg.sender == admin) {
            return;
        }
        _;
    }

    modifier onlyOpen(uint k) {
        if (sha3(_event[k]._status) != sha3("Open")) {
            return;
        }
        _;
    }

    modifier onlyClosed(uint k) {
        if (sha3(_event[k]._status) != sha3("Closed")) {
            return;
        }
        _;
    }

    modifier onlyWithBalance(uint k) {
        if (_event[k]._balance == 0) {
            return;
        }
        _;
    }

    function _assert(bool _assertion) internal {
        if (!_assertion) {
            throw;
        }
    }

    function _safeAdd(uint _a, uint _b) internal constant returns(uint) {
        uint c = _a + _b;
        _assert(c >= _a);
        return c;
    }

    function _safeSub(uint _a, uint _b) internal constant returns(uint) {
        _assert(_b <= _a);
        return _a - _b;
    }

    function _safeDiv(uint a, uint b) internal returns (uint) {
        _assert(b > 0);
        uint c = a / b;
        _assert(a == b * c + a % b);
        return c;
    }

    function increment(uint event_id, string _team, uint _bet_value ) internal {
        if (sha3(_event[event_id].team_A) == sha3(_team)){
            _event[event_id].count_A ++;
            _event[event_id].value_A = _safeAdd(_event[event_id].value_A, _bet_value);
        }
        else {
            _event[event_id].count_B ++;
            _event[event_id].value_B = _safeAdd(_event[event_id].value_B, _bet_value);
        }
    }

    function create_event(string _team_A, string _team_B) onlyAdmin() returns(bool){
        var new_event = Event(0, _team_A, _team_B, 0, 0, 0, 0, 0, "Undefined", "Open");
        _event.push(new_event);
        Event_was_created(_team_A, _team_B);
        return true;
    }

    function make_bet(uint event_id, string _team) payable onlyNotAdmin() onlyOpen(event_id) returns(bool){
        if (sha3(_event[event_id].team_A) != sha3(_team) && (sha3(_event[event_id].team_B) != sha3(_team))) return false; 
        var bet = _event[event_id];
        var new_bet = Bet(msg.value, event_id, _team, msg.sender);
        bet._bet[_event[event_id].bet_count] = new_bet;
        increment(event_id, _team, msg.value);
        money[this] = _safeAdd(money[this], msg.value);
        _event[event_id]._balance = _safeAdd(_event[event_id]._balance, msg.value);
        Bet_was_created(msg.sender, event_id, msg.value, _team);
        _event[event_id].bet_count ++;
        return true;
    }
 
    function close_event(uint event_id, string _winner) onlyAdmin() onlyOpen(event_id) returns(bool){
        if (sha3(_event[event_id].team_A) != sha3(_winner) && (sha3(_event[event_id].team_B) != sha3(_winner))) return false; 
        _event[event_id]._status = "Closed";
        _event[event_id].winner = _winner;
        Event_was_closed(_winner);
        return true;
    }

    function give_out_money(uint event_id) onlyAdmin() onlyClosed(event_id) onlyWithBalance(event_id) returns(bool){
        uint rest = 0;
        uint win = 0;
        uint cash = 0;
        uint _x = 0;
        var bet = _event[event_id];
        uint event_value = _event[event_id]._balance;
        for (uint i = 0; i <= _safeSub(_event[event_id].bet_count, 1); i++) {
            if(sha3(bet._bet[i].team) != sha3(_event[event_id].winner)) {
                win = _safeAdd(win, bet._bet[i].bet_value);
            }
            else{
                money[bet._bet[i].gambler] = _safeAdd(money[bet._bet[i].gambler], bet._bet[i].bet_value);
                money[this] = _safeSub(money[this], bet._bet[i].bet_value);
            }
        }
        rest = _safeDiv(win, 10);
        event_value = _safeSub(event_value, win);
        money[admin] = _safeAdd(money[admin], rest);
        money[this] = _safeSub(money[this], rest);
        win = _safeSub(win, rest);
        for (uint j = 0; j <= _safeSub(_event[event_id].bet_count, 1); j++) {
            if(sha3(bet._bet[j].team) == sha3(_event[event_id].winner)) { 
                _x = bet._bet[j].bet_value * win;
                cash = _safeDiv(_x, event_value);
                money[bet._bet[j].gambler] = _safeAdd(money[bet._bet[j].gambler], cash);
                money[this] = _safeSub(money[this], cash);
            }
        }
        _event[event_id]._balance = 0;
        The_money_was_given_out(event_id);
        return true;
    }


    function getA(uint k) public constant returns (string) {
        return _event[k].team_A;
    } 
    
    function getB(uint k) public constant returns (string) {
        return _event[k].team_B;
    } 

    function getStatus(uint k) public constant returns (string) {
        return _event[k]._status;
    } 

    function getBet(uint evid, uint betid) public constant returns (uint) {
        var bet = _event[evid];
        return bet._bet[betid].bet_value;
    }
    
    function getCountA(uint k) public constant returns (uint) {
        return _event[k].count_A;
    } 

    function getCountB(uint k) public constant returns (uint) {
        return _event[k].count_B;
    } 

    function getValueA(uint k) public constant returns (uint) {
        return _event[k].value_A;
    } 

    function getValueB(uint k) public constant returns (uint) {
        return _event[k].value_B;
    }

    function getBetCount(uint k) public constant returns (uint) {
        return _event[k].bet_count;
    }
    
    function getBalance(uint k) public constant returns (uint) {
        return _event[k]._balance;
    }

    function getContractBalance() public constant returns (uint) {
        return money[this];
    }
}
