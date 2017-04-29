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
    mapping (uint => mapping(uint => Event[])) public test;
    
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

    function getA(uint k) public constant returns (string)
    {
        return _event[k].team_A;
    } 
    
    function getB(uint k) public constant returns (string)
    {
        return _event[k].team_B;
    } 

    function getBet(uint k) public constant returns (uint)
    {
        return _bet[k].bet_value;
    } 

    function getCount(uint k) public constant returns (uint)
    {
        return _event[k].count_A;
    } 

    function getValue(uint k) public constant returns (uint)
    {
        return _event[k].value_A;
    } 


    function create_event(string _team_A, string _team_B) onlyAdmin() {
        var new_event = Event(_team_A, _team_B, 0, 0, 0, 0, "Undefined", "Open");
        _event.push(new_event);
        Event_was_created(_team_A, _team_B);
    }
    
    function valid(string x, string y, string f, string e) internal {
        if (sha3(x) == sha3("Close")) throw;
        if (sha3(f) != sha3(y) && sha3(e) != sha3(y)) throw;
    }
    
    function make_bet(uint event_id, uint _bet_value, string _team) onlyNotAdmin() {
        valid(_event[event_id]._status, _team, _event[event_id].team_A, _event[event_id].team_B);
        var new_bet = Bet(_bet_value, event_id, _team, msg.sender);
        _bet.push(new_bet);
        if (sha3(_event[event_id].team_A) == sha3(_team)){
            _event[event_id].count_A ++;
            _event[event_id].value_A = _safeAdd(_event[event_id].value_A, _bet_value);
        }
        if (sha3(_event[event_id].team_B) == sha3(_team)){
            _event[event_id].count_B ++;
            _event[event_id].value_B = _safeAdd(_event[event_id].value_B, _bet_value);
        }
        Bet_was_created(msg.sender, event_id, _bet_value, _team);
    }

    function delete_event(uint event_id) internal {
        _event[event_id]._status = "Close";
    }
    
    function nominate_winner(uint event_id, string _winner) onlyAdmin() {
        uint event_value = _safeAdd(_event[event_id].count_A, _event[event_id].count_B);
        uint rest;
        uint win;
        uint cash;
        valid(_event[event_id]._status, _winner, _event[event_id].team_A, _event[event_id].team_B);
        if (sha3(_event[event_id].team_A) == sha3(_winner)) _event[event_id].team_A = _winner;
        else _event[event_id].team_B = _winner;
        for (uint i = 0; i <= (_safeAdd(_event[event_id].count_A, _event[event_id].count_B)); i++) {
            if(sha3(_bet[i].team) != sha3(_winner)) win = _safeAdd(win,_bet[i].bet_value);
            }
        event_value = event_value - rest;
        rest = win / 10;
        money[admin] = rest;
        win = win - rest;
        for (uint j = 0; j <= (_safeAdd(_event[event_id].count_A, _event[event_id].count_B)); j++) {
            if(sha3(_bet[j].team) == sha3(_winner)) { 
                cash = _bet[j].bet_value +((_bet[j].bet_value / event_value) * win);
                money[_bet[j].gambler] = money[_bet[j].gambler] + cash;
            }
        }
        _event[event_id].winner = _winner;    
        delete_event(event_id);
        Event_was_closed(_winner);    
    }
}