const express = require('express');
const Web3 = require('web3');
const app = express();
const port = 3000;
const { ethers } = require('ethers');
const cors = require('cors');
// Replace this with your deployed contract ABI and address
const contractABI = [  
{
  "constant": true,
  "inputs": [{"name": "_id", "type": "uint256"}],
  "name": "getCardInfo",
  "outputs": [
    {"name": "img", "type": "string"},
    {"name": "cardNumber", "type": "uint256"},
    {"name": "gid", "type": "int256"},
    {"name": "cardOwner", "type": "address"}
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}
,  
{
  "constant": true,
  "inputs": [{"name": "collectionId", "type": "uint256"}],
  "name": "getCollectionsAndCards",
  "outputs": [
    {
      "components": [
        {"name": "name", "type": "string"},
        {"name": "collectionAddress", "type": "address"},
        {"name": "cardCount", "type": "uint256"},
        {
          "components": [
            {"name": "img", "type": "string"},
            {"name": "cardNumber", "type": "uint256"},
            {"name": "id", "type": "int256"}
          ],
          "name": "cards",
          "type": "tuple[]"
        }
      ],
      "name": "",
      "type": "tuple"
    }
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}
];
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractABI, signer);
// Endpoint to get NFT information
app.get('/card/:id', async (req, res) => {
  const nftId = req.params.id;
  
  try {
    // Call the smart contract to get the NFT information
    const nftInfo = await contract.methods.getCardInfo(nftId).call();
    const nftData = {
      name: `Card #${nftInfo.cardNumber}`,
      image: nftInfo.img || "No Image"
    };
    res.json(nftData);
  } catch (error) {
    res.status(500).send('Error fetching NFT information');
  }
});

app.get('/collection/:id', async (req, res) => {
  const collectionId = req.params.id;

  try {
    // Call the smart contract to get the collection information
    const collectionInfo = await contract.methods.getCollectionsAndCards(collectionId).call();

    // Format the data to send in the response
    const collectionData = {
      name: collectionInfo.name,
      address: collectionInfo.collectionAddress,
      cardCount: collectionInfo.cardCount,
      cards: collectionInfo.cards.map(card => ({
        img: card.img || "No Image",
        cardNumber: card.cardNumber,
        id: card.id
      }))
    };

    res.json(collectionData);
  } catch (error) {
    res.status(500).send('Error fetching collection information');
  }
});


app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});