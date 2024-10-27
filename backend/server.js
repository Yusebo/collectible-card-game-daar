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

const cardData = {}; 
const collectionData = {};


async function fetchCardSets() {
  try {
    const response = await fetch(apiUrl);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! Status: ${response.status}`);
    }
    
    const data = await response.json();
    // Récupérer tous les ID et les totaux de cartes
    const sets = data.data
    .map(set => ({
      id: set.id,
      totalCards: set.total,
      img: set.images.logo,
      date: set.releaseDate 
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Tri par ordre croissant
  
    
    createCollectionsForSets(sets);
  } catch (error) {
    console.error("Erreur lors de la récupération des ensembles de cartes :", error);
  }
}

async function createCollectionsForSets(sets) {
  for (const set of sets) {
    const { id, totalCards, img , date} = set; // Assurez-vous que id et totalCards sont bien définis

    // Vérifiez que les valeurs sont valides avant d'appeler la fonction
    if (!id || totalCards === undefined) {
      console.error(`Invalid set data: ${JSON.stringify(set)}`);
      continue; // Passer à l'ensemble suivant
    }

    try {
      // Créer une collection pour chaque ensemble
      const tx = await contract.createCollection(id, totalCards, img);
      await tx.wait(); // Attendre que la transaction soit minée
      //console.log(`Collection created for set ${id} with total cards: ${totalCards}`);
    } catch (error) {
      console.error(`Error creating collection for set ${id}:`, error);
    }
  }
}

async function fetchCardsfromSet(setId) {
  const apiUrl = `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Erreur HTTP ! Status: ${response.status}`);
    }

    const data = await response.json();
    const cards = data.data.map(card => ({
      id: card.id,
      name: card.name,
      img: card.images.small || "No Image",
      number: card.number
    }));

    return cards;
  } catch (error) {
    console.error("Erreur lors de la récupération des cartes de l'ensemble :", error);
  }
}


// Appeler la fonction pour récupérer les ensembles de cartes
fetchCardSets();


app.post('/mint-card', async (req, res) => {
  const { collectionId, cardId,  set} = req.body;
  const apiUrl = `https://api.pokemontcg.io/v2/cards/${set}-${cardId}`;
  console.log(apiUrl, collectionId, set, cardId);
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

  try {
    // Appel de la fonction pour déclencher l'événement
    const card = await contract.get_card_in_Collection(Number(collectionId), Number(cardId));
    // Utilisation d'une promesse pour gérer l'événement
    const cardInfo = await new Promise((resolve, reject) => {
      contract.once('CardInfoRetrieved', (collect_id, id_card, img, cardid, id, owner) => {
        // Vérifie que les ID de collection et de carte correspondent
        if (collect_id.toString() === collectionId && id_card.toString() === cardId) {
          // Formatage des données à renvoyer
          resolve({
            collectionId: collect_id.toString(), // Converti en chaîne
            cardId: id_card.toString(), // Converti en chaîne
            image: img || "No Image",
            cardNumber: cardid.toString(), // Converti en chaîne
            tokenId: id.toString(), // Converti en chaîne
            owner: owner
          });
        }
      });

      // Timeout au cas où l'événement ne serait pas émis
      setTimeout(() => {
        reject(new Error("Timeout: CardInfoRetrieved event not emitted"));
      }, 5000); // 5 secondes de timeout
    });

    // Envoi des informations de carte au client
    res.json(cardInfo);
  } catch (error) {
    console.error("Erreur lors de la récupération de la carte:", error);
    res.status(500).send('Erreur lors de la récupération des informations de la carte');
  }
});

app.get('/collection/cards/:id', async (req, res) => {
  const collectionId = req.params.id;
  try {
    const response = await fetchCardsfromSet(collectionId);
    res.json(response);
  }
  catch (error) {
    console.error("Erreur lors de la récupération des cartes de la collection :", error);
    res.status(500).send('Erreur lors de la récupération des cartes de la collection');
  }
});


// Ajout d'une route pour récupérer toutes les cartes avec leur token et propriétaire
app.get('/cards-with-owners', async (req, res) => {
  try {
    const [allCards, allOwners] = await contract.getAllCardsWithOwner();

    // Formater les données pour un envoi lisible par le frontend
    const cardsWithOwners = allCards.map((card, index) => ({
      img: card[0] || "No Image",         // URL de l'image
      cardNumber: card[1].toString(),      // Numéro de la carte
      tokenId: card[2].toString(),         // ID du token
      cardOwner: allOwners[index]          // Adresse du propriétaire
    }));

    res.json(cardsWithOwners);
  } catch (error) {
    console.error("Erreur lors de la récupération des cartes avec leurs propriétaires :", error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des cartes' });
  }
});

// Route pour récupérer toutes les collections
app.get('/collections', async (req, res) => {
  try {
    // Appel de la fonction pour obtenir toutes les collections
    const collections = await contract.getAllCollections();

    // Transformer les données de collection en un tableau d'objets lisibles
    const collectionData = collections.map((collection) => ({
      name: collection[0], // Le nom de la collection
      address: collection[1], // L'adresse de la collection
      cardCount: collection[2].toString(), 
      img : collection[3]
    }));

    // Afficher les données transformées pour le débogage


    // Envoyer les données au client
    res.json(collectionData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des collections');
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




app.listen(port, () => {
  console.log(`API listening at ${port}`);
});