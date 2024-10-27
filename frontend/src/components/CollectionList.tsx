import React, { useEffect, useState } from 'react';
import styles from '../css/CollectionList.module.css';

interface Card {
    number: number;
    img: string;
    owner: string;
    tokenId: string;
}

interface Collection {
    address: string;
    name: string;
    cardCount: number;
    img: string;
}

const CollectionList: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [loadingCards, setLoadingCards] = useState(false);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await fetch('http://localhost:3000/collections');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Collection[] = await response.json();
                setCollections(data);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error fetching collections:', error);
                    setError(error.message);
                } else {
                    setError('An unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    const fetchCards = async (collection: Collection) => {
        setLoadingCards(true);
        setSelectedCollection(collection);
        setCards([]); // Reset cards in case of a previous selection
        try {
            const response = await fetch(`http://localhost:3000/collection/cards/${collection.name}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCards(data);
        } catch (error) {
            console.error('Error fetching cards:', error);
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setLoadingCards(false);
        }
    };

    const handleBackToCollections = () => {
        setSelectedCollection(null);
        setCards([]);
    };

    if (loading) return <div>Loading collections...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.container}>
            {selectedCollection ? (
                <div>
                    <button onClick={handleBackToCollections}>Back to Collections</button>
                    <h2><img src={selectedCollection.img} alt={`${selectedCollection.name} logo`} className={styles.collectionLogo} /></h2>
                    {loadingCards ? (
                        <div>Loading cards...</div>
                    ) : (
                        <div className={styles.gridcards}>
                            {cards.length > 0 ? (
                                cards.map((card) => (
                                    <div key={card.tokenId} className={styles.cardItem}>
                                        <p>Card #{card.number}</p>
                                        <img src={card.img} alt={`Card ${card.number}`} className={styles.cardImage} />
                                    </div>
                                ))
                            ) : (
                                <p>No cards found for this collection.</p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h2>All Collections</h2>
                    {collections.length === 0 ? (
                        <p>No collections found.</p>
                    ) : (
                        <div className={styles.grid}>
                            {collections.map((collection) => (
                                <div
                                    key={collection.address}
                                    className={styles.collectionItem}
                                    onClick={() => fetchCards(collection)}
                                >
                                    <h3>{collection.name}</h3>
                                    <img src={collection.img} alt={collection.name} className={styles.collectionImage} />
                                    <p>Card Count: {collection.cardCount}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CollectionList;
