pragma solidity 0.4.8;

contract Migrations {
    address public admin;
    uint public last_completed_migration;

    modifier restricted() {
        if (msg.sender == admin) _;
    }

    function Migrations() {
        admin = msg.sender;
    }

    function setCompleted(uint completed) restricted {
        last_completed_migration = completed;
    }

    function upgrade(address new_address) restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}
