
const PlacementTestSpeakingEvergreen = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto min-h-[60vh] py-xl px-md gap-20">
      <div className="bg-primary-container chunky-border px-lg py-sm transform -rotate-2 relative z-10 w-fit">
        <h1 className="font-headline-md text-headline-md text-on-primary-container text-center">Read the sentence aloud.</h1>
        <div className="absolute -top-4 -right-4 text-4xl transform rotate-12">✨</div>
      </div>

      <div className="w-full max-w-2xl bg-[#FDF8E1] chunky-border relative p-lg shadow-[8px_8px_0px_0px_rgba(40,24,11,0.1)] transform rotate-1 transition-transform hover:rotate-0 duration-300">
        <div className="absolute top-2 left-2 w-3 h-3 bg-[#4A3728] rounded-full shadow-inner"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-[#4A3728] rounded-full shadow-inner"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#4A3728] rounded-full shadow-inner"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#4A3728] rounded-full shadow-inner"></div>
        <div className="border-[4px] border-[#4A3728] p-md bg-[#FDF8E1] bg-opacity-90 min-h-[200px] flex items-center justify-center text-center">
          <p className="font-display-lg text-display-lg text-on-surface leading-tight">
              "The sunlight filters through the ancient oak trees."
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center relative z-10">
        <div className="bg-[#8B5A2B] chunky-border w-32 h-16 mb-[-32px] relative z-0 flex items-end justify-center pb-2">
          <div className="w-24 h-4 bg-[#808080] border-2 border-[#4A3728]"></div>
        </div>

        <button className="relative z-10 w-24 h-24 bg-error-container chunky-border rounded-full flex items-center justify-center hover:bg-[#ffb4ab] active:translate-y-2 active:border-b-[4px] transition-all group focus:outline-none focus:ring-4 focus:ring-error focus:ring-offset-4 focus:ring-offset-[#FDF8E1]">
          <span className="material-symbols-outlined text-[48px] text-on-error-container group-hover:scale-110 transition-transform" style={{"fontVariationSettings":"'FILL' 1"}}>mic</span>
        </button>

        <div className="mt-lg bg-surface-variant border-2 border-[#4A3728] px-md py-xs shadow-[2px_2px_0px_0px_#4A3728]">
          <p className="font-label-lg text-label-lg text-on-surface uppercase tracking-widest">Click to Record</p>
        </div>
      </div>
    </div>
  );
};

export default PlacementTestSpeakingEvergreen;
