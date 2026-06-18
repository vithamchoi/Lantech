

// Decorative pixel elements to give the UI a cozy cottagecore/gamified feel

export const PixelFlower = ({ className = "" }: { className?: string }) => (
  <div className={`inline-flex items-center justify-center ${className}`}>
    <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated-svg" style={{ shapeRendering: 'crispEdges' }}>
      {/* Stem */}
      <rect x="7" y="9" width="2" height="7" fill="#007520" />
      {/* Leaves */}
      <rect x="5" y="11" width="2" height="2" fill="#92fa90" />
      <rect x="9" y="10" width="2" height="2" fill="#92fa90" />
      {/* Petals */}
      <rect x="5" y="4" width="6" height="6" fill="#fbb3c1" />
      <rect x="6" y="3" width="4" height="8" fill="#fbb3c1" />
      <rect x="4" y="5" width="8" height="4" fill="#fbb3c1" />
      {/* Center */}
      <rect x="6" y="5" width="4" height="4" fill="#ffe3cf" />
      <rect x="7" y="6" width="2" height="2" fill="#DAA520" />
    </svg>
  </div>
);

export const PixelSprout = ({ className = "" }: { className?: string }) => (
  <div className={`inline-flex items-center justify-center ${className}`}>
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated-svg" style={{ shapeRendering: 'crispEdges' }}>
      {/* Soil */}
      <rect x="4" y="13" width="8" height="3" fill="#514345" />
      {/* Stem */}
      <rect x="7" y="9" width="2" height="4" fill="#007520" />
      {/* Leaf 1 */}
      <rect x="5" y="8" width="2" height="2" fill="#92fa90" />
      <rect x="4" y="7" width="2" height="2" fill="#92fa90" />
      {/* Leaf 2 */}
      <rect x="9" y="7" width="2" height="3" fill="#92fa90" />
      <rect x="10" y="6" width="2" height="2" fill="#92fa90" />
    </svg>
  </div>
);

export const PixelBird = ({ className = "" }: { className?: string }) => (
  <div className={`inline-flex items-center justify-center ${className}`}>
    <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated-svg" style={{ shapeRendering: 'crispEdges' }}>
      {/* Body */}
      <rect x="5" y="6" width="6" height="5" fill="#cee7f0" />
      <rect x="4" y="7" width="8" height="3" fill="#cee7f0" />
      {/* Head */}
      <rect x="8" y="4" width="4" height="3" fill="#cee7f0" />
      <rect x="9" y="3" width="2" height="1" fill="#cee7f0" />
      {/* Eye */}
      <rect x="10" y="5" width="1" height="1" fill="#061e25" />
      {/* Beak */}
      <rect x="12" y="5" width="2" height="1" fill="#DAA520" />
      <rect x="11" y="6" width="1" height="1" fill="#DAA520" />
      {/* Wing */}
      <rect x="5" y="7" width="3" height="2" fill="#b2cad3" />
      {/* Tail */}
      <rect x="3" y="6" width="2" height="2" fill="#b2cad3" />
      {/* Legs */}
      <rect x="6" y="11" width="1" height="2" fill="#DAA520" />
      <rect x="8" y="11" width="1" height="2" fill="#DAA520" />
    </svg>
  </div>
);

export const PixelStar = ({ className = "" }: { className?: string }) => (
  <div className={`inline-flex items-center justify-center ${className}`}>
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated-svg" style={{ shapeRendering: 'crispEdges' }}>
      {/* Main vertical/horizontal */}
      <rect x="7" y="2" width="2" height="12" fill="#DAA520" />
      <rect x="2" y="7" width="12" height="2" fill="#DAA520" />
      {/* Center block */}
      <rect x="5" y="5" width="6" height="6" fill="#FFD700" />
      {/* Corners */}
      <rect x="6" y="6" width="1" height="1" fill="#FFFACD" />
      <rect x="9" y="6" width="1" height="1" fill="#FFFACD" />
      {/* Outline/Shadow */}
      <rect x="6" y="12" width="4" height="1" fill="#B8860B" />
      <rect x="10" y="8" width="1" height="4" fill="#B8860B" />
    </svg>
  </div>
);
