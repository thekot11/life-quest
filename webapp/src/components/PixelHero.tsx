interface Props {
  level: number;
}

export function PixelHero({ level }: Props) {
  // Determine tier: 1 = basic, 2 = upgraded, 3 = epic
  const tier = level >= 5 ? 3 : level >= 3 ? 2 : 1;

  return (
    <div className="flex flex-col items-center">
      <div className="relative animate-bounce-slow">
        <svg width="80" height="96" viewBox="0 0 16 20" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
          {/* Shadow */}
          <ellipse cx="8" cy="19" rx="4" ry="1" fill="rgba(0,0,0,0.15)" />
          
          {/* Tier 3: Glow effect */}
          {tier >= 3 && (
            <>
              <rect x="6" y="0" width="4" height="1" fill="#FFD700" opacity="0.6" />
              <rect x="5" y="1" width="6" height="1" fill="#FFD700" opacity="0.4" />
              <circle cx="8" cy="10" r="7" fill="#FFD700" opacity="0.08" />
            </>
          )}
          
          {/* Tier 3: Crown */}
          {tier >= 3 && (
            <>
              <rect x="5" y="1" width="1" height="2" fill="#FFD700" />
              <rect x="7" y="1" width="1" height="2" fill="#FFD700" />
              <rect x="9" y="1" width="1" height="2" fill="#FFD700" />
              <rect x="5" y="3" width="5" height="1" fill="#FFD700" />
              <rect x="6" y="2" width="3" height="1" fill="#FFA500" />
            </>
          )}
          
          {/* Hair */}
          <rect x="5" y={tier >= 3 ? 4 : 2} width="6" height="2" fill={tier >= 2 ? '#4A3728' : '#6B4C3B'} />
          <rect x="4" y={tier >= 3 ? 5 : 3} width="1" height="2" fill={tier >= 2 ? '#4A3728' : '#6B4C3B'} />
          <rect x="11" y={tier >= 3 ? 5 : 3} width="1" height="2" fill={tier >= 2 ? '#4A3728' : '#6B4C3B'} />
          
          {/* Head */}
          <rect x="5" y={tier >= 3 ? 6 : 4} width="6" height="5" fill="#FDBCB4" />
          
          {/* Eyes */}
          <rect x="6" y={tier >= 3 ? 7 : 5} width="1" height="1" fill="#2D2D2D" />
          <rect x="9" y={tier >= 3 ? 7 : 5} width="1" height="1" fill="#2D2D2D" />
          
          {/* Mouth */}
          <rect x="7" y={tier >= 3 ? 9 : 7} width="2" height="1" fill="#E88B7A" />
          
          {/* Tier 2+: Scar / marking */}
          {tier >= 2 && (
            <rect x="10" y={tier >= 3 ? 8 : 6} width="1" height="2" fill="#D4A090" />
          )}
          
          {/* Body / Armor */}
          <rect x="4" y={tier >= 3 ? 11 : 9} width="8" height="4" fill={
            tier >= 3 ? '#7C3AED' : tier >= 2 ? '#3B82F6' : '#8B5CF6'
          } />
          
          {/* Tier 2+: Chest emblem */}
          {tier >= 2 && (
            <rect x="7" y={tier >= 3 ? 12 : 10} width="2" height="2" fill={
              tier >= 3 ? '#FFD700' : '#60A5FA'
            } />
          )}
          
          {/* Tier 3: Shoulder pads */}
          {tier >= 3 && (
            <>
              <rect x="3" y="11" width="1" height="2" fill="#6D28D9" />
              <rect x="12" y="11" width="1" height="2" fill="#6D28D9" />
              <rect x="2" y="11" width="1" height="1" fill="#FFD700" />
              <rect x="13" y="11" width="1" height="1" fill="#FFD700" />
            </>
          )}
          
          {/* Arms */}
          <rect x="3" y={tier >= 3 ? 11 : 9} width="1" height="4" fill="#FDBCB4" />
          <rect x="12" y={tier >= 3 ? 11 : 9} width="1" height="4" fill="#FDBCB4" />
          
          {/* Tier 2+: Cape */}
          {tier >= 2 && (
            <>
              <rect x="3" y={tier >= 3 ? 11 : 9} width="1" height="5" fill={tier >= 3 ? '#7C3AED' : '#1D4ED8'} opacity="0.7" />
              <rect x="12" y={tier >= 3 ? 11 : 9} width="1" height="5" fill={tier >= 3 ? '#7C3AED' : '#1D4ED8'} opacity="0.7" />
              <rect x="2" y={tier >= 3 ? 14 : 12} width="2" height="2" fill={tier >= 3 ? '#6D28D9' : '#1E40AF'} opacity="0.5" />
              <rect x="12" y={tier >= 3 ? 14 : 12} width="2" height="2" fill={tier >= 3 ? '#6D28D9' : '#1E40AF'} opacity="0.5" />
            </>
          )}
          
          {/* Tier 1: Sword (simple stick) */}
          {tier === 1 && (
            <rect x="13" y="8" width="1" height="5" fill="#9CA3AF" />
          )}
          
          {/* Tier 2: Better sword */}
          {tier === 2 && (
            <>
              <rect x="13" y="7" width="1" height="6" fill="#60A5FA" />
              <rect x="12" y="9" width="3" height="1" fill="#93C5FD" />
            </>
          )}
          
          {/* Tier 3: Glowing sword */}
          {tier >= 3 && (
            <>
              <rect x="14" y="6" width="1" height="7" fill="#A78BFA" />
              <rect x="13" y="6" width="1" height="1" fill="#FFD700" />
              <rect x="13" y="9" width="3" height="1" fill="#C4B5FD" />
              <rect x="14" y="5" width="1" height="1" fill="#DDD6FE" opacity="0.7" />
            </>
          )}
          
          {/* Legs */}
          <rect x="5" y={tier >= 3 ? 15 : 13} width="2" height="3" fill={tier >= 3 ? '#4C1D95' : tier >= 2 ? '#1E3A5F' : '#4B5563'} />
          <rect x="9" y={tier >= 3 ? 15 : 13} width="2" height="3" fill={tier >= 3 ? '#4C1D95' : tier >= 2 ? '#1E3A5F' : '#4B5563'} />
          
          {/* Boots */}
          <rect x="4" y={tier >= 3 ? 17 : 15} width="3" height="1" fill={tier >= 3 ? '#7C3AED' : tier >= 2 ? '#92400E' : '#78716C'} />
          <rect x="9" y={tier >= 3 ? 17 : 15} width="3" height="1" fill={tier >= 3 ? '#7C3AED' : tier >= 2 ? '#92400E' : '#78716C'} />
        </svg>
        
        {/* Tier 3: Sparkle particles */}
        {tier >= 3 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '2s' }} />
            <div className="absolute top-4 right-1 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '0.7s', animationDuration: '2s' }} />
            <div className="absolute bottom-6 left-0 w-1 h-1 bg-yellow-200 rounded-full animate-ping" style={{ animationDelay: '1.3s', animationDuration: '2s' }} />
          </div>
        )}
      </div>
      
      {/* Tier label */}
      <div className={`mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        tier >= 3 ? 'bg-purple-100 text-purple-700' :
        tier >= 2 ? 'bg-blue-100 text-blue-700' :
        'bg-gray-100 text-gray-500'
      }`}>
        {tier >= 3 ? '👑 Эпик' : tier >= 2 ? '⚔️ Воин' : '🌱 Новичок'}
      </div>
    </div>
  );
}
