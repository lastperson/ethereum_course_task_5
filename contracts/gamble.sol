pragma solidity 0.4.10;

contract Tote {
    
    struct Event {
        uint event_value;
        string team_A;
        string team_B;
        uint count_A;
        uint count_B;
    }

    struct Bet {
        uint bet_value;
        uint event_id;
        string team;
        address gambler;
    }

    address public admin;
    mapping(address => uint) gamble;
    mapping(uint => Event) public _event;
    mapping(uint => Bet) public _bet;
    
    event Event_was_created(uint a, string b, string c);
    event Bet_was_created(address c, uint a, uint b);

    uint event_id = 1;
    uint bet_id = 1;

    function create_event(string _team_A, string _team_B) {
        _event[event_id].team_A = _team_A;
        _event[event_id].team_B = _team_B;
        Event_was_created(event_id, _team_A, _team_B);
        event_id ++;
    }
    
    function make_bet(uint event_id, uint _bet_value, string _team) {
        _bet[bet_id].gambler = msg.sender;
        _bet[bet_id].bet_value = _bet_value;
        _bet[bet_id].team = _team;
        if (sha3(_event[event_id].team_A) != sha3(_team) && sha3(_event[event_id].team_B) != sha3(_team)) throw;
        if (sha3(_event[event_id].team_A) == sha3(_team)) _event[event_id].count_A ++;
        if (sha3(_event[event_id].team_B) == sha3(_team)) _event[event_id].count_B ++;
        _event[event_id].event_value = _event[event_id].event_value + _bet_value;
        Bet_was_created(msg.sender, event_id, _bet_value);
        bet_id ++;
    }

    //function delete_event() internal {
        
    };

}  