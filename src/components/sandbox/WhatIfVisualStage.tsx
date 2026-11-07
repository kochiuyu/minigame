import React from 'react';
import { PhaseSpace2DVisualizer } from './visualizers/PhaseSpace2DVisualizer';
import { AuctionSurplusVisualizer } from './visualizers/AuctionSurplusVisualizer';
import { CommonsResourceVisualizer } from './visualizers/CommonsResourceVisualizer';
import { ReactionFunctionVisualizer } from './visualizers/ReactionFunctionVisualizer';
import { TerritoryStripVisualizer } from './visualizers/TerritoryStripVisualizer';

interface WhatIfVisualStageProps {
  gameId: number;
  // Matrix params
  matrixState?: {
    r1Label?: string;
    r2Label?: string;
    c1Label?: string;
    c2Label?: string;
    a11: number;
    a12: number;
    a21: number;
    a22: number;
    b11: number;
    b12: number;
    b21: number;
    b22: number;
  };
  // Specialized params
  myBid?: number;
  val?: number;
  competitorBid?: number;
  isSecondPrice?: boolean;
  effortP1?: number;
  effortP2?: number;
  q1?: number;
  q2?: number;
  cost?: number;
  demandA?: number;
  hotellingX1?: number;
  hotellingX2?: number;
}

export const WhatIfVisualStage: React.FC<WhatIfVisualStageProps> = ({
  gameId,
  matrixState,
  myBid = 7,
  val = 7,
  competitorBid = 6,
  isSecondPrice = true,
  effortP1 = 4,
  effortP2 = 4,
  q1 = 30,
  q2 = 30,
  cost = 10,
  demandA = 100,
  hotellingX1 = 40,
  hotellingX2 = 60
}) => {
  // 1. Matrix Games (1, 3, 4, 13, 15, 17, 18, 999)
  if (matrixState || [1, 3, 4, 13, 15, 17, 18, 999].includes(gameId)) {
    const ms = matrixState || {
      a11: 3, a12: 0, a21: 5, a22: 1,
      b11: 3, b12: 5, b21: 0, b22: 1
    };
    return <PhaseSpace2DVisualizer {...ms} />;
  }

  // 2. Auctions (7, 8, 24, 25)
  if ([7, 8, 24, 25].includes(gameId)) {
    return (
      <AuctionSurplusVisualizer
        isSecondPrice={gameId === 7 || isSecondPrice}
        myBid={myBid}
        trueValuation={val}
        competitorBid={competitorBid}
        title={gameId === 24 ? "Oil Lease Common Value Profit" : gameId === 7 ? "2nd-Price Vickrey Surplus Curve" : "1st-Price Auction Surplus Curve"}
      />
    );
  }

  // 3. Commons & Public Goods (12, 27)
  if ([12, 27].includes(gameId)) {
    return (
      <CommonsResourceVisualizer
        effortP1={effortP1}
        effortP2={effortP2}
        title={gameId === 12 ? "Public Goods Contribution vs Multiplier" : "Fishery Regeneration vs Harvest Curve"}
      />
    );
  }

  // 4. Oligopolies (2, 14, 21)
  if ([2, 14, 21].includes(gameId)) {
    return (
      <ReactionFunctionVisualizer
        q1={q1}
        q2={q2}
        cost={cost}
        demandA={demandA}
        title={gameId === 2 ? "Sequential Entry Reaction Cross" : "Cournot Duopoly Reaction Curves"}
      />
    );
  }

  // 5. Territory & Spatial (9, 22, 28)
  if ([9, 22, 28].includes(gameId)) {
    return (
      <TerritoryStripVisualizer
        pos1={hotellingX1}
        pos2={hotellingX2}
        label1="Firm 1"
        label2="Firm 2"
        title={gameId === 9 ? "Bargaining Surplus Split" : "Linear City Vendor Locations"}
      />
    );
  }

  // Default fallback to 2D Phase Map
  return (
    <PhaseSpace2DVisualizer
      a11={3} a12={0} a21={5} a22={1}
      b11={3} b12={5} b21={0} b22={1}
    />
  );
};
