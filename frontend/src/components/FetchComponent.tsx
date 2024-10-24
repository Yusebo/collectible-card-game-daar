import React, { useState } from 'react';

const FetchComponent: React.FC<{ onFetchCard: (cardId: string) => void; onFetchCollection: (collectionId: string) => void; }> = ({ onFetchCard, onFetchCollection }) => {
    const [cardId, setCardId] = useState('');
    const [collectionId, setCollectionId] = useState('');

    return (
        <div>
            <h2>Fetch Info</h2>
            <div>
                <h3>Fetch Card Info</h3>
                <input
                    type="text"
                    placeholder="Enter Card ID"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                />
                <button onClick={() => { onFetchCard(cardId); setCardId(''); }}>Fetch Card</button>
            </div>
            <div>
                <h3>Fetch Collection Info</h3>
                <input
                    type="text"
                    placeholder="Enter Collection ID"
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                />
                <button onClick={() => { onFetchCollection(collectionId); setCollectionId(''); }}>Fetch Collection</button>
            </div>
        </div>
    );
};

export default FetchComponent;
