import React, { useState } from 'react';

interface FetchComponentProps {
  onFetchCard: (collectioncard: string, cardId: string) => void;
  onFetchCollection: (collectionId: string) => void;
}

const FetchComponent: React.FC<FetchComponentProps> = ({ onFetchCard, onFetchCollection }) => {
    const [cardId, setCardId] = useState('');
    const [collectionId, setCollectionId] = useState('');
    const [collectioncard, setCollectioncard] = useState('');

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
                <input
                    type="text"
                    placeholder="Enter Collection ID"
                    value={collectioncard}
                    onChange={(e) => setCollectioncard(e.target.value)}
                />
                <button onClick={() => { 
                    onFetchCard(collectioncard, cardId); // Appel modifié
                    setCardId(''); 
                    setCollectioncard(''); 
                }}>Fetch Card</button>
            </div>
        </div>
    );
};

export default FetchComponent;


