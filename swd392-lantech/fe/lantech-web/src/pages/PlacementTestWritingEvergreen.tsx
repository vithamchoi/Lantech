
const PlacementTestWritingEvergreen = () => {
  return (
    <div className="flex flex-col gap-xl items-center w-full max-w-4xl mx-auto py-xl px-md relative">
      <header className="w-full max-w-3xl mb-xl">
        <div className="flex items-center justify-between mb-sm">
          <div className="flex items-center gap-xs bg-surface-container border-[4px] border-on-surface p-xs rounded-DEFAULT shadow-[4px_4px_0px_0px_#514345]">
            <span className="material-symbols-outlined text-primary text-[24px]">timer</span>
            <span className="font-label-lg text-label-lg text-primary font-bold tracking-widest" id="timerDisplay">29:59</span>
          </div>

          <div className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low border-[2px] border-surface-variant px-sm py-xs rounded-full">
            Question 3 of 10
          </div>
        </div>

        <div className="w-full h-[12px] bg-surface-container-highest border-[2px] border-on-surface rounded-full overflow-hidden relative">
          <div className="h-full bg-secondary w-[30%] relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-secondary-fixed opacity-50"></div>
          </div>
        </div>
      </header>

      <section className="w-full max-w-3xl bg-[#FDF8E1] border-[4px] border-[#4A3728] shadow-[8px_8px_0px_0px_#4A3728] relative p-1">
        <div className="border-[2px] border-[#fbddc7] h-full p-md md:p-lg flex flex-col gap-lg bg-surface relative">
          
          <div className="pixel-screw absolute top-sm left-sm bg-[#4A3728] w-2 h-2 rounded-full"></div>
          <div className="pixel-screw absolute top-sm right-sm bg-[#4A3728] w-2 h-2 rounded-full"></div>
          <div className="pixel-screw absolute bottom-sm left-sm bg-[#4A3728] w-2 h-2 rounded-full"></div>
          <div className="pixel-screw absolute bottom-sm right-sm bg-[#4A3728] w-2 h-2 rounded-full"></div>

          <div className="self-start bg-tertiary-container text-on-tertiary-container border-[2px] border-on-tertiary-container px-sm py-xs rounded-full font-label-sm text-label-sm flex items-center gap-xs shadow-[2px_2px_0px_0px_#425860]">
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            Writing Prompt
          </div>

          <h1 className="font-headline-md text-headline-md text-on-surface max-w-2xl">
            Describe your favorite season in the woods. Focus on sensory details like sight, sound, and smell.
          </h1>

          <div className="relative w-full flex-grow mt-sm">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-surface-container-high border-[2px] border-on-surface rounded-full shadow-[2px_2px_0px_0px_#514345] z-10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px] text-primary" data-weight="fill">push_pin</span>
            </div>

            <div className="bg-surface-container-low border-[4px] border-t-[#4A3728] border-l-[#4A3728] border-b-[#837375] border-r-[#837375] p-xs relative">
              <textarea className="w-full h-[240px] md:h-[300px] bg-transparent border-none focus:ring-0 resize-none font-body-lg text-body-lg text-on-surface placeholder-outline-variant p-sm outline-none" id="answerInput" placeholder="Begin writing here..." spellCheck="false" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.1) 31px, rgba(0,0,0,0.1) 32px)', lineHeight: '32px' }}></textarea>

              <div className="absolute bottom-sm right-sm bg-surface-container border-[2px] border-outline-variant px-xs py-1 rounded-DEFAULT font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                <span id="wordCount">0</span> <span className="opacity-70">/ 200 words min</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center mt-md pt-md border-t-[4px] border-dashed border-surface-variant">
            <button className="btn-chunky bg-primary text-on-primary font-label-lg text-label-lg px-lg py-sm border-[2px] border-on-surface border-b-[6px] border-b-[#360c19] flex items-center gap-sm group">
              Submit Answer
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlacementTestWritingEvergreen;
