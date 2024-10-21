// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "./SafeERC20.sol";
import "./OwnableUpgradeable.sol";
import "./ReentrancyGuardUpgradeable.sol";
import "./PausableUpgradeable.sol";

contract Votes is
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;

    struct VoteItem {
        string name;
        uint256 power;
    }

    // VoteInfo
    struct VoteInfo {
        string title;
        address creator;
        string imageURI;
        address token;
        uint256 minPower;
        uint256 createdTime;
        uint256 startTime;
        uint256 endTime;
        uint256 startItemIdx;
        uint256 cntItems;
    }

    VoteItem[] public items;
    VoteInfo[] public votes;

    address public dead;

    event VoteCreated(uint256 indexed id, address indexed creator);
    event Vote(
        address indexed voter,
        uint256 indexed voteId,
        uint256 indexed itemId,
        uint256 power
    );

    function initialize() public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        dead = address(0x000000000000000000000000000000000000dEaD);
    }

    // TODO if eth balance < value, handle exception
    function safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, "TransferHelper: ETH_TRANSFER_FAILED");
    }

    function createVote(
        string memory title,
        string memory imageURI,
        address token,
        uint256 minPower,
        uint256 startTime,
        uint256 endTime,
        string[] calldata names
    ) external onlyOwner {
        uint256 startItemIdx = items.length;

        for (uint256 i = 0; i < names.length; i++) {
            items.push(VoteItem({name: names[i], power: 0}));
        }

        votes.push(
            VoteInfo({
                title: title,
                creator: msg.sender,
                imageURI: imageURI,
                token: token,
                minPower: minPower,
                createdTime: block.timestamp,
                startTime: startTime,
                endTime: endTime,
                startItemIdx: startItemIdx,
                cntItems: names.length
            })
        );

        emit VoteCreated(votes.length - 1, msg.sender);
    }

    function vote(
        uint256 voteId,
        uint256[] calldata itemIds,
        uint256[] calldata powers
    ) external nonReentrant whenNotPaused {
        require(voteId < votes.length, "Invalid Vote Id");
        require(
            block.timestamp >= votes[voteId].startTime,
            "Vote is not started yet"
        );
        require(
            block.timestamp <= votes[voteId].endTime,
            "Vote has been ended already"
        );

        uint256 endIdx = votes[voteId].startItemIdx + votes[voteId].cntItems;
        for (uint256 i = 0; i < itemIds.length; i++) {
            require(
                itemIds[i] >= votes[voteId].startItemIdx,
                "Invalid Item Id"
            );
            require(itemIds[i] < endItemIdx, "Invalid Item Id");
            require(
                powers[i] > votes[voteId].minPower,
                "Voting power should be greater than minimum power"
            );
            IERC20(votes[voteId].token).safeTransferFrom(
                msg.sender,
                dead,
                powers[i]
            );

            items[itemIds[i]].power += powers[i];
            emit Vote(msg.sender, voteId, itemIds[i], powers[i]);
        }
    }

    function setDead(address _dead) external onlyOwner {
        dead = _dead;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function votesLength() external view returns (uint256) {
        return votes.length;
    }

    function itemsLength() external view returns (uint256) {
        return items.length;
    }

    receive() external payable {}

    function withdrawToken(
        IERC20 _token,
        uint256 _amount,
        address to
    ) external onlyOwner {
        if (_amount > 0) {
            _token.safeTransfer(to, _amount);
        }
    }

    function withdrawETH(uint256 _amountETH, address to) external onlyOwner {
        if (_amountETH > 0) {
            safeTransferETH(to, _amountETH);
        }
    }
}
