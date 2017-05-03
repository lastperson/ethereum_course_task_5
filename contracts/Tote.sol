pragma solidity 0.4.8;

contract Tote {
    
    struct Event {
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
            throw;
        }
        _;
    }

    modifier onlyNotAdmin() {
        if (msg.sender == admin) {
            throw;
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

    function check(string ev_status, string input, string name1, string name2) internal {
        if (sha3(ev_status) != sha3("Open")) throw;
        if (sha3(name1) != sha3(input) && sha3(name2) != sha3(input)) throw;
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

    function create_event(string _team_A, string _team_B) onlyAdmin() {
        var new_event = Event(_team_A, _team_B, 0, 0, 0, 0, 0, "Undefined", "Open");
        _event.push(new_event);
        Event_was_created(_team_A, _team_B);
    }

    function make_bet(uint event_id, uint _bet_value, string _team) onlyNotAdmin() {
        check(_event[event_id]._status, _team, _event[event_id].team_A, _event[event_id].team_B);
        var bet = _event[event_id];
        var new_bet = Bet(_bet_value, event_id, _team, msg.sender);
        bet._bet[_event[event_id].bet_count] = new_bet;
        increment(event_id, _team, _bet_value);
        money[this] = _safeAdd(money[this], _bet_value);
        Bet_was_created(msg.sender, event_id, _bet_value, _team);
        _event[event_id].bet_count ++;
    }
 
    function close_event(uint event_id, string _winner) onlyAdmin() {
        check(_event[event_id]._status, _winner, _event[event_id].team_A, _event[event_id].team_B);
        _event[event_id]._status = "Closed";
        _event[event_id].winner = _winner;
        Event_was_closed(_winner);
    }

    function give_out_money(uint event_id) onlyAdmin() {
        if (sha3(_event[event_id]._status) != sha3("Closed")) throw;
        uint rest = 0;
        uint win = 0;
        uint cash = 0;
        uint _x = 0;
        var bet = _event[event_id];
        uint event_value = money[this];
        for (uint i = 0; i <= _safeSub(_event[event_id].bet_count, 1); i++) {
            if(sha3(bet._bet[i].team) != sha3(_event[event_id].winner)) {
                win = _safeAdd(win,bet._bet[i].bet_value);
            }
            else{
                money[bet._bet[i].gambler] = _safeAdd(money[bet._bet[i].gambler], bet._bet[i].bet_value);
            }
        }
        rest = _safeDiv(win, 10);
        event_value = _safeSub(event_value, win);
        money[admin] = rest;
        win = _safeSub(win, rest);
        for (uint j = 0; j <= _safeSub(_event[event_id].bet_count, 1); j++) {
            if(sha3(bet._bet[j].team) == sha3(_event[event_id].winner)) { 
                _x = bet._bet[j].bet_value * win;
                cash = _safeDiv(_x, event_value);
                money[bet._bet[j].gambler] = _safeAdd(money[bet._bet[j].gambler], cash);
                money[this] = _safeSub(money[this], cash);
            }
        }
        The_money_was_given_out(event_id);
    }
}
