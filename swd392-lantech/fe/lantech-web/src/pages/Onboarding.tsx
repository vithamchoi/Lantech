
const Onboarding = () => {
  return (
    <>
      <header className="w-full mb-md flex items-center justify-between px-sm py-xs bg-surface-container border-4 border-on-background rounded-xl shadow-[4px_4px_0px_0px_rgba(40,24,11,1)] relative z-20"><div className="flex items-center gap-md"><h1 className="font-display-lg text-headline-lg text-primary">Lantech</h1><nav className="hidden md:flex items-center gap-sm"><a href="#" className="flex items-center gap-xs font-label-lg text-on-surface hover:text-primary"><span className="material-symbols-outlined">map</span>Path</a><a href="#" className="flex items-center gap-xs font-label-lg text-on-surface hover:text-primary"><span className="material-symbols-outlined">leaderboard</span>Leaderboard</a><a href="#" className="flex items-center gap-xs font-label-lg text-on-surface hover:text-primary"><span className="material-symbols-outlined">style</span>Flashcards</a></nav></div><div className="flex items-center gap-sm"><div className="flex items-center gap-xs bg-surface px-xs py-1 rounded-full border-2 border-on-background"><span className="material-symbols-outlined text-primary">local_fire_department</span><span className="font-label-sm">7</span></div><button className="material-symbols-outlined text-on-surface hover:text-primary">light_mode</button><div className="w-8 h-8 rounded-full border-2 border-on-background overflow-hidden bg-primary-container"><span className="material-symbols-outlined flex items-center justify-center h-full">person</span></div></div></header>
<div className="wood-panel p-xl rounded-xl shadow-[8px_8px_0px_0px_rgba(40,24,11,1)] max-w-2xl mx-auto relative">

<div className="pixel-corners absolute inset-0 pointer-events-none"></div>
<div className="pixel-corners-bottom absolute inset-0 pointer-events-none"></div>

<div className="text-center mb-lg">
<h1 className="font-display-lg text-display-lg text-primary mb-xs">Lantech</h1>
<p className="font-body-md text-body-md text-on-surface-variant">Let's plant the seeds of your learning journey.</p>
</div>

<div className="mb-xl">
<div className="flex justify-between font-label-sm text-label-sm mb-xs px-xs">
<span className="text-primary font-bold" id="step-indicator">Step 1 of 3</span>
<span className="text-on-surface-variant">Setup</span>
</div>
<div className="progress-bar-container">
<div className="progress-bar-fill w-1/3" id="progress-fill"></div>
</div>
</div>

<div className="step-content active" id="step-1">
<h2 className="font-headline-lg text-headline-lg mb-md text-center">What is your native language?</h2>
<div className="grid grid-cols-2 md:grid-cols-4 gap-sm">

<button className="lang-btn chunky-btn bg-surface hover:bg-surface-container-high p-sm flex flex-col items-center justify-center gap-xs rounded-lg" data-lang="en">
<div className="w-16 h-12 bg-outline-variant border-2 border-on-background flex items-center justify-center relative overflow-hidden">

<img alt="Pixel art style flag representing English. The image should feature a stylized, chunky 16-bit representation of a flag, using a warm, retro color palette consistent with a cozy cottagecore aesthetic. The lighting should be flat to mimic old game sprites." className="w-full h-full object-cover pixelated" data-alt="Pixel art style flag representing English. The image should feature a stylized, chunky 16-bit representation of a flag, using a warm, retro color palette consistent with a cozy cottagecore aesthetic. The lighting should be flat to mimic old game sprites." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFkV_tNbajOJkgCTOuY2wKs5Nm6bQoQWkw7PqM4dS60TZB0Dg46Gup1NhvWoX9gKuUaPh8nCM9dq_1E3qy_s_hJ2Y2-lKFbbCOxYaUM0o-QnBtIYMr_pxWyFAp0vqic-bgrMUvuUsURmouAKLyIRPunL4AHqhLkrjbBwg-UIaRchDHJmL0FVsCTuLWYhBzTDRyi3aDrQ1HRCZLLxUtZldAjkw5BhOSBVxpf5SZQn2O6mgLi-BHmandpRg4AM6WtI1uEB45nQt79w" />
</div>
<span className="font-label-lg text-label-lg">English</span>
</button>

<button className="lang-btn chunky-btn bg-surface hover:bg-surface-container-high p-sm flex flex-col items-center justify-center gap-xs rounded-lg" data-lang="es">
<div className="w-16 h-12 bg-outline-variant border-2 border-on-background flex items-center justify-center relative overflow-hidden">
<img alt="Pixel art style flag representing Spanish. The image should feature a stylized, chunky 16-bit representation of a flag, using a warm, retro color palette consistent with a cozy cottagecore aesthetic. The lighting should be flat to mimic old game sprites." className="w-full h-full object-cover pixelated" data-alt="Pixel art style flag representing Spanish. The image should feature a stylized, chunky 16-bit representation of a flag, using a warm, retro color palette consistent with a cozy cottagecore aesthetic. The lighting should be flat to mimic old game sprites." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY2pNHYtIdxy3oao6PEEA6Nk1JHq-7m4DCjBOl_kjgtMNz-VH5y7lFO4JGnu4c6y14iRtZOBgkG1cFPsWzNL2Ri8CL1HHq1kmV5DDL1M-SYBcPrJdeCCsv7paITmcZk8XSmjfExxFu4Ft592-RIcvOTXnFLNAE9j3kZOFxn1CkwyNYccUPWPcOM63jh7-EUpfSJRBS8RglqFK24LQz47ru6F0QFW3GcOkBWG5AjynVhQah_dRmXXrb8OPrX_OO6wrIPb99EtGJ1g" />
</div>
<span className="font-label-lg text-label-lg">Español</span>
</button>

<button className="lang-btn chunky-btn bg-surface hover:bg-surface-container-high p-sm flex flex-col items-center justify-center gap-xs rounded-lg" data-lang="fr">
<div className="w-16 h-12 bg-outline-variant border-2 border-on-background flex items-center justify-center relative overflow-hidden">
<img alt="Pixel art style flag representing French. The image should feature a stylized, chunky 16-bit representation of a flag, using a warm, retro color palette consistent with a cozy cottagecore aesthetic. The lighting should be flat to mimic old game sprites." className="w-full h-full object-cover pixelated" data-alt="Pixel art style flag representing French. The image should feature a stylized, chunky 16-bit representation of a flag, using a warm, retro color palette consistent with a cozy cottagecore aesthetic. The lighting should be flat to mimic old game sprites." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcErbqtOsbzfB6bIXLTjZ5bp2KBqSoRWsnMr2N7oa4o9qnx-mg9uavlw9HJoYVh_ujHYhPj8rEtudc5a71E2_uh8IJ0_bjwVkR9wk87rQ8tpedVTp7PT0yKuyeU0COlDF4gFpA7ks5kBd5FyP84QsWqMMhnb4bpRL8yBsjP0O0cJLq5AP138slkUfG6dBYeAqOA6Yvx-Gy7Ikc8tLM9vcXCryavoRiyBVnnpD138KIwcj_ex8435fAlRD4tDFyd7mvITyedbcfhw" />
</div>
<span className="font-label-lg text-label-lg">Français</span>
</button>

<button className="lang-btn chunky-btn bg-surface hover:bg-surface-container-high p-sm flex flex-col items-center justify-center gap-xs rounded-lg" data-lang="de">
<div className="w-16 h-12 bg-outline-variant border-2 border-on-background flex items-center justify-center relative overflow-hidden">
<img alt="Pixel art style flag representing German. The image should feature a stylized, chunky 16-bit representation of a flag, using a warm, retro color palette consistent with a cozy cottagecore aesthetic. The lighting should be flat to mimic old game sprites." className="w-full h-full object-cover pixelated" data-alt="Pixel art style flag representing German. The image should feature a stylized, chunky 16-bit representation of a flag, using a warm, retro color palette consistent with a cozy cottagecore aesthetic. The lighting should be flat to mimic old game sprites." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKjIvk_qflidmX5Xu-qyeVKkgPbmEWHJYSPHnA7A4M-A85DLCn1xLnO8p9_bzWnFmENR50IffGAv2roOQOoGJ9HoHkZkjQI8VlsIrZ0JVa3B3x5z4Vublyla5b-Nk0-cwM00dR_BG-7cGGl1UEf5ofMuvJv01BlA2efQtyn43HOXNDqIphGND3sHfbTsPxtq7_Y5D5col1KkKGo2j7oHy3gMnhDonn--gWJzteymN3_Ts446jsPWP1s3EnHUemurks-TtSwvU15g" />
</div>
<span className="font-label-lg text-label-lg">Deutsch</span>
</button>
</div>
</div>

<div className="step-content" id="step-2">
<h2 className="font-headline-lg text-headline-lg mb-md text-center">What is your daily goal?</h2>
<div className="flex flex-col gap-sm">

<button className="goal-btn chunky-btn bg-surface hover:bg-surface-container-high p-md flex items-center gap-md rounded-lg text-left" data-goal="casual">
<span className="material-symbols-outlined text-secondary text-[32px]">directions_walk</span>
<div>
<div className="font-label-lg text-label-lg text-on-surface">Casual Walker</div>
<div className="font-body-md text-body-md text-on-surface-variant">5 mins / day. Easy going.</div>
</div>
</button>

<button className="goal-btn chunky-btn bg-surface hover:bg-surface-container-high p-md flex items-center gap-md rounded-lg text-left" data-goal="steady">
<span className="material-symbols-outlined text-primary text-[32px]">hiking</span>
<div>
<div className="font-label-lg text-label-lg text-on-surface">Steady Hiker</div>
<div className="font-body-md text-body-md text-on-surface-variant">15 mins / day. Consistent pace.</div>
</div>
</button>

<button className="goal-btn chunky-btn bg-surface hover:bg-surface-container-high p-md flex items-center gap-md rounded-lg text-left" data-goal="forest">
<span className="material-symbols-outlined text-on-secondary-container text-[32px]">forest</span>
<div>
<div className="font-label-lg text-label-lg text-on-surface">Forest Explorer</div>
<div className="font-body-md text-body-md text-on-surface-variant">30+ mins / day. Deep dive.</div>
</div>
</button>
</div>
</div>

<div className="step-content" id="step-3">
<div className="text-center mb-lg">
<img alt="A cute, pixel-art style mascot of a small woodland creature, perhaps an owl or a squirrel, holding a tiny wooden book. The mascot should have a warm, friendly expression, set against a transparent or warm cream background, fitting the nostalgic cottagecore theme." className="mx-auto w-32 h-32 mb-md pixelated rounded-full border-4 border-on-background object-cover" data-alt="A cute, pixel-art style mascot of a small woodland creature, perhaps an owl or a squirrel, holding a tiny wooden book. The mascot should have a warm, friendly expression, set against a transparent or warm cream background, fitting the nostalgic cottagecore theme." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtIflXkKWPLR6DEHtXt3GZZVMMtaOGJixfNIMwG4m1rT5k57ZHnnSKPAi-uiocVOovEKkqnvLxF05uGb3-z8fuGYdEMCXYrW-lqsuUUKE5VfP56Ei-TPXO6_2SYlG4lKqwjK_8gB0ZT8K_7nKFe3FQabgDeN1xzhFIVd9jWsKe2-xunQUuSzIbKf9Nq-OwIawm6OlR86yPHqeP0Xm9mE5xX3D4dKHlb0sNJ7ZyvhyhBMAy7-DEWt6lJ8sA59twNmdaUhKe9MO5bQ" />
<h2 className="font-headline-lg text-headline-lg mb-xs">Ready to grow?</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">Choose your starting path.</p>
</div>
<div className="flex flex-col gap-md">
<button className="chunky-btn bg-primary-container text-on-primary-container font-label-lg text-label-lg p-md rounded-lg flex items-center justify-center gap-xs hover:bg-primary-fixed">
<span className="material-symbols-outlined">psychiatry</span>
                        Start from Seed (Level 1)
                    </button>
<button className="chunky-btn bg-secondary-container text-on-secondary-container font-label-lg text-label-lg p-md rounded-lg flex items-center justify-center gap-xs hover:bg-secondary-fixed">
<span className="material-symbols-outlined">quiz</span>
                        Take a Placement Test
                    </button>
</div>
</div>

<div className="mt-xl flex justify-between items-center border-t-4 border-outline-variant pt-md">
<button className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary hidden" id="btn-back">
<span className="material-symbols-outlined align-middle mr-xs">arrow_back</span>Back
                </button>

<div className="w-24" id="nav-spacer"></div>
<button className="chunky-btn bg-surface-container-highest text-on-surface font-label-lg text-label-lg px-lg py-xs rounded-lg hover:bg-surface-dim opacity-50 cursor-not-allowed" disabled={true} id="btn-next">
                    Next
                </button>
</div>
</div>
<footer className="mt-xl w-full p-md bg-surface-container border-4 border-on-background rounded-xl shadow-[4px_4px_0px_0px_rgba(40,24,11,1)] flex flex-col md:flex-row items-center justify-between gap-md"><div className="flex gap-md"><a href="#" className="font-label-sm text-on-surface-variant hover:text-primary">About Us</a><a href="#" className="font-label-sm text-on-surface-variant hover:text-primary">Garden Rules</a><a href="#" className="font-label-sm text-on-surface-variant hover:text-primary">Support</a><a href="#" className="font-label-sm text-on-surface-variant hover:text-primary">Privacy</a></div><p className="font-label-sm text-on-surface-variant">© 2024 Lantech. Plant your seeds.</p></footer>
    </>
  );
};

export default Onboarding;
