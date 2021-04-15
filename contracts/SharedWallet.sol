//SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Allowance is Ownable {
    event AllowanceChanged(
        address indexed _forWho,
        address indexed _byWhom,
        uint256 _oldAmount,
        uint256 _newAmount
    );

    mapping(address => uint256) public allowance;

    function isOwner() internal view returns (bool) {
        return owner() == msg.sender;
    }

    function setAllowance(address _who, uint256 _amount) public onlyOwner {
        emit AllowanceChanged(_who, msg.sender, allowance[_who], _amount);
        allowance[_who] = _amount;
    }

    modifier ownerOrAllowed(uint256 _amount) {
        require(
            isOwner() || allowance[msg.sender] >= _amount,
            "You are not allowed!"
        );
        _;
    }

    function reduceAllowance(address _who, uint256 _amount)
        internal
        ownerOrAllowed(_amount)
    {
        emit AllowanceChanged(_who, msg.sender, allowance[_who], _amount);
        allowance[_who] -= _amount;
    }
}

contract SharedWallet is Allowance {
    function withdrawMoney(address payable _to, uint256 _amount)
        public
        ownerOrAllowed(_amount)
    {
        require(
            _amount <= address(this).balance,
            "Contract doesn't own enough money"
        );
        if (!isOwner()) {
            reduceAllowance(msg.sender, _amount);
        }
        _to.transfer(_amount);
    }

    receive() external payable {}
}
