import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts";

contract Collection is ERC721, Ownable {
    address public owner;
    string public collectionName;
    uint256 public cardCount;

    constructor(string memory _name, uint256 _cardCount, address _owner) ERC721(_name, "MYNFT") {
        collectionName = _name;
        cardCount = _cardCount;
        owner = _owner;
    }

    mapping(uint => Card) public cards;
    mapping(uint256 => address) private tokenApprovals;
    mapping(uint256 => address) public onSelling; 

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Card {
        string img;
        uint256 cardNumber;
        int256 id;
    }

    function mintCard(string memory img, int256 id) external {
        uint256 newCardId = _tokenIds.current();
        _mint(msg.sender, newCardId);
        _tokenIds.increment();
        Card memory newCard = Card({cardNumber: newCardId, img: img, id: id});
        cards[newCardId] = newCard;
    }

    function getCardInfo(uint256 tokenId) external view returns (string memory img, uint256 cardNumber, int256 id, address owner) {
        require(tokenId < cardCount, "Index out of bounds");
        Card storage card = cards[tokenId];
        return (card.img, card.cardNumber, card.gid, ownerOf(card.cardNumber));
    }

    function addElement(uint256 tokenId, address seller) external {
        require(ownerOf(tokenId) == seller, "OW1");
        addtomap(cards[tokenId].id, owner);
        _approve(msg.sender, cards[tokenId].cardNumber);
    }

    function transferCard(uint256 tokenId, uint256 price, address seller, address buyer, uint256 transfer) public payable {
        require(transfer >= price, "Insufficient amount");
        safeTransferFrom(seller, buyer, tokenId);
        removetomap(cards[tokenId].id);
    }

    function addtomap(uint256 _key, address memory _owner) public {
        onSelling[_key] = _owner;
    }

    function gettomap(uint256 _key) public view returns (address memory) {
        require(bytes(dataMap[_key]).length != 0, "Key does not exist");
        return onSelling[_key];
    }
    
    function removetomap(uint256 _key) public {
        require(bytes(dataMap[_key]).length != 0, "Key does not exist");
        delete onSelling[_key];
    }
}