pragma solidity 0.4.8;

contract Tote {
    
    struct Event {
        uint event_value;
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

    address public admin;
    mapping(address => uint) public money;
    mapping(uint => Event) public _event;
    mapping(uint => Bet) public _bet;
    
    event Event_was_created(uint a, string b, string c);
    event Bet_was_created(address c, uint a, uint b);
    event Event_was_closed(string wn);

    uint id = 1;
    uint bet_id = 1;
    
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

    function create_event(string _team_A, string _team_B) onlyAdmin() {
        _event[id]._status = "Open";
        _event[id].team_A = _team_A;
        _event[id].team_B = _team_B;
        Event_was_created(id, _team_A, _team_B);
        id ++;
    }
    
    function valid(string x, string y, string f, string e) internal {
        if (sha3(x) == sha3("Close")) throw;
        if (sha3(f) != sha3(y) && sha3(e) != sha3(y)) throw;
    }
    
    function make_bet(uint event_id, uint _bet_value, string _team) onlyNotAdmin() {
        valid(_event[event_id]._status, _team, _event[event_id].team_A, _event[event_id].team_B);
        _bet[bet_id].gambler = msg.sender;
        _bet[bet_id].bet_value = _bet_value;
        _bet[bet_id].team = _team;
        _bet[bet_id].event_id = event_id;
        if (sha3(_event[event_id].team_A) == sha3(_team)){
            _event[event_id].count_A ++;
            _event[event_id].value_A = _safeAdd(_event[event_id].value_A, _bet_value);
        }
        if (sha3(_event[event_id].team_B) == sha3(_team)){
            _event[event_id].count_B ++;
            _event[event_id].value_B = _safeAdd(_event[event_id].value_B, _bet_value);
        }
        _event[event_id].event_value = _safeAdd(_event[event_id].event_value, _bet_value);
        Bet_was_created(msg.sender, event_id, _bet_value);
        bet_id ++;
    }

    function delete_event(uint event_id) internal {
        _event[event_id]._status = "Close";
    }
    
    function nominate_winner(uint event_id, string _winner) onlyAdmin() {
        uint rest;
        uint win;
        uint cash;
        valid(_event[event_id]._status, _winner, _event[event_id].team_A, _event[event_id].team_B);
        if (sha3(_event[event_id].team_A) == sha3(_winner)) _event[event_id].team_A = _winner;
        else _event[event_id].team_B = _winner;
        for (uint i = 1; i <= (_safeAdd(_event[event_id].count_A, _event[event_id].count_B)); i++) {
            if(sha3(_bet[i].team) != sha3(_winner)) win = _safeAdd(win,_bet[i].bet_value);
            }
        _event[event_id].event_value = _event[event_id].event_value - rest;
        rest = win / 10;
        money[admin] = rest;
        win = win - rest;
        for (uint j = 1; j <= (_safeAdd(_event[event_id].count_A, _event[event_id].count_B)); j++) {
            if(sha3(_bet[j].team) == sha3(_winner)) { 
                cash = _bet[j].bet_value +((_bet[j].bet_value / _event[event_id].event_value) * win);
                money[_bet[j].gambler] = money[_bet[j].gambler] + cash;
            }
        }
        _event[event_id].winner = _winner;    
        delete_event(event_id);
        Event_was_closed(_winner);    
    }
}