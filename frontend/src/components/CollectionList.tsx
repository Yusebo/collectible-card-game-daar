import React, { useEffect, useState } from 'react';
import styles from '../css/CollectionList.module.css';

// Define the Collection interface
interface Collection {
    address: string;
    name: string;
    cardCount: number;
    img: string
}

const CollectionList: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]); // Specify the type here
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await fetch('http://localhost:3000/collections');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Collection[] = await response.json(); // Ensure the response is of type Collection[]
                setCollections(data);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error fetching collections:', error);
                    setError(error.message);
                } else {
                    console.error('Unexpected error fetching collections:', error);
                    setError('An unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    if (loading) {
        return <div>Loading collections...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.container}>
            <h2>All Collections</h2>
            {collections.length === 0 ? (
                <p>No collections found.</p>
            ) : (
                <div className={styles.grid}>
                    {collections.map((collection) => (
                        <div key={collection.address} className={styles.collectionItem}>
                            <h3>{collection.name}</h3>
                            <img src={collection.img} alt={collection.name} className={styles.collectionImage} />
                            <p>Card Count: {collection.cardCount}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CollectionList;
