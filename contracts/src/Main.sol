// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Collection.sol";

contract Main is Ownable {

    struct CollectionInfo {
        string name;
        address collectionAddress;
        uint256 cardCount;
        string img;
    }

    CollectionInfo[] public collections;
    uint256 public collectionCount;

    event CollectionCreated(string name, address indexed collectionAddress, uint256 cardCount, uint256 collection_id);
    event CardMinted(uint256 collectionId, address indexed owner, uint256 cardId, string img, uint256 tokenId);
    event CardInfoRetrieved(uint256 collect_id, uint256 id_card, string img, uint256 cardid, uint256 id, address owner);
    event TokenIdCheck(uint256 collect_id, uint256 collectionCount);

    constructor(address _owner) Ownable(msg.sender) {
        require(_owner != address(0), "Owner address cannot be zero");
        collectionCount = 0;
    }
    

    function createCollection(string memory _name, uint256 _cardCount, string memory _img) external onlyOwner {
        Collection new_collection = new Collection(_name, _cardCount);
        collections.push(CollectionInfo({
            name: _name,
            collectionAddress: address(new_collection),
            cardCount: _cardCount,
            img : _img
        }));
        emit CollectionCreated(_name, address(new_collection ), _cardCount, collectionCount);
        
        collectionCount++;
    }

    function mintCardForUser(uint256 collect_id, string memory img, uint256 id) external onlyOwner {
        CollectionInfo storage collectionInfo = collections[collect_id];
        require(collect_id < collectionCount, "list null");
        Collection(collectionInfo.collectionAddress).mintCard(img, id);
        emit CardMinted(collect_id, msg.sender, id, img, Collection(collectionInfo.collectionAddress).gettoken() - 1);
    }

    function getCollection(uint256 _id) external view returns (string memory, uint256, address) {
        require(_id < collectionCount, "Collection does not exist");
        CollectionInfo storage collectionInfo = collections[_id];
        return (collectionInfo.name, collectionInfo.cardCount, collectionInfo.collectionAddress);
    }

    function get_card_in_Collection(uint256 collect_id, uint256 id_card) external returns (string memory img, uint256 cardid, uint256 id, address owner) {
        emit TokenIdCheck(collect_id, collectionCount);
        require(collect_id < collectionCount, "Collection does not exist");

        CollectionInfo storage collectionInfo = collections[collect_id];

        if (id_card >= collectionInfo.cardCount) {
            revert("Card does not exist in this collection");
        }
        (img, cardid, id, owner) = Collection(collectionInfo.collectionAddress).getCardInfo(id_card);

        emit CardInfoRetrieved(collect_id, id_card, img, cardid, id, owner);
        return (img, cardid, id, owner);
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
                cardCount: collections[i].cardCount,
                img: collections[i].img
            });
        }
        
        return allCollections;
    }

    function getAllCardsWithOwner() external view returns (Collection.Card[] memory, address[] memory) {
        uint256 totalCards = 0;

        // Calculer le nombre total de cartes
        for (uint256 i = 0; i < collectionCount; i++) {
            totalCards += Collection(collections[i].collectionAddress).gettoken();
        }

        // Créer un tableau dynamique pour stocker toutes les cartes et leurs propriétaires
        Collection.Card[] memory allCards = new Collection.Card[](totalCards);
        address[] memory allOwners = new address[](totalCards);

        uint256 index = 0;

        // Parcourir chaque collection pour obtenir les cartes et leurs propriétaires
        for (uint256 i = 0; i < collectionCount; i++) {
            Collection collection = Collection(collections[i].collectionAddress);

            for (uint256 j = 0; j < collection.gettoken(); j++) {
                // Récupérer les informations de la carte et de son propriétaire
                (string memory img, uint256 cardId, uint256 id, address owner) = collection.getCardInfo(j);

                // Stocker la carte et le propriétaire dans les tableaux
                allCards[index] = Collection.Card({img: img, cardId: cardId, id: id});
                allOwners[index] = owner;
                index++;
            }
        }

        return (allCards, allOwners);
    }



}