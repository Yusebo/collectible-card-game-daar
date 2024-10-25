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


const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractAbi, signer);


const apiUrl = "https://api.pokemontcg.io/v2/sets/";

async function fetchCardSets() {
  try {
    const response = await fetch(apiUrl);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Récupérer tous les ID et les totaux de cartes
    const sets = data.data.map(set => ({
      id: set.id,
      totalCards: set.total
    }));
    
    createCollectionsForSets(sets, contract);
    console.log(sets);
  } catch (error) {
    console.error("Erreur lors de la récupération des ensembles de cartes :", error);
  }
}

async function createCollectionsForSets(sets) {
  for (const set of sets) {
    const { id, totalCards } = set; // Assurez-vous que id et totalCards sont bien définis

    // Vérifiez que les valeurs sont valides avant d'appeler la fonction
    if (!id || totalCards === undefined) {
      console.error(`Invalid set data: ${JSON.stringify(set)}`);
      continue; // Passer à l'ensemble suivant
    }

    try {
      // Créer une collection pour chaque ensemble
      const tx = await contract.createCollection(id, totalCards);
      await tx.wait(); // Attendre que la transaction soit minée
      console.log(`Collection created for set ${id} with total cards: ${totalCards}`);
    } catch (error) {
      console.error(`Error creating collection for set ${id}:`, error);
    }
  }
}




// Appeler la fonction pour récupérer les ensembles de cartes
fetchCardSets();


app.post('/mint-card', async (req, res) => {
  const { collectionId, cardId } = req.body;
  const apiUrl = `https://api.pokemontcg.io/v2/cards/base1-${cardId}`;

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! Status: ${response.status}`);
    }

    const cardData = await response.json();

    // Vérifie que les données contiennent bien l'image
    if (!cardData.data.images || !cardData.data.images.large) {
      throw new Error("Image de la carte non trouvée dans les données de l'API");
    }

    const tx = await contract.mintCardForUser(collectionId, cardData.data.images.large, cardId);
    await tx.wait();

    res.json({ success: true, transaction: tx });
  } catch (error) {
    console.error('Erreur lors de la frappe de la carte:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la frappe de la carte', error: error.message });
  }
});



app.get('/card/:collectionId/:cardId', async (req, res) => {
  const { collectionId, cardId } = req.params;
  console.log('Collection ID:', collectionId);
  console.log('Card ID:', cardId);
  
  try {
    const nftInfo = await contract.get_card_in_Collection(Number(collectionId), Number(cardId));
    
    if (!nftInfo) {
      return res.status(404).send('Card not found in the collection');
    }

    const nftData = {
      image: nftInfo.img || "No Image",
      cardid: `Card #${nftInfo.cardId}`,
      owner: nftInfo.owner
    };
    
    res.json(nftData);
  } catch (error) {
    console.error("Erreur lors de la récupération de la carte:", error);
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
          cardCount: collection.cardCount.toNumber(), // Convert BigNumber to a regular number
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