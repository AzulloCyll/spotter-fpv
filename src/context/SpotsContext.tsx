import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Spot, MOCK_SPOTS } from '../data/mockSpots';

interface SpotsContextType {
    spots: Spot[];
    addSpot: (spot: Spot) => void;
}

const SpotsContext = createContext<SpotsContextType | undefined>(undefined);

export const SpotsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [spots, setSpots] = useState<Spot[]>(MOCK_SPOTS);

    const addSpot = (spot: Spot) => {
        setSpots((prevSpots) => [...prevSpots, spot]);
    };

    return (
        <SpotsContext.Provider value={{ spots, addSpot }}>
            {children}
        </SpotsContext.Provider>
    );
};

export const useSpots = () => {
    const context = useContext(SpotsContext);
    if (context === undefined) {
        throw new Error('useSpots must be used within a SpotsProvider');
    }
    return context;
};
