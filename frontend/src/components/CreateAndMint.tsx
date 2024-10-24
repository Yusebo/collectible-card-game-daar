import React, { useState } from 'react';

const CreateAndMint: React.FC<{ onCreate: (name: string, count: number) => void; onMint: (collectionId: string, cardId: string) => void; }> = ({ onCreate, onMint }) => {
    const [name, setName] = useState('');
    const [count, setCount] = useState(0);
    const [collectionId, setCollectionId] = useState('');
    const [cardId, setCardId] = useState('');

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(name, count);
        setName('');
        setCount(0);
    };

    const handleMintSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onMint(collectionId, cardId);
        setCollectionId('');
        setCardId('');
    };

    return (
        <div>
            <form onSubmit={handleCreateSubmit}>
                <h2>Create Collection</h2>
                <label>
                    Name:
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>
                <label>
                    number card:
                    <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} required />
                </label>
                <button type="submit">Create Collection</button>
            </form>
            <form onSubmit={handleMintSubmit}>
                <h2>Mint Card</h2>
                <label>
                    Collection ID:
                    <input type="text" value={collectionId} onChange={(e) => setCollectionId(e.target.value)} required />
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
