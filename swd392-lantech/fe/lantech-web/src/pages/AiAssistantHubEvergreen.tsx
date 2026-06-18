
const AiAssistantHubEvergreen = () => {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-xl items-start py-xl px-md">
      <div className="w-full md:w-1/3 flex flex-col items-center gap-md md:sticky md:top-24">
        <div className="w-48 h-48 chunky-card rounded-full overflow-hidden bg-surface-container flex items-center justify-center p-4">
          <img alt="Owl Mascot" className="w-full h-full object-cover rounded-full" data-alt="A charming, stylized illustration of a wise owl perched on a sturdy wooden branch." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUFuImg02CfrRsLywBRvjHfa-tyu-wByq4W9mCl4nRbVjlwXMmjy7iBvybMuHoLTPYK9hENg33K63TP_NtbUmwPUK3R0M0Y-JJ2TPij6UfahuNQNMT0u-ul7ixGdwvDriv3kiC1gsh8zRJ0epVTzX_l2N1RP9BNKMGghLYWLeWlk3ePbDtklDJPiJaIE7-4UCthsZ-LfJB9PedVno3cBbaGRpfK7iKgk9EhrN5gtjzFEnOLNB3q9ilTVGhV6MpNQdibQF-dsneKA"/>
        </div>
        <div className="chunky-card bg-surface-container p-sm text-center w-full">
          <h2 className="font-headline-md text-headline-md text-primary mb-xs">Professor Hoot</h2>
          <p className="font-body-md text-on-surface-variant">Your magical language guide. Ask me anything about Lantech!</p>
        </div>
        <div className="w-full flex flex-col gap-sm">
          <button className="chunky-btn bg-secondary-container text-on-secondary-container px-md py-sm font-label-lg text-label-lg flex items-center justify-center gap-xs">
            <span className="material-symbols-outlined">menu_book</span>
            Ask Grammar Rule
          </button>
          <button className="chunky-btn bg-primary-container text-on-primary-container px-md py-sm font-label-lg text-label-lg flex items-center justify-center gap-xs">
            <span className="material-symbols-outlined">edit_note</span>
            Check my Writing
          </button>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex flex-col h-[70vh] min-h-[500px]">
        <div className="flex-grow chunky-card bg-[#FDF8E1] p-md overflow-y-auto mb-md relative border-4 border-[#4A3728] shadow-[4px_4px_0px_0px_#4A3728]">
          <div className="absolute inset-0 border-2 border-[#D2B48C] pointer-events-none m-1"></div>
          <div className="scroll-effect min-h-full pb-xl flex flex-col gap-md z-10 relative px-sm py-xs">
            <div className="self-start max-w-[80%]">
              <div className="font-label-sm text-on-surface-variant mb-1 ml-2">Professor Hoot</div>
              <div className="bg-surface-container-highest border-2 border-on-surface p-sm rounded-lg rounded-tl-none font-body-lg text-on-surface">
                Hoo there! Ready to practice some verbs today, or do you have a specific question about sentence structure?
              </div>
            </div>

            <div className="self-end max-w-[80%]">
              <div className="font-label-sm text-on-surface-variant mb-1 mr-2 text-right">You</div>
              <div className="bg-tertiary-fixed border-2 border-on-surface p-sm rounded-lg rounded-tr-none font-body-lg text-on-surface">
                I'm having trouble with past tense conjugations.
              </div>
            </div>

            <div className="self-start max-w-[80%]">
              <div className="font-label-sm text-on-surface-variant mb-1 ml-2">Professor Hoot</div>
              <div className="bg-surface-container-highest border-2 border-on-surface p-sm rounded-lg rounded-tl-none font-body-lg text-on-surface">
                Ah, the past tense! It can be tricky. Let's start with regular verbs. Remember the simple rule of adding "-ed". Shall we try a few examples together?
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-4 left-4 w-8 h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRBMzcyOCI+PHBhdGggZD0iTTEyIDJMMTQuNCA5LjZMMjIgMTJMMTQuNCAxNC40TDEyIDIyTDkuNiAxNC40TDIgMTJMOS42IDkuNkwxMiBaIi8+PC9zdmc+')] bg-contain bg-no-repeat pointer-events-none"></div>
          <div className="chunky-card bg-surface-container p-sm flex items-center gap-sm">
            <input className="flex-grow bg-surface border-t-4 border-l-4 border-b-2 border-r-2 border-on-surface border-b-[#d6c2c4] border-r-[#d6c2c4] p-sm font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Write your message on the scroll..." type="text"/>
            <button className="chunky-btn bg-primary text-on-primary p-sm flex items-center justify-center">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantHubEvergreen;
