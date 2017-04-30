pragma solidity 0.4.8;

contract Tote {
    
    struct Event {
        string team_A;
        string team_B;
        uint count_A;
        uint count_B;
        uint value_A;
        uint value_B;
        string winner;
        string _status;
    }

    struct Bet {
        uint bet_value;
        uint event_id;
        string team;
        address gambler;
    }

    Event[] public _event;
    Bet[] public _bet;

    address public admin;
    mapping(address => uint) public money;
    
    event Event_was_created(string b, string c);
    event Bet_was_created(address c, uint a, uint b, string l);
    event Event_was_closed(string wn);

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


    function valid(string x, string y, string f, string e) internal {
        if (sha3(x) != sha3("Open")) throw;
        if (sha3(f) != sha3(y) && sha3(e) != sha3(y)) throw;
    }

    function delete_event(uint event_id) internal {
        _event[event_id]._status = "Close";
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

    function getBet(uint k) public constant returns (uint) {
        return _bet[k].bet_value;
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
        var new_event = Event(_team_A, _team_B, 0, 0, 0, 0, "Undefined", "Open");
        _event.push(new_event);
        Event_was_created(_team_A, _team_B);
    }

    function make_bet(uint event_id, uint _bet_value, string _team) onlyNotAdmin() {
        valid(_event[event_id]._status, _team, _event[event_id].team_A, _event[event_id].team_B);
        var new_bet = Bet(_bet_value, event_id, _team, msg.sender);
        _bet.push(new_bet);
        increment(event_id, _team, _bet_value);
        money[this] = _safeAdd(money[this], _bet_value);
        Bet_was_created(msg.sender, event_id, _bet_value, _team);
    }
    
    function nominate_winner(uint event_id, string _winner) onlyAdmin() {
        uint rest = 0;
        uint win = 0;
        uint cash = 0;
        uint _x = 0;
        uint event_value = money[this];
        uint count = _safeAdd(_event[event_id].count_A, _event[event_id].count_B);
        valid(_event[event_id]._status, _winner, _event[event_id].team_A, _event[event_id].team_B);
        for (uint i = 0; i <= _safeSub(count, 1); i++) {
            if(sha3(_bet[i].team) != sha3(_winner)) {
                win = _safeAdd(win,_bet[i].bet_value);
            }
            else{
                money[_bet[i].gambler] = _safeAdd(money[_bet[i].gambler], _bet[i].bet_value);
            }
        }
        rest = _safeDiv(win, 10);
        event_value = _safeSub(event_value, win);
        money[admin] = rest;
        win = _safeSub(win, rest);
        for (uint j = 0; j <= _safeSub(count, 1); j++) {
            if(sha3(_bet[j].team) == sha3(_winner)) { 
                _x = _bet[j].bet_value * win;
                cash = _safeDiv(_x, event_value);
                money[_bet[j].gambler] = _safeAdd(money[_bet[j].gambler], cash);
                money[this] = _safeSub(money[this], cash);
            }
        }
        _event[event_id].winner = _winner;    
        delete_event(event_id);
        Event_was_closed(_winner); 
    }
}
