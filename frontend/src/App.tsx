import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.css';
import * as ethereum from '@/lib/ethereum';
import * as main from '@/lib/main';
import CreateAndMint from './components/CreateAndMint';
import FetchComponent from './components/FetchComponent';

type Canceler = () => void;

// Custom hook to manage side effects
const useAffect = (asyncEffect: () => Promise<Canceler | void>, dependencies: any[] = []) => {
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
    const [activeTab, setActiveTab] = useState<'getInfo' | 'createAndMint'>('getInfo');
    const [card, setCard] = useState<any>(null);
    const [collection, setCollection] = useState<any>(null);

    // Fetch Card details
    const fetchCard = async (cardId: string) => {
        try {
            const response = await fetch(`http://localhost:3000/card/${cardId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCard({
                cardNumber: data.cardNumber,
                img: data.image || "No Image",
                gid: data.id,
                cardOwner: data.cardOwner,
            });
        } catch (error) {
            console.error('Error fetching card:', error);
        }
    };

    // Fetch Collection details
    const fetchCollection = async (collectionId: string) => {
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
                    id: card.id,
                }))
            });
        } catch (error) {
            console.error('Error fetching collection:', error);
        }
    };

    // Handle collection creation
    const handleCreateCollection = async (name: string, count: number) => {
        console.log('Creating collection:', { name, count });
        // Implement API call to create a collection
        try {
            const response = await fetch('http://localhost:3000/createcollection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, count }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error creating collection:', error);
        }
    };

    // Handle card minting
    const handleMintCard = async (collectionId: string, cardId: string) => {
        console.log('Minting card:', { collectionId, cardId });
        // Implement API call to mint a card
        try {
            const response = await fetch('http://localhost:3000/mint-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ collectionId, cardId }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error minting card:', error);
        }
    };

    return (
        <div className={styles.body}>
            <h1>Welcome to Pokémon TCG</h1>

            <div>
                <button onClick={() => setActiveTab('getInfo')}>Get Info</button>
                <button onClick={() => setActiveTab('createAndMint')}>Create & Mint</button>
            </div>

            {activeTab === 'getInfo' && (
                <FetchComponent onFetchCard={fetchCard} onFetchCollection={fetchCollection} />
            )}

            {activeTab === 'createAndMint' && (
                <CreateAndMint onCreate={handleCreateCollection} onMint={handleMintCard} />
            )}

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
    );
};

export default App;
