
const Leaderboard = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl w-full">
      <div className="col-span-1 lg:col-span-12 mb-xs text-center relative z-10">
        <div className="inline-block px-xl py-sm pixel-corners transform -rotate-2 relative" style={{ backgroundColor: '#8B5A2B', border: '4px solid #4A3728', boxShadow: 'inset 0 0 0 2px #A0522D' }}>
          <div className="inner"></div>
          <h1 className="font-display-lg text-display-lg text-surface-container-lowest drop-shadow-[2px_2px_0px_rgba(40,24,11,1)] relative z-10">
            Weekly Harvest
          </h1>
        </div>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-sm">Top gatherers of knowledge this week.</p>
      </div>

      {/* Left Column: Podium */}
      <div className="col-span-1 lg:col-span-5 flex flex-col justify-end items-center relative mt-xl lg:mt-0 pt-xl">
        {/* Decorative Vine */}
        <div className="absolute top-0 left-10 w-16 h-32 bg-secondary opacity-20 pointer-events-none" style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 80%)" }}></div>
        
        <div className="flex items-end justify-center gap-unit h-[400px] w-full">
          {/* 2nd Place */}
          <div className="flex flex-col items-center w-1/3 relative group">
            <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border-2 border-on-surface-variant px-2 py-1 text-xs font-label-sm whitespace-nowrap z-20">1,850 XP</div>
            <div className="relative mb-2 w-16 h-16 chunky-border bg-surface-container overflow-hidden rounded-sm transition-transform group-hover:-translate-y-2 duration-200">
              <img alt="2nd Place User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_XeYHjZ7QZflOlU5w3otEOnnGjC5RfQIoY-dB9uVNaM3zVngGExA3K7ORQcljK75SzHwBa3jItjTSvmFhCAr-dofvn27tYZnYMXv8KHJ_ToQN8j2hif9SdLkTojbTlffIkOrsSi0FC65MxmKyQevvIaGbJW5YC30V199A5d4W50rngHWmVy6fOt8wi9nAksSbUxE4D8OHk5qkuHDpML4E9u709ObzWE4zOOVxI4xSpH5wLEcp54buPhQMT5gxXoNSh7cDpxNxCQ" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-surface-container-lowest border-2 border-on-surface-variant rounded-full flex items-center justify-center font-label-sm text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              </div>
            </div>
            <span className="font-label-lg text-label-lg text-on-background mb-unit truncate w-full text-center px-1">SarahP</span>
            <div className="w-full h-[120px] relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#8B5A2B', border: '4px solid #4A3728', borderBottom: 'none' }}>
              <div className="absolute inset-0 bg-black opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)" }}></div>
              <span className="font-display-lg text-display-lg text-surface-container-lowest opacity-50 z-10 font-bold">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center w-1/3 relative group z-10">
            <div className="absolute -top-24 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border-2 border-on-surface-variant px-2 py-1 text-xs font-label-sm whitespace-nowrap z-20">2,400 XP</div>
            <div className="absolute -top-6 text-secondary animate-bounce">
              <span className="material-symbols-outlined text-4xl drop-shadow-[2px_2px_0px_rgba(40,24,11,1)]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <div className="relative mb-2 w-20 h-20 chunky-border bg-surface-container overflow-hidden rounded-sm transition-transform group-hover:-translate-y-2 duration-200">
              <img alt="1st Place User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdbMerdsUCgSMJs8oJx-WeEMw9Q4zjqMwiZJKMK91i9f2Pyx980-ElYsKUdkBbBo_Vucs5JXoDsUHUEhBfVgp-Rxp1QkHx58DyEK82KQvimntEzl6S5U2s9xDs2SzJatt0RNtTz6e5mhAmD08khyMVdotRZc-_w2MPuhPxPRbRwDZoQPPkZjvlwoUYG6AOzBG8LWyigXGAB09qHujNBD0pwY3jZq1BNFH0GVUv7-Nwc7oRJwW0DVn_LOlkFYl_fCewRhsXFsBDPw" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-surface-container-lowest border-2 border-on-surface-variant rounded-full flex items-center justify-center font-label-sm text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-[#FFD700]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              </div>
            </div>
            <span className="font-label-lg text-label-lg text-on-background mb-unit truncate w-full text-center px-1">AlexM</span>
            <div className="w-full h-[180px] relative overflow-hidden flex items-start pt-sm justify-center" style={{ backgroundColor: '#8B5A2B', border: '4px solid #4A3728', borderBottom: 'none' }}>
              <div className="absolute inset-0 bg-black opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)" }}></div>
              <span className="font-display-lg text-display-lg text-surface-container-lowest opacity-50 z-10 font-bold">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center w-1/3 relative group">
            <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border-2 border-on-surface-variant px-2 py-1 text-xs font-label-sm whitespace-nowrap z-20">1,620 XP</div>
            <div className="relative mb-2 w-16 h-16 chunky-border bg-surface-container overflow-hidden rounded-sm transition-transform group-hover:-translate-y-2 duration-200">
              <img alt="3rd Place User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6_kLzlqmCj8aeEbNf9ebWApt_9dztL6jodVkp50Qcd78sEekmtftotwVb9lvs2ayBkFYMrBfAhuylky6lc7TasuEMwQCuLiL60wPtJ93dzxYxI05PZlbciqJq4MWPFIto65N_p7nfc2KHy29juXM9NGwQhdOmYwQH4nyg2jNA4MZRERVB0qZgJKoXQkRwz2j9SH8CsqJrTxot3cdE9XRras44LEFBQB-qNFdcSv581rrQ-zuJ89F8L4vmiJju2xSLyaottyl1LQ" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-surface-container-lowest border-2 border-on-surface-variant rounded-full flex items-center justify-center font-label-sm text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-[#CD7F32]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              </div>
            </div>
            <span className="font-label-lg text-label-lg text-on-background mb-unit truncate w-full text-center px-1">ElenaR</span>
            <div className="w-full h-[90px] relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#8B5A2B', border: '4px solid #4A3728', borderBottom: 'none' }}>
              <div className="absolute inset-0 bg-black opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)" }}></div>
              <span className="font-display-lg text-display-lg text-surface-container-lowest opacity-50 z-10 font-bold">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Ranking List */}
      <div className="col-span-1 lg:col-span-7 flex flex-col gap-sm">
        <div className="cream-card p-md w-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-5 rounded-bl-full pointer-events-none"></div>
          <div className="flex justify-between items-center mb-md border-b-2 border-outline-variant pb-xs">
            <span className="font-headline-md text-headline-md text-on-surface">Rankings</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              Resets in 2d 14h
            </span>
          </div>

          <div className="flex flex-col gap-unit">
            {/* Current User Row */}
            <div className="flex items-center p-xs bg-[#FFFACD] border-2 border-[#DAA520] rounded-sm transform translate-x-2 shadow-[-4px_4px_0px_0px_rgba(218,165,32,0.3)]">
              <div className="w-8 text-center font-headline-md text-headline-md text-[#B8860B]">42</div>
              <div className="w-10 h-10 border-2 border-[#DAA520] rounded-sm overflow-hidden mx-sm">
                <img alt="Current User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-aANP_mfyTUEIk03oLIOGWnzesN09wXGtBGfxCNDMceqoLPNG89r0a01fnFwO4nTen3RrlYIYd4jmfaulJIYqTz1CMHCQX6QRsTZ6jUoopk1ebKXHZ25rSElVg5F5RquR7yhO_n0Xsd7afBgzCzfapHw0k8zenB4ob8-pdhIUcGyrZZh6CThi07-Y6axYNoPaIIaT1wSr93rZmVjeTtCtOnyR_Qf4NNCRgCThoDVDCsOgDwxEO-SjdK0j1LzlwvBWdM8dDwQzbA" />
              </div>
              <div className="flex-grow">
                <div className="font-label-lg text-label-lg text-on-surface flex items-center gap-1">
                  You
                  <span className="bg-[#DAA520] text-white text-[10px] px-1 rounded-sm uppercase tracking-wider">Me</span>
                </div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Novice</div>
              </div>
              <div className="font-headline-md text-headline-md text-[#B8860B] text-right w-24">840</div>
            </div>
            
            {/* Mock Rows */}
            <div className="flex items-center p-xs bg-surface-container-lowest border-2 border-on-surface-variant rounded-sm hover:bg-surface-container transition-colors mt-unit">
              <div className="w-8 text-center font-headline-md text-headline-md text-on-surface-variant">43</div>
              <div className="w-10 h-10 border-2 border-on-surface-variant rounded-sm overflow-hidden mx-sm bg-surface-variant flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div className="flex-grow">
                <div className="font-label-lg text-label-lg text-on-surface">Guest_109</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Novice</div>
              </div>
              <div className="font-headline-md text-headline-md text-primary text-right w-24">810</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
