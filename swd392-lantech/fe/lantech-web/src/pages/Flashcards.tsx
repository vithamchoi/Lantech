
const Flashcards = () => {
  return (
    <>
      

<div className="w-full flex flex-col lg:flex-row gap-gutter h-full min-h-[600px]">

<div className="flex-grow flex flex-col items-center justify-center bg-surface-container rounded border-4 border-on-surface-variant p-md shadow-[4px_4px_0px_0px_rgba(81,67,69,1)] relative">

<div className="absolute top-[-20px] bg-[#8B5A2B] text-[#FDF8E1] font-headline-md text-headline-md px-md py-xs border-4 border-[#4A3728] shadow-[4px_4px_0px_0px_rgba(74,55,40,1)] z-10">
<span className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#4A3728] rounded-full"></span>
<span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#4A3728] rounded-full"></span>
<span className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#4A3728] rounded-full"></span>
<span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#4A3728] rounded-full"></span>
                    Nature Vocab
                </div>

<div className="w-full max-w-[500px] aspect-[4/3] card-flip-container cursor-pointer mt-lg">
<div className="card-flip-inner">

<div className="card-front bg-[#FDF8E1] pixel-border flex flex-col items-center justify-center p-md shadow-[4px_4px_0px_0px_rgba(74,55,40,1)]">
<h2 className="font-display-lg text-display-lg text-[#28180b] mb-md">La Forêt</h2>
<button aria-label="Play audio" className="bg-[#8B5A2B] text-[#FDF8E1] p-xs border-2 border-[#4A3728] chunky-btn rounded-full hover:bg-[#6b421c] transition-colors">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>volume_up</span>
</button>
<p className="mt-auto font-label-sm text-label-sm text-on-surface-variant">Tap to flip</p>
</div>

<div className="card-back bg-[#FDF8E1] pixel-border flex flex-col items-center justify-center p-md shadow-[4px_4px_0px_0px_rgba(74,55,40,1)]">
<h2 className="font-display-lg text-display-lg text-secondary mb-md">The Forest</h2>
<div className="w-full h-32 bg-surface-variant border-2 border-outline-variant mt-sm mb-auto flex items-center justify-center text-on-surface-variant font-body-md italic">
                                Example: Nous nous promenons dans la forêt.
                            </div>
<p className="mt-auto font-label-sm text-label-sm text-on-surface-variant">Tap to flip back</p>
</div>
</div>
</div>

<div className="mt-xl flex gap-md justify-center w-full">
<button className="bg-error text-on-error font-headline-md text-headline-md px-lg py-sm chunky-btn border-2 border-[#4A3728] rounded shadow-[2px_2px_0px_0px_rgba(74,55,40,1)] hover:bg-[#93000a]">
                        Hard
                    </button>
<button className="bg-[#facc15] text-[#422006] font-headline-md text-headline-md px-lg py-sm chunky-btn border-2 border-[#4A3728] rounded shadow-[2px_2px_0px_0px_rgba(74,55,40,1)] hover:bg-[#eab308]">
                        Good
                    </button>
<button className="bg-secondary text-on-secondary font-headline-md text-headline-md px-lg py-sm chunky-btn border-2 border-[#4A3728] rounded shadow-[2px_2px_0px_0px_rgba(74,55,40,1)] hover:bg-on-secondary-container">
                        Easy
                    </button>
</div>
</div>

<div className="w-full lg:w-1/3 bg-[#8B5A2B] border-4 border-[#4A3728] p-xs shadow-[4px_4px_0px_0px_rgba(81,67,69,1)] flex flex-col">
<div className="bg-[#FDF8E1] border-2 border-[#4A3728] p-sm mb-xs text-center font-headline-md text-headline-md text-[#28180b]">
                    Saved Words
                </div>
<div className="bg-surface-container-low border-2 border-[#4A3728] flex-grow overflow-y-auto pixel-scrollbar p-sm flex flex-col gap-xs">

<div className="bg-surface p-xs border-2 border-outline-variant flex justify-between items-center hover:bg-surface-variant cursor-pointer transition-colors">
<span className="font-body-md font-bold text-on-surface">Le Chien</span>
<span className="material-symbols-outlined text-secondary" style={{"fontVariationSettings":"'FILL' 1"}}>check_circle</span>
</div>
<div className="bg-surface p-xs border-2 border-outline-variant flex justify-between items-center hover:bg-surface-variant cursor-pointer transition-colors">
<span className="font-body-md font-bold text-on-surface">La Pomme</span>
<span className="material-symbols-outlined text-secondary" style={{"fontVariationSettings":"'FILL' 1"}}>check_circle</span>
</div>
<div className="bg-surface p-xs border-2 border-outline-variant flex justify-between items-center hover:bg-surface-variant cursor-pointer transition-colors">
<span className="font-body-md font-bold text-on-surface">Le Chat</span>
<span className="material-symbols-outlined text-error" style={{"fontVariationSettings":"'FILL' 1"}}>error</span>
</div>
<div className="bg-surface p-xs border-2 border-outline-variant flex justify-between items-center hover:bg-surface-variant cursor-pointer transition-colors">
<span className="font-body-md font-bold text-on-surface">L'Oiseau</span>
<span className="material-symbols-outlined text-[#facc15]" style={{"fontVariationSettings":"'FILL' 1"}}>pending</span>
</div>

<div className="bg-surface p-xs border-2 border-outline-variant flex justify-between items-center hover:bg-surface-variant cursor-pointer transition-colors opacity-70">
<span className="font-body-md font-bold text-on-surface">Le Soleil</span>
</div>
<div className="bg-surface p-xs border-2 border-outline-variant flex justify-between items-center hover:bg-surface-variant cursor-pointer transition-colors opacity-70">
<span className="font-body-md font-bold text-on-surface">La Lune</span>
</div>
<div className="bg-surface p-xs border-2 border-outline-variant flex justify-between items-center hover:bg-surface-variant cursor-pointer transition-colors opacity-70">
<span className="font-body-md font-bold text-on-surface">L'Arbre</span>
</div>
</div>
</div>
</div>

    </>
  );
};

export default Flashcards;
