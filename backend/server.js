require('dotenv').config();
const express = require('express');
const Web3 = require('web3');
const app = express();
const port = process.env.PORT || 3000;
const { ethers } = require('ethers');
const cors = require('cors');
const { contractAddress, contractAbi } = require('./config');


app.use(cors());
app.use(express.json());

if (!process.env.RPC_URL || !process.env.PRIVATE_KEY ) {
  console.error('Les variables d\'environnement RPC_URL, PRIVATE_KEY');
  process.exit(1);
}

console.log(contractAddress)

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractAbi, signer);

const apiurl = "https://api.pokemontcg.io/v2/"



app.post('/mint-card', async (req, res) => {
  const { collectionId, cardId, user } = req.body;
  const apiUrl = `https://api.pokemontcg.io/v2/cards/base1-${cardId}`;
  try {
    const response = await axios.get(apiUrl);
    const cardData = response.data;

    const tx = await contract.mintCardForUser(collectionId, cardData.images.large, user);
    await tx.wait(); // Attendre que la transaction soit minée
    res.json({ success: true, transaction: tx });
  } catch (error) {
    res.status(500).send('Error minting card');
  }
});

app.get('/card/:id', async (req, res) => {
  const nftId = req.params.id;
  console.log(nftId)
  try {
    // Call the smart contract to get the NFT information
    const nftInfo = await contract.getCardInfo(nftId).call();
    const nftData = {
      name: `Card #${nftInfo.cardNumber}`,
      image: nftInfo.img || "No Image"
    };
    res.json(nftData);
  } catch (error) {
    res.status(500).send('Error fetching NFT information');
  }
});

app.post('/createcollection', async (req, res) => {
  const { name, cardCount } = req.body;

  try {
    const tx = await contract.createCollection(name, cardCount);
    await tx.wait(); // Attendre que la transaction soit minée
    res.json({ success: true, transaction: tx });
  } catch (error) {
    res.status(500).send('Error creating collection');
  }
});

// Route pour récupérer toutes les collections
app.get('/collections', async (req, res) => {
  try {
      const collections = await contract.getAllCollections();
      
      const collectionData = collections.map((collection) => ({
          name: collection.name,
          address: collection.collectionAddress,
          cardCount: collection.cardCount.toNumber(), // Convertir BigNumber en nombre
      }));

      res.json(collectionData);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching collections');
  }
});


app.get('/collection/:id', async (req, res) => {
  const collectionId = req.params.id;
  try {
    const collectionInfo = await contract.getCollection(collectionId).call();

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

app.get('/booster/:id', async (req, res) => {
  const boosterId = req.params.id;

  try {
    const boosterDetails = await contract.getBoosterDetails(boosterId);
    const boosterData = {
      set: boosterDetails.set,
      totalCard: boosterDetails.total_card.toString(),
      setCard: boosterDetails.set_card.toString(),
      img: boosterDetails.img || "No Image",
      price: ethers.utils.formatEther(boosterDetails.price) // Convertir en ether si nécessaire
    };
    res.json(boosterData);
  } catch (error) {
    res.status(500).send('Error fetching booster information');
  }
});

// Route pour créer un booster
app.post('/createbooster', async (req, res) => {
  const { set, total_card, set_card, img, price } = req.body;

  try {
    const tx = await contract.createBooster(set, set_card, total_card, img, ethers.utils.parseEther(price));
    await tx.wait(); // Attendre que la transaction soit minée
    res.json({ success: true, transaction: tx });
  } catch (error) {
    res.status(500).send('Error creating booster');
  }
});

// Route pour ouvrir un booster
app.post('/booster/open/:id', async (req, res) => {
  const boosterId = req.params.id;

  try {
    const tx = await boosterContract.openBooster(boosterId);
    await tx.wait();
    res.json({ success: true, transaction: tx });
  } catch (error) {
    res.status(500).send('Error opening booster');
  }
});

// Route pour échanger un booster
app.post('/booster/redeem/:id', async (req, res) => {
  const boosterId = req.params.id;
  const { to, value } = req.body;

  try {
    const tx = await boosterContract.redeemBooster(boosterId, to, { value: ethers.utils.parseEther(value) });
    await tx.wait();
    res.json({ success: true, transaction: tx });
  } catch (error) {
    res.status(500).send('Error redeeming booster');
  }
});


app.listen(port, () => {
  console.log(`API listening at ${port}`);
});