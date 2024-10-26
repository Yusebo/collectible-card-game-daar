import React, { useState } from 'react';

const CreateAndMint: React.FC<{onMint: (collectionId: string, cardId: string) => void; }> = ({  onMint }) => {
    const [name, setName] = useState('');
    const [count, setCount] = useState(0);
    const [collectionId, setCollectionId] = useState('');
    const [cardId, setCardId] = useState('');


    const handleMintSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onMint(collectionId, cardId);
        setCollectionId('');
        setCardId('');
    };

    return (
        <div>
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
