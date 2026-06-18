
const PlacementTestListeningEvergreen = () => {
  return (
    <div className="flex flex-col gap-xl items-center w-full max-w-4xl mx-auto py-xl px-md">
      <div className="w-full mb-lg">
        <div className="flex justify-between items-center mb-xs font-headline-md text-headline-md">
          <div className="flex items-center gap-xs text-primary">
            <span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>timer</span>
            <span className="">04:59</span>
          </div>
          <div className="text-tertiary">
            Question 3 of 10
          </div>
        </div>

        <div className="w-full h-6 bg-surface-variant pixel-border inner-highlight rounded-none overflow-hidden chunky-shadow">
          <div className="h-full bg-secondary progress-bar-stripes w-[30%] transition-all duration-500 ease-in-out border-r-4 border-on-surface-variant"></div>
        </div>
      </div>

      <div className="w-full bg-[#FDF8E1] pixel-border inner-highlight chunky-shadow p-md md:p-lg flex flex-col items-center relative z-10 gap-lg">
        
        <div className="bg-[#8B5A2B] text-[#FDF8E1] pixel-border p-xs px-md -mt-12 chunky-shadow relative">
          <div className="absolute top-1 left-1 w-2 h-2 bg-[#4A3728]"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-[#4A3728]"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-[#4A3728]"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-[#4A3728]"></div>
          <h1 className="font-headline-lg text-headline-lg text-center tracking-wide">Listening Skills</h1>
        </div>

        <p className="font-body-lg text-body-lg text-on-surface text-center font-bold">
            Listen to the audio and select the correct image.
        </p>

        <div className="bg-[#D2B48C] pixel-border inner-highlight p-md w-full max-w-md flex flex-col items-center gap-sm chunky-shadow">
          <div className="w-full bg-[#4A3728] h-2 mb-2 opacity-50"></div> 
          <button aria-label="Play Audio" className="bg-primary text-on-primary w-20 h-20 flex items-center justify-center pixel-border chunky-shadow chunky-shadow-hover chunky-shadow-active transition-transform">
            <span className="material-symbols-outlined text-[48px]" style={{"fontVariationSettings":"'FILL' 1"}}>play_arrow</span>
          </button>
          <div className="w-full flex items-center gap-xs mt-sm">
            <span className="material-symbols-outlined text-on-surface-variant">volume_down</span>
            <div className="flex-grow h-2 bg-surface-variant pixel-border">
              <div className="w-1/2 h-full bg-primary"></div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">volume_up</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-md w-full mt-lg">
          <label className="cursor-pointer group relative">
            <input className="peer sr-only" name="listening_option" type="radio" value="river" />
            <div className="bg-surface-container pixel-border inner-highlight chunky-shadow p-xs transition-all peer-checked:bg-secondary-container peer-checked:border-secondary peer-checked:translate-y-1 peer-checked:shadow-none hover:-translate-y-1 group-hover:chunky-shadow-hover h-full flex flex-col items-center">
              <img alt="River scene" className="w-full aspect-square object-cover pixel-border mb-xs" data-alt="A pixel-art style illustration of a peaceful, winding river flowing through a lush green meadow." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuZGdHOyWtaQcURnNWGN63zhFXSBXwS9vCgJ2hqJuagxJbr_3NnbDs_5zMlJLVWvxTymonKG5q57qiwDAIxWZch8WbShJul85fOkUnBeUIRapzaHGtMnxNE9-oYb252Xl45Cr_Y4hapZwD4jAmFXAZ7Adw05uRLWD5GqwH19_VsTZE0D5xDQwRw8TDvraBBoHLzlytjl8fLbCqCeiAkvuDfDq-WChkGD1bmMOJYDKdFkmi4YdTWOcDHHoUgXtCLQRwx6R7tKynPQ" />
              <span className="font-label-lg text-label-lg text-on-surface mt-auto">Option A</span>
            </div>
          </label>

          <label className="cursor-pointer group relative">
            <input className="peer sr-only" name="listening_option" type="radio" value="forest" />
            <div className="bg-surface-container pixel-border inner-highlight chunky-shadow p-xs transition-all peer-checked:bg-secondary-container peer-checked:border-secondary peer-checked:translate-y-1 peer-checked:shadow-none hover:-translate-y-1 group-hover:chunky-shadow-hover h-full flex flex-col items-center">
              <img alt="Forest scene" className="w-full aspect-square object-cover pixel-border mb-xs" data-alt="A dense, pixel-art style forest interior." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2xzQsgLXaY5lZQ5zvdBdKnyNzqmygdYlFKQ9LfEimGUn9LQlP7ggcq2rAQJsKSDfL35Q12vdpv-VPQVQJ56eofcr9ClJxc8Ot_qZ5w-s9p1KyDgpLqfKihXwgVVTV5mZnd-X4mRQKFcMZ8JMe9hLPnoppKUnjorQvi3GFI3j2sFRUNWK7q5rD635pXA-2fTavc6bYC3NuUMfB3IhZM3TDT688kakty_EEbzoj3oS68FeaJrjoyeFKgltFWB28l4EAgTpYeE73RA" />
              <span className="font-label-lg text-label-lg text-on-surface mt-auto">Option B</span>
            </div>
          </label>

          <label className="cursor-pointer group relative">
            <input className="peer sr-only" name="listening_option" type="radio" value="mountain" />
            <div className="bg-surface-container pixel-border inner-highlight chunky-shadow p-xs transition-all peer-checked:bg-secondary-container peer-checked:border-secondary peer-checked:translate-y-1 peer-checked:shadow-none hover:-translate-y-1 group-hover:chunky-shadow-hover h-full flex flex-col items-center">
              <img alt="Mountain scene" className="w-full aspect-square object-cover pixel-border mb-xs" data-alt="A towering, snow-capped mountain peak." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4ywJiMBXtfNokmEKYD-4dMFF0Yxs-iqDkdcf8ryfaopBxkdzz6X0RXd-82zBGqPEopQk8GSE6fbKeh36VlfYrbFzQLSrQA3B0f7BQQmUDR00N4qz5JMvEdjONa5fbvrl4Co5QciMx8TMwDmPiQKyHYjlQc0a881i8oVQ6vp9mORYNVCg-cCicmEb6uvpN7Umckp5gbRM4sCTHydoN10bfuhAIyFERLcIhSSQuSh64hMAv7FL8Gq_K0ile4trLK95RMIWJuOCQgA" />
              <span className="font-label-lg text-label-lg text-on-surface mt-auto">Option C</span>
            </div>
          </label>

          <label className="cursor-pointer group relative">
            <input className="peer sr-only" name="listening_option" type="radio" value="meadow" />
            <div className="bg-surface-container pixel-border inner-highlight chunky-shadow p-xs transition-all peer-checked:bg-secondary-container peer-checked:border-secondary peer-checked:translate-y-1 peer-checked:shadow-none hover:-translate-y-1 group-hover:chunky-shadow-hover h-full flex flex-col items-center">
              <img alt="Meadow scene" className="w-full aspect-square object-cover pixel-border mb-xs" data-alt="A bright, sun-drenched meadow filled with blooming wildflowers." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0NpgaDXFRBeO0bQEbS0qVtn9r9LQ5M4B8OVj1-pgqJpSONz_zYSUx94yQ6lC6AomdV_6ke0KF1uheTELPyvP1TzGY4BhvDmSRszWnGXT43kizo66W2RzHCFjtH8nzRPJlTBVjprHfm11TowrQ21drN1nY3iET0qlB3pAYdpuZLK_8jXXZdRUzmU-fu2HltLtieryGpvInYs9nfmc4pce_792KdB-52j96mr4PpIZWBXOxxrko3HAXcSJNEDvWGBX3JwGVQ3a4VQ" />
              <span className="font-label-lg text-label-lg text-on-surface mt-auto">Option D</span>
            </div>
          </label>
        </div>

        <div className="w-full mt-xl flex justify-end">
          <button className="bg-primary text-on-primary font-label-lg text-label-lg px-xl py-sm pixel-border chunky-shadow chunky-shadow-hover chunky-shadow-active transition-all flex items-center gap-xs">
            Submit Answer
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementTestListeningEvergreen;
