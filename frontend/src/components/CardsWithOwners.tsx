import { useEffect, useState } from 'react';

interface CardOwner {
    cardNumber: number;
    img: string;
    tokenId: string;
    cardOwner: string;
}

export const CardsWithOwners = () => {
    const [cardsWithOwners, setCardsWithOwners] = useState<CardOwner[]>([]);

    // Fonction pour récupérer les données de cartes avec propriétaires
    const fetchCardsWithOwners = async () => {
        try {
            const response = await fetch('http://localhost:3000/cards-with-owners');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCardsWithOwners(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des cartes avec propriétaires:', error);
        }
    };

    // Récupérer les cartes avec propriétaires au chargement du composant
    useEffect(() => {
        fetchCardsWithOwners();
    }, []);

    return (
        <div>
            <h2>All Cards with Owners</h2>
            <div>
                {cardsWithOwners.map((card) => (
                    <div key={card.tokenId}>
                        <p>Card #{card.cardNumber}</p>
                        <img src={card.img} alt={`Card ${card.cardNumber}`} width="150" />
                        <p>Owner: {card.cardOwner}</p>
                        <p>Token ID: {card.tokenId}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CardsWithOwners;
