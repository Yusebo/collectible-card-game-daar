import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './css/App.module.css';
import * as ethereum from '@/lib/ethereum';
import * as main from '@/lib/main';
import CreateAndMint from './components/CreateAndMint';
import CollectionList from './components/CollectionList';
import CardsWithOwners from './components/CardsWithOwners';

interface Card {
    cardNumber: number;
    img: string;
    gid: string; // Using cardId as gid
    cardOwner: string;
}

interface Collection {
    name: string;
    collectionAddress: string;
    cardCount: number;
    cards: Card[];
    img : string;
}

type Canceler = () => void;

// Custom hook to manage side effects
const useAffect = (asyncEffect: () => Promise<Canceler | void>, dependencies: any[] = []) => {
    const cancelerRef = useRef<Canceler | void>();
    useEffect(() => {
        asyncEffect()
            .then(canceler => (cancelerRef.current = canceler))
            .catch(error => console.warn('Uncaught error', error));
        return () => {
            if (cancelerRef.current) {
                cancelerRef.current();
                cancelerRef.current = undefined;
            }
        };
    }, dependencies);
};

// Custom hook to manage wallet connection
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

// Main App Component
export const App = () => {
    const wallet = useWallet();
    const [activeTab, setActiveTab] = useState<'createAndMint' | 'viewCollections' | 'viewCardsWithOwners'>('viewCollections');
    const [card, setCard] = useState<Card | null>(null);
    const [collection, setCollection] = useState<Collection | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch Card details
    const fetchCard = async (collectionId: string, cardId: string): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3000/card/${collectionId}/${cardId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCard(data);
        } catch (error) {
            console.error('Error fetching card:', error);
            setError('Failed to fetch card details.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Collection details
    const fetchCollection = async (collectionId: string): Promise<void> => {
        try {
            const response = await fetch(`http://localhost:3000/collection/${collectionId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCollection({
                name: data.name,
                collectionAddress: data.address,
                cardCount: data.cardCount,
                cards: data.cards.map((card: any) => ({
                    cardNumber: card.cardNumber,
                    img: card.img || "No Image",
                    gid: card.id,
                    
                })),
                img :data.img
            });
        } catch (error) {
            console.error('Error fetching collection:', error);
        }
    };

    // Handle collection creation
    const handleCreateCollection = async (name: string, cardCount: number): Promise<void> => {
        try {
            const response = await fetch('http://localhost:3000/createcollection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, cardCount }),
            });
            const data = await response.json();
            console.log('Collection created:', data);
        } catch (error) {
            console.error('Error creating collection:', error);
        }
    };

    // Handle card minting
    const handleMintCard = async (collectionId: string, cardId: string, set: string): Promise<void> => {
        try {
            const response = await fetch('http://localhost:3000/mint-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ collectionId, cardId, set }),
            });
            const data = await response.json();
            console.log('Card minted:', data);
        } catch (error) {
            console.error('Error minting card:', error);
        }
    };

    return (
        <div className={styles.app}>
            <h1>
            <img src="../public/logo.png" alt="Pokémon TCG" className="logo" />
    
            <div>
                <button onClick={() => setActiveTab('viewCollections')}>Encyclopedia</button>
                <button onClick={() => setActiveTab('createAndMint')}>Create & Mint</button>
                <button onClick={() => setActiveTab('viewCardsWithOwners')}>View Cards With Owners</button>
            </div>

            </h1>

            <div className={styles.body}>
    
            {activeTab === 'createAndMint' && (
                <CreateAndMint onMint={handleMintCard} />
            )}
    
            {activeTab === 'viewCollections' && <CollectionList />}
    
            {activeTab === 'viewCardsWithOwners' && <CardsWithOwners />}

            {loading && <p>Loading card details...</p>}
            {card && (
                <div>
                    <h3>Card #{card.cardNumber}</h3>
                    <img src={card.img} alt={`Card ${card.cardNumber}`} width="200" />
                    <p>Owner: {card.cardOwner}</p>
                </div>
            )}

            {collection && (
                <div>
                    <h3>Collection: {collection.name}</h3>
                    <p>Address: {collection.collectionAddress}</p>
                    <p>Card Count: {collection.cardCount}</p>
                    <div>
                        <h4>Cards:</h4>
                        {collection.cards.map((card, index) => (
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

export default App;
