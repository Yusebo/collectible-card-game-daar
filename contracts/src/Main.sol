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

    constructor(address _owner) Ownable(msg.sender) {
        require(_owner != address(0), "Owner address cannot be zero");
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

    function mintCardForUser(uint256 collect_id, string memory img, uint256 id) external onlyOwner {
        CollectionInfo storage collectionInfo = collections[collect_id];
        require(collect_id < collectionCount, "list null");
        Collection(collectionInfo.collectionAddress).mintCard(img, id);
    }

    function getCollection(uint256 _id) external view returns (string memory, uint256, address) {
        require(_id < collectionCount, "Collection does not exist");
        CollectionInfo storage collectionInfo = collections[_id];
        return (collectionInfo.name, collectionInfo.cardCount, collectionInfo.collectionAddress);
    }

    function get_card_in_Collection(uint256 collect_id, uint256 id_card) public view returns (string memory img, uint256 cardid, uint256 id, address owner) {
        require(collect_id < collectionCount, "Collection does not exist");

        CollectionInfo storage collectionInfo = collections[collect_id];
        return Collection(collectionInfo.collectionAddress).getCardInfo(id_card);
    }

    function get_all_card_in_Collection(uint256 collect_id) external view returns (Collection.Card[] memory) {
        require(collect_id < collectionCount, "Collection does not exist");
        Collection collection = Collection(collections[collect_id].collectionAddress);

        // Créer un tableau dynamique pour stocker toutes les cartes
        Collection.Card[] memory allCards = new Collection.Card[](collections[collect_id].cardCount);

        for (uint256 i = 0; i < collections[collect_id].cardCount; i++) {
            // Récupérer les informations de la carte sous forme de tuple
            (string memory img, uint256 CardId, uint256 id, address owner) = collection.getCardInfo(i);

            // Créer une nouvelle instance de Card et l'assigner à l'index approprié
            allCards[i] = Collection.Card({img: img, cardId: CardId, id: id});
        }
        
        return allCards;
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