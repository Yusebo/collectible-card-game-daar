// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract Collection is ERC721, Ownable {
    string public collectionName;
    uint256 public cardCount;

    constructor(string memory _name, uint256 _cardCount) ERC721(_name, "MYNFT") Ownable(msg.sender) {
        collectionName = _name;
        cardCount = _cardCount;
    }

    mapping(uint => Card) public cards;
    mapping(uint256 => address) private tokenApprovals;
    mapping(uint256 => address) public onSelling; 

    uint256 private _tokenIds;

    struct Card {
        string img;
        uint256 cardNumber;
        uint256 id;
    }

    function mintCard(string memory img) external {
        uint256 newCardId = _tokenIds;
        _mint(msg.sender, newCardId);
        
        Card memory newCard = Card({cardNumber: newCardId, img: img, id: _tokenIds});
        cards[newCardId] = newCard;
        
        _tokenIds++;
    }

    function mintCardtoOther(string memory img, address to) external {
        uint256 newCardId = _tokenIds;
        _mint(to, newCardId);
        
        Card memory newCard = Card({cardNumber: newCardId, img: img, id: _tokenIds});
        cards[newCardId] = newCard;
        
        _tokenIds++;
    }

    function getCardInfo(uint256 tokenId) external view returns (string memory img, uint256 cardNumber, uint256 id, address owner) {
        require(tokenId < cardCount, "Index out of bounds");
        Card storage card = cards[tokenId];
        return (card.img, card.cardNumber, card.id, ownerOf(card.cardNumber));
    }

    function addElement(uint256 tokenId, address seller) external {
        require(ownerOf(tokenId) == seller, "OW1");
        addtomap(cards[tokenId].id, seller);
        _approve(msg.sender, cards[tokenId].cardNumber, seller);
    }

    function transferCard(uint256 tokenId, uint256 price, address seller, address buyer, uint256 transfer) public payable {
        require(transfer >= price, "Insufficient amount");
        safeTransferFrom(seller, buyer, tokenId);
        removetomap(cards[tokenId].id);
    }

    function addtomap(uint256 _key, address _owner) public {
        onSelling[_key] = _owner;
    }

    function gettomap(uint256 _key) public view returns (address ) {
        return onSelling[_key];
    }
    
    function removetomap(uint256 _key) public {
        delete onSelling[_key];
    }
}