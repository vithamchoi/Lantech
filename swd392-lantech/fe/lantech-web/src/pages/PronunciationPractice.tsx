
const PronunciationPractice = () => {
  return (
    <>
      

<div className="absolute top-20 left-10 opacity-80 pointer-events-none hidden lg:block">
<img alt="Decorative Vine" className="w-32 h-32 object-cover rounded-DEFAULT pixel-border" data-alt="A close-up of a hanging ivy plant with vibrant green leaves, rendered in a chunky, nostalgic pixel-art aesthetic against a warm cream background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_dvMCaYqzP00ATB5N_G9kuFA6MIyc4snihin8UhK1ib2LOOktdh2RBAbwrZwIdu4jOvjrEeld91BaPpcB99vI-fxvxhyTLtbTgo70jRgnv0_YoW8L6rTJfV5Ebuy9ZY2b5t_R87_-yj4ssylb_AYLfMEoVahi_sVeRIqNINUjN5knf6Kt-u_pTqKjJfv_o-Qkl68S8EI6ylNEIRamaLv1Mj28b2U4Z81IwYj8jyx_xQfbXjPtvsxj1PRKL-j4YJiqz9Zxf2r-2w" />
</div>
<div className="absolute bottom-10 right-10 opacity-80 pointer-events-none hidden lg:block">
<img alt="Potted Plant" className="w-24 h-32 object-cover rounded-DEFAULT pixel-border" data-alt="A cute, blocky terracotta pot containing a small, lush fern, designed in a 16-bit retro simulation game style, sitting on a wooden texture." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVfQSXbRKkYs338rJFvztMvUC_SibJD_fAQWMU0pEQwuCko7JXlAHu8eCfk6Ve0EGZ-39xX9nJnrCk4CzWQ4GtoECqGjO-VDd0FUvi42mWJ_CcusoXZPQVo0YPJNYAEWdfEKXIT_2tg4gVeOySjM3TmXXq1z04JiIfpXTqqHAR-8y7ysCXSCCIO5RCE3cc11XE_H924B7wH8lnEhZrIOWxQVKUC18uKfQohWoc-4T7FhJfBsL8_Lh5LM61dduKF_VPYBCrOlzf_g" />
</div>

<div className="max-w-3xl w-full bg-[#FDF8E1] border-4 border-[#4A3728] p-1 rounded-DEFAULT chunky-shadow relative">

<div className="border-2 border-[#D2B48C] p-xl rounded-sm flex flex-col items-center text-center">

<div className="bg-[#8B5A2B] border-4 border-[#4A3728] px-md py-xs mb-xl relative chunky-shadow rounded-DEFAULT transform -translate-y-12">

<div className="absolute top-1 left-1 w-2 h-2 bg-[#4A3728] rounded-full"></div>
<div className="absolute top-1 right-1 w-2 h-2 bg-[#4A3728] rounded-full"></div>
<div className="absolute bottom-1 left-1 w-2 h-2 bg-[#4A3728] rounded-full"></div>
<div className="absolute bottom-1 right-1 w-2 h-2 bg-[#4A3728] rounded-full"></div>
<h1 className="font-headline-md text-headline-md text-[#FDF8E1] m-0">Pronunciation Practice</h1>
</div>

<p className="font-body-lg text-body-lg text-on-surface-variant mb-md">Read this sentence aloud:</p>
<div className="bg-surface-container-high border-4 border-[#4A3728] p-md mb-xl rounded-DEFAULT chunky-shadow inline-block">
<p className="font-headline-lg text-headline-lg text-on-surface m-0 select-all">"The forest is full of wonders."</p>
</div>

<div className="flex flex-col items-center gap-md">

<div className="relative flex flex-col items-center">
<button className="w-24 h-24 rounded-full bg-surface-bright border-4 border-[#4A3728] flex items-center justify-center cursor-pointer transition-all duration-200 z-10 btn-press chunky-shadow hover:bg-surface-variant" id="mic-btn">
<span className="material-symbols-outlined text-[48px] text-primary" style={{"fontVariationSettings":"'FILL' 0"}}>mic</span>
</button>

<div className="w-16 h-8 bg-[#8B5A2B] border-4 border-t-0 border-[#4A3728] rounded-b-DEFAULT z-0 -mt-2 chunky-shadow"></div>
<div className="w-24 h-4 bg-[#654321] border-4 border-[#4A3728] rounded-DEFAULT z-0 -mt-1 chunky-shadow"></div>
</div>
<p className="font-label-lg text-label-lg text-primary-container-on animate-pulse mt-xs" id="status-text">Click to speak</p>
</div>

<div className="absolute top-4 left-4 w-4 h-4 bg-secondary-fixed-dim rounded-full border-2 border-[#4A3728]"></div>
<div className="absolute bottom-4 right-4 w-4 h-4 bg-primary-fixed-dim rounded-full border-2 border-[#4A3728]"></div>
</div>
</div>

    </>
  );
};

export default PronunciationPractice;
