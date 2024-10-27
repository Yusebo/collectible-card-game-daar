import React, { useState, useEffect } from 'react';
import styles from '../css/CreateAndMint.module.css'; // Assurez-vous que le chemin est correct

const CreateAndMint: React.FC<{ onMint: (collectionId: string, cardId: string, set: string) => void; }> = ({ onMint }) => {
    const [name, setName] = useState('');
    const [count, setCount] = useState(0);
    const [sets, setSets] = useState<{ name: string; address: string }[]>([]);
    const [cardId, setCardId] = useState('');
    const [selectedSet, setSelectedSet] = useState(''); // Define selectedSet

    useEffect(() => {
        const fetchSets = async () => {
            try {
                const response = await fetch('http://localhost:3000/collections');
                const data = await response.json();
                setSets(data);
            } catch (error) {
                console.error('Error fetching sets:', error);
            }
        };
        fetchSets();
    }, []);

    const handleMintSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const index = sets.findIndex(set => set.name === selectedSet);
        const updatedCollectionId = index !== -1 ? index.toString() : ''; // Use the index as collectionId
        console.log(updatedCollectionId)
        onMint(updatedCollectionId, cardId, selectedSet);
        setCardId('');
        setSelectedSet(''); // Reset the selected set after minting
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleMintSubmit}>
                <h2>Mint Card</h2>
                <label>
                    Select Set:
                    <select value={selectedSet} onChange={(e) => setSelectedSet(e.target.value)}>
                        <option value="">Select a set</option>
                        {sets.map((set, index) => (
                            <option key={set.address} value={set.name}>{set.name}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Card ID:
                    <input type="text" value={cardId} onChange={(e) => setCardId(e.target.value)} required />
                </label>
                <button type="submit">Mint Card</button>
            </form>
        </div>
    );
};

export default CreateAndMint;
