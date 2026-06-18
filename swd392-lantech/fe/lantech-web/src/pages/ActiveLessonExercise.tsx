
const ActiveLessonExercise = () => {
  return (
    <>
      

<div className="w-full text-left mb-xs">
<h1 className="font-headline-md text-headline-md text-on-surface">Translate this sentence</h1>
</div>

<div className="w-full bg-surface-container-lowest pixel-border p-lg relative pixel-shadow mb-xl">
<div className="inner-highlight"></div>
<div className="flex items-start gap-md">

<div className="w-16 h-16 shrink-0 bg-primary-container pixel-border flex items-center justify-center relative">
<div className="absolute inset-0 border-2 border-white opacity-50 m-1 pointer-events-none"></div>
<span className="material-symbols-outlined text-[32px] text-on-primary-container">cruelty_free</span>
</div>

<div className="bg-surface-container p-md pixel-border relative">

<div className="absolute -left-3 top-4 w-4 h-4 bg-surface-container border-l-4 border-b-4 border-on-surface transform rotate-45"></div>
<p className="font-body-lg text-body-lg text-on-surface relative z-10">The old cabin in the woods smells like pine and rain.</p>
</div>
</div>
</div>

<div className="w-full grid grid-cols-1 md:grid-cols-2 gap-md" id="options-grid">

<button className="option-btn relative bg-surface border-[4px] border-tertiary-container p-md text-left shadow-[4px_4px_0px_0px_#b6ced7] hover:-translate-y-1 hover:shadow-[4px_8px_0px_0px_#b6ced7] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#b6ced7] transition-all flex items-center gap-sm group">
<div className="w-8 h-8 flex items-center justify-center bg-surface-container border-2 border-on-surface-variant font-label-lg text-label-lg text-on-surface-variant group-focus:bg-tertiary-container group-focus:text-on-tertiary-container group-focus:border-on-surface transition-colors">1</div>
<span className="font-body-lg text-body-lg text-on-surface">La vieja cabaña en el bosque huele a pino y lluvia.</span>
</button>

<button className="option-btn relative bg-surface border-[4px] border-primary-container p-md text-left shadow-[4px_4px_0px_0px_#ffb7c5] hover:-translate-y-1 hover:shadow-[4px_8px_0px_0px_#ffb7c5] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#ffb7c5] transition-all flex items-center gap-sm group">
<div className="w-8 h-8 flex items-center justify-center bg-surface-container border-2 border-on-surface-variant font-label-lg text-label-lg text-on-surface-variant group-focus:bg-primary-container group-focus:text-on-primary-container group-focus:border-on-surface transition-colors">2</div>
<span className="font-body-lg text-body-lg text-on-surface">El bosque viejo huele a lluvia y pino.</span>
</button>

<button className="option-btn relative bg-surface border-[4px] border-surface-variant p-md text-left shadow-[4px_4px_0px_0px_#fbddc7] hover:-translate-y-1 hover:shadow-[4px_8px_0px_0px_#fbddc7] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#fbddc7] transition-all flex items-center gap-sm group">
<div className="w-8 h-8 flex items-center justify-center bg-surface-container border-2 border-on-surface-variant font-label-lg text-label-lg text-on-surface-variant group-focus:bg-surface-variant group-focus:text-on-surface transition-colors">3</div>
<span className="font-body-lg text-body-lg text-on-surface">La cabaña en la lluvia huele a madera.</span>
</button>

<button className="option-btn relative bg-surface border-[4px] border-tertiary-fixed-dim p-md text-left shadow-[4px_4px_0px_0px_#b2cad3] hover:-translate-y-1 hover:shadow-[4px_8px_0px_0px_#b2cad3] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#b2cad3] transition-all flex items-center gap-sm group">
<div className="w-8 h-8 flex items-center justify-center bg-surface-container border-2 border-on-surface-variant font-label-lg text-label-lg text-on-surface-variant group-focus:bg-tertiary-fixed-dim group-focus:text-on-tertiary-fixed transition-colors">4</div>
<span className="font-body-lg text-body-lg text-on-surface">El pino huele a la vieja cabaña de madera.</span>
</button>
</div>

    </>
  );
};

export default ActiveLessonExercise;
