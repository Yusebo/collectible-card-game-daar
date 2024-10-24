// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Collection.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Booster is ERC721, Ownable {
    struct BoosterDetails {
        string set_name;
        uint256 total_card;
        uint256 set_card ;
        string img;
        uint256 price;
    }

    mapping(uint256 => BoosterDetails) public boosters; 
    uint256 public boosterCount = 0;

    constructor() ERC721("Booster", "BOOST") Ownable(msg.sender) {}

    function createBooster(string memory _set_name, uint256 set_card , uint256 total_card, string memory img, uint256 price) external onlyOwner {
        boosters[boosterCount] = BoosterDetails(_set_name, set_card, total_card, img, price);
        _mint(msg.sender, boosterCount); 
        boosterCount++;
    }

    function openBooster(uint256 boosterId, Collection collection) external {
        require(boosterId < boosterCount, "list null");
        require(ownerOf(boosterId) == msg.sender, "You do not own this booster");

        BoosterDetails memory booster = boosters[boosterId];

        for (uint256 i = 0; i < booster.total_card; i++) {
            
            uint256 cardId = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % booster.set_card ;
            string memory str = concatStringAndUint(booster.set_name, cardId) ;
            collection.mintCard(str);
        }

        _burn(boosterId);
    }
    
    function redeemBooster(uint256 boosterId, address to) external payable  {
        require(boosterId < boosterCount, "list null");
        require(ownerOf(boosterId) == msg.sender, "You do not own this booster");

        BoosterDetails memory booster = boosters[boosterId];

        require(msg.value >= booster.price, "Insufficient payment for the booster");
        safeTransferFrom(msg.sender, to, boosterId);
    }

    function getBoosterDetails(uint256 boosterId) external view returns (BoosterDetails memory) {
        require(boosterId < boosterCount, "list null");
        return boosters[boosterId];
    }

     function uint256ToString(uint256 _number) internal pure returns (string memory) {
        // Gestion du cas où le nombre est 0
        if (_number == 0) {
            return "0";
        }

        uint256 temp = _number;
        uint256 digits;

        // Compter le nombre de chiffres
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        // Créer un tableau de bytes pour stocker les chiffres
        bytes memory buffer = new bytes(digits);
        
        // Remplir le tableau avec les chiffres
        while (_number != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + _number % 10)); // 48 est le code ASCII pour '0'
            _number /= 10;
        }
        
        return string(buffer);
    }

    function concatStringAndUint(string memory _str, uint256 _number) public pure returns (string memory) {
        return string(abi.encodePacked(_str, uint256ToString(_number)));
    }
}