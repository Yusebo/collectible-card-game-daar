import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.css';
import * as ethereum from '@/lib/ethereum';
import * as main from '@/lib/main';

type Canceler = () => void;

const useAffect = (
  asyncEffect: () => Promise<Canceler | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<Canceler | void>();
  useEffect(() => {
    asyncEffect()
      .then(canceler => (cancelerRef.current = canceler))
      .catch(error => console.warn('Uncatched error', error));
    return () => {
      if (cancelerRef.current) {
        cancelerRef.current();
        cancelerRef.current = undefined;
      }
    };
  }, dependencies);
};

const useWallet = () => {
  const [details, setDetails] = useState<ethereum.Details>();
  const [contract, setContract] = useState<main.Main>();
  
  useAffect(async () => {
    const details_ = await ethereum.connect('metamask');
    if (!details_) return;
    setDetails(details_);
    const contract_ = await main.init(details_);
    if (!contract_) return;
    setContract(contract_);
  }, []);
  
  return useMemo(() => {
    if (!details || !contract) return;
    return { details, contract };
  }, [details, contract]);
};

export const App = () => {
  const wallet = useWallet();
  const [card, setCard] = useState<any>(null);
  const [collection, setCollection] = useState<any>(null);
  const [cardId, setCardId] = useState('');
  const [collectionId, setCollectionId] = useState('');

  const fetchCard = async () => {
    try {
      const response = await fetch(`http://localhost:3000/card/${cardId}`);
      const data = await response.json();
      setCard({
        cardNumber: data.cardNumber,
        img: data.image || "No Image",
        gid: data.gid,  // Assuming it's part of the metadata
        cardOwner: data.cardOwner,
      });
    } catch (error) {
      console.error('Error fetching card:', error);
    }
  };

  const fetchCollection = async () => {
    try {
      const response = await fetch(`http://localhost:3000/collection/${collectionId}`);
      const data = await response.json();
      setCollection({
        name: data.name,
        collectionAddress: data.address,
        cardCount: data.cardCount,
        cards: data.cards.map((card: any) => ({
          cardNumber: card.cardNumber,
          img: card.img || "No Image",
          id: card.id,
        }))
      });
    } catch (error) {
      console.error('Error fetching collection:', error);
    }
  };

  return (
    <div className={styles.body}>
      <h1>Welcome to Pokémon TCG</h1>

      {/* Fetch Card Section */}
      <div>
        <h2>Fetch Card Info</h2>
        <input
          type="text"
          placeholder="Enter Card ID"
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
        />
        <button onClick={fetchCard}>Fetch Card</button>
        {card && (
          <div>
            <h3>Card #{card.cardNumber}</h3>
            <img src={card.img} alt={`Card ${card.cardNumber}`} width="200" />
            <p>Owner: {card.cardOwner}</p>
          </div>
        )}
      </div>

      {/* Fetch Collection Section */}
      <div>
        <h2>Fetch Collection Info</h2>
        <input
          type="text"
          placeholder="Enter Collection ID"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
        />
        <button onClick={fetchCollection}>Fetch Collection</button>
        {collection && (
          <div>
            <h3>Collection: {collection.name}</h3>
            <p>Address: {collection.collectionAddress}</p>
            <p>Card Count: {collection.cardCount}</p>
            <div>
              <h4>Cards:</h4>
              {collection.cards.map((card: any, index: number) => (
                <div key={index}>
                  <p>Card #{card.cardNumber}</p>
                  <img src={card.img} alt={`Card ${card.cardNumber}`} width="150" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
