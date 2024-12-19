// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AMAMatcher is Ownable, ReentrancyGuard {
    struct Match {
        bytes32[] matchHashes;
        uint256[] rankings;
        uint256 timestamp;
    }

    mapping(bytes32 => Match) public matches;
    mapping(bytes32 => bool) public hasSubmitted;

    event MatchSubmitted(
        bytes32 indexed amaId,
        bytes32[] matchHashes,
        uint256[] rankings,
        address submitter
    );

    constructor() {}

    function submitMatch(
        bytes32 amaId,
        bytes32[] calldata matchHashes,
        uint256[] calldata rankings
    ) external {
        require(!hasSubmitted[amaId], "AMA already submitted");
        require(matchHashes.length == rankings.length, "Length mismatch");
        
        matches[amaId] = Match({
            matchHashes: matchHashes,
            rankings: rankings,
            timestamp: block.timestamp
        });

        hasSubmitted[amaId] = true;

        emit MatchSubmitted(amaId, matchHashes, rankings, msg.sender);
    }

    function revealMatches(
        bytes32 amaId,
        bytes32[] calldata correctMatches
    ) external onlyOwner {
        require(hasSubmitted[amaId], "AMA not submitted");
        
        // Implementation for revealing matches
    }

    function getMatch(bytes32 amaId) external view returns (
        bytes32[] memory matchHashes,
        uint256[] memory rankings,
        uint256 timestamp
    ) {
        Match memory userMatch = matches[amaId];
        return (userMatch.matchHashes, userMatch.rankings, userMatch.timestamp);
    }
} 