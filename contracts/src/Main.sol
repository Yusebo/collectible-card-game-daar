// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Collection.sol";

contract Main is Ownable {

    struct CollectionInfo {
        string name;
        address collectionAddress;
        uint256 cardCount;
        CardInfo[] cards;
    }

    
    mapping(uint256 => Collection) public collections;
    uint256 public collectionCount;

    event CollectionCreated(string name, address indexed collectionAddress, uint256 cardCount);

    constructor() {
        collectionCount = 0;
    }

    // Function to create a new Collection (set of NFTs)
    function createCollection(string memory _name, uint256 _cardCount) external onlyOwner {
        collections[collectionCount] = new Collection(name, cardCount, address(this));
        
        emit CollectionCreated(_name, address(newCollection), _cardCount);
        
        collectionCount++;
    }

    function mintCardForUser(uint256 collectionId, string memory img, int256 id, address user) external onlyOwner {
        require(collections[collectionId] != Collection(address(0)), "list null");
        collections[collectionId].mintTo(to, img, gid);
    }

    function getCollectionsAndCards(bool all, bool boosters, address user) public view returns (CollectionInfo[] memory) {
        CollectionInfo[] memory collectionInfo = new CollectionInfo[](uint256(collectionCount));
        for (int256 i = 0; i < collectionCount; i++) {
            CardInfo[] memory cardInfo = new CardInfo[](collections[i].cardCount());
            if (collections[i].redeemed()) {
                for (uint256 j = 0; j < collections[i].cardCount(); j++) {
                    (string memory img, uint256 cardNumber, int256 id, address owner) = collections[i].getCardInfo(j);
                    if (all) {
                        cardInfo[j] = CardInfo(img, cardNumber, gid, owner);
                    } else {
                        if (owner == user) {
                            cardInfo[j] = CardInfo(img, cardNumber, gid, owner);
                        }
                    }
                }
            }
            if (all) {
                collectionInfo[uint256(i)] = CollectionInfo(i, collections[i].collectionName(), collections[i].cardCount(), cardInfo, collections[i].owner());
            } else {
                if (collections[i].owner() == user) {
                    collectionInfo[uint256(i)] = CollectionInfo(i, collections[i].collectionName(), collections[i].cardCount(), cardInfo, collections[i].owner());
                }
            }

        }
        return collectionInfo;
    }
}