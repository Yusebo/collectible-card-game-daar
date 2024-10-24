// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Collection.sol";

contract Main is Ownable {

    struct CollectionInfo {
        string name;
        address collectionAddress;
        uint256 cardCount;
    }

    CollectionInfo[] public collections;
    uint256 public collectionCount;

    event CollectionCreated(string name, address indexed collectionAddress, uint256 cardCount);

    constructor() Ownable(msg.sender) {
        collectionCount = 0;
    }
    

    function createCollection(string memory _name, uint256 _cardCount) external onlyOwner {
        Collection new_collection = new Collection(_name, _cardCount);
        collections.push(CollectionInfo({
            name: _name,
            collectionAddress: address(new_collection),
            cardCount: _cardCount
        }));
        emit CollectionCreated(_name, address(new_collection ), _cardCount);
        
        collectionCount++;
    }

    function mintCardForUser(uint256 collect_id, string memory img, address user) external onlyOwner {
        CollectionInfo storage collectionInfo = collections[collect_id];
        require(collect_id < collectionCount, "list null");
        Collection(collectionInfo.collectionAddress).mintCardtoOther(img, user);
    }

    function getCollection(uint256 _id) external view returns (string memory, uint256, address) {
        require(_id < collectionCount, "Collection does not exist");
        CollectionInfo storage collectionInfo = collections[_id];
        return (collectionInfo.name, collectionInfo.cardCount, collectionInfo.collectionAddress);
    }

    function getAllCollections() external view returns (CollectionInfo[] memory) {
        CollectionInfo[] memory allCollections = new CollectionInfo[](collectionCount);
    
        for (uint256 i = 0; i < collectionCount; i++) {
        allCollections[i] = CollectionInfo({
                name: collections[i].name,
                collectionAddress: collections[i].collectionAddress,
                cardCount: collections[i].cardCount
            });
        }
        
        return allCollections;
    }


}