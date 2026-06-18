
const PlacementTest = () => {
  return (
    <>
      

<div className="w-full max-w-2xl mx-auto flex items-center gap-sm">
<span className="font-label-sm text-label-sm text-on-surface-variant">Question 12 of 50</span>
<div className="flex-grow h-4 bg-surface-container chunky-border relative overflow-hidden">
<div className="absolute top-0 left-0 h-full bg-secondary w-1/4 border-r-2 border-on-surface"></div>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">24%</span>
</div>

<div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-md relative">

<div className="hidden xl:block absolute -left-xl top-0 text-secondary opacity-50 select-none">
<span className="material-symbols-outlined text-[64px]" data-icon="local_florist">local_florist</span>
</div>

<div className="md:col-span-12 bg-surface chunky-border chunky-shadow p-md inner-highlight">
<div className="flex items-start gap-sm mb-sm">
<span className="material-symbols-outlined text-tertiary mt-1" data-icon="translate" data-weight="fill" style={{"fontVariationSettings":"'FILL' 1"}}>translate</span>
<div>
<h2 className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider mb-xs">Advanced Translation</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">Translate the following technical excerpt into standard English, maintaining the formal tone and addressing the specific nuances of the original text.</p>
</div>
</div>
</div>

<div className="md:col-span-12 bg-surface-container-highest chunky-border chunky-shadow p-md relative inner-highlight">

<div className="absolute top-2 left-2 w-2 h-2 bg-inverse-surface rounded-full"></div>
<div className="absolute top-2 right-2 w-2 h-2 bg-inverse-surface rounded-full"></div>
<div className="absolute bottom-2 left-2 w-2 h-2 bg-inverse-surface rounded-full"></div>
<div className="absolute bottom-2 right-2 w-2 h-2 bg-inverse-surface rounded-full"></div>
<h3 className="font-label-sm text-label-sm text-on-surface-variant mb-sm uppercase border-b-2 border-on-surface-variant pb-xs inline-block">Source Text (French)</h3>
<blockquote className="font-body-lg text-body-lg italic text-on-surface border-l-4 border-primary pl-md py-xs my-sm bg-surface-container p-sm">
                    "L'optimisation des algorithmes d'apprentissage profond nécessite une compréhension approfondie des hyperparamètres, sous peine d'engendrer un surajustement préjudiciable aux performances de généralisation du modèle en production."
                </blockquote>
</div>

<div className="md:col-span-12 bg-surface chunky-border chunky-shadow p-md inner-highlight">
<label className="font-label-sm text-label-sm text-on-surface-variant mb-sm block uppercase" htmlFor="translation-input">Your Translation</label>
<textarea className="w-full bg-surface-container border-t-4 border-l-4 border-b-2 border-r-2 border-on-surface p-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary resize-y placeholder:text-outline" id="translation-input" placeholder="Enter your translation here..." rows={6}></textarea>
<div className="flex justify-between items-center mt-sm">
<div className="flex gap-xs">
<button className="bg-surface-container-highest text-on-surface px-xs py-xs chunky-border chunky-shadow chunky-btn transition-transform flex items-center gap-xs" title="Insert Special Character">
<span className="material-symbols-outlined text-[16px]" data-icon="keyboard">keyboard</span>
</button>
<button className="bg-surface-container-highest text-on-surface px-xs py-xs chunky-border chunky-shadow chunky-btn transition-transform flex items-center gap-xs" title="Clear Text">
<span className="material-symbols-outlined text-[16px]" data-icon="clear_all">clear_all</span>
</button>
</div>
<span className="font-label-sm text-label-sm text-outline">0 / 500 words</span>
</div>
</div>
</div>

    </>
  );
};

export default PlacementTest;
