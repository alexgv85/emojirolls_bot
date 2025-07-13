import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import type { PvpParticipant, User, Gift } from "@shared/schema";

interface RouletteWheelProps {
  participants: (PvpParticipant & { user: User; gift: Gift })[];
  isSpinning: boolean;
}

export default function RouletteWheel({ participants, isSpinning }: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning) {
      // Random rotation between 1440 and 2160 degrees (4-6 full rotations)
      const finalRotation = 1440 + Math.random() * 720;
      setRotation(finalRotation);
    }
  }, [isSpinning]);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
  ];

  const generateSegments = () => {
    if (participants.length === 0) {
      return (
        <div className="absolute inset-0 rounded-full bg-gradient-conic from-gray-600 via-gray-500 to-gray-600"></div>
      );
    }

    const totalValue = participants.reduce((sum, p) => sum + parseFloat(p.gift.value), 0);
    let currentAngle = 0;

    const segments = participants.map((participant, index) => {
      const percentage = (parseFloat(participant.gift.value) / totalValue) * 100;
      const angle = (percentage / 100) * 360;
      const color = colors[index % colors.length];
      
      const segment = (
        <div
          key={participant.id}
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from ${currentAngle}deg, ${color} 0deg, ${color} ${angle}deg, transparent ${angle}deg)`,
            clipPath: `circle(50%)`,
          }}
        />
      );
      
      currentAngle += angle;
      return segment;
    });

    return segments;
  };

  return (
    <div className="relative w-64 h-64 mx-auto mb-4">
      <div 
        className={`w-full h-full rounded-full border-4 border-[var(--telegram-blue)] relative overflow-hidden transition-transform duration-3000 ease-out`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {generateSegments()}
        
        {/* Center Circle */}
        <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[var(--dark-bg)] rounded-full flex items-center justify-center border-4 border-[var(--telegram-blue)] z-10">
          <Trophy className="w-6 h-6 text-[var(--telegram-blue)]" />
        </div>
      </div>
      
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[20px] border-l-transparent border-r-transparent border-b-white z-20"></div>
    </div>
  );
}
