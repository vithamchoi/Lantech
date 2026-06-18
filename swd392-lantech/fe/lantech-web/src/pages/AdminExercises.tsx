
const AdminExercises = () => {
  return (
    <>
      

<div className="absolute top-[100px] left-0 hidden lg:block opacity-70 pointer-events-none">
<span className="material-symbols-outlined text-secondary text-[64px]">psychiatry</span>
</div>

<div className="mb-lg relative z-10 text-center">
<div className="inline-block bg-inverse-surface text-inverse-on-surface px-md py-sm rounded-DEFAULT border-4 border-on-surface shadow-[4px_4px_0px_0px_rgba(40,24,11,1)] relative">

<div className="pixel-screw top-2 left-2"></div>
<div className="pixel-screw top-2 right-2"></div>
<div className="pixel-screw bottom-2 left-2"></div>
<div className="pixel-screw bottom-2 right-2"></div>
<h1 className="font-headline-lg text-headline-lg mb-xs">Lesson Seedbed</h1>
<p className="font-body-md text-body-md text-surface-container-highest">Plant a new exercise for your students to cultivate.</p>
</div>
</div>

<form className="grid grid-cols-1 md:grid-cols-12 gap-gutter relative z-10">

<div className="md:col-span-8 bg-surface-container-lowest p-md rounded-DEFAULT chunky-card">
<h2 className="font-headline-md text-headline-md text-primary mb-md flex items-center gap-xs border-b-2 border-outline-variant pb-xs">
<span className="material-symbols-outlined">edit_document</span>
                    Exercise Details
                </h2>
<div className="space-y-md">

<div className="flex flex-col gap-xs">
<label className="font-label-lg text-label-lg text-on-surface" htmlFor="questionText">Question Prompt</label>
<textarea className="chunky-input font-body-md text-body-md p-sm rounded-DEFAULT resize-y" id="questionText" placeholder="Enter the vocabulary word or sentence to translate..." rows={4}></textarea>
</div>

<div className="flex flex-col gap-xs">
<label className="font-label-lg text-label-lg text-on-surface" htmlFor="correctAnswer">Correct Answer</label>
<input className="chunky-input font-body-md text-body-md p-sm rounded-DEFAULT" id="correctAnswer" placeholder="The exact answer expected..." type="text"/>
</div>
</div>
</div>

<div className="md:col-span-4 space-y-gutter">

<div className="bg-surface-container-lowest p-md rounded-DEFAULT chunky-card">
<h2 className="font-headline-md text-headline-md text-primary mb-md flex items-center gap-xs border-b-2 border-outline-variant pb-xs">
<span className="material-symbols-outlined">settings</span>
                        Configuration
                    </h2>
<div className="space-y-md">

<div className="flex flex-col gap-xs">
<label className="font-label-lg text-label-lg text-on-surface" htmlFor="exerciseType">Exercise Type</label>
<div className="relative">
<select className="chunky-input font-body-md text-body-md p-sm rounded-DEFAULT w-full appearance-none pr-10 cursor-pointer bg-surface" id="exerciseType">
<option value="translation">Translation</option>
<option value="fill_blank">Fill in the Blank</option>
<option value="matching">Vocabulary Matching</option>
</select>
<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface">
<span className="material-symbols-outlined">arrow_drop_down</span>
</div>
</div>
</div>

<div className="flex flex-col gap-xs pt-sm border-t-2 border-outline-variant border-dashed">
<label className="font-label-lg text-label-lg text-secondary flex items-center gap-xs" htmlFor="aiHint">
<span className="material-symbols-outlined text-[18px]">smart_toy</span>
                                AI Hint Generation
                            </label>
<p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Provide context for the AI assistant to give helpful nudges.</p>
<textarea className="chunky-input font-body-md text-body-md p-sm rounded-DEFAULT bg-secondary-container bg-opacity-20 border-secondary-fixed-dim focus:border-secondary" id="aiHint" placeholder="e.g., Remind them about irregular verb conjugations..." rows={3}></textarea>
</div>
</div>
</div>

<div className="bg-primary-container p-md rounded-DEFAULT chunky-card !border-primary !shadow-primary-fixed-dim">
<p className="font-body-md text-body-md text-on-primary-container mb-md text-center">Ready to add this to the curriculum garden?</p>
<button className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-sm px-md rounded-DEFAULT flex items-center justify-center gap-sm chunky-button shadow-on-surface-variant hover:bg-surface-tint" type="submit">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>potted_plant</span>
                        Plant this Lesson
                     </button>
</div>
</div>
</form>

<div className="absolute bottom-[-20px] right-gutter hidden lg:flex items-end gap-xs opacity-80 pointer-events-none">
<span className="material-symbols-outlined text-secondary text-[32px]">grass</span>
<span className="material-symbols-outlined text-secondary-fixed-dim text-[48px]">local_florist</span>
<span className="material-symbols-outlined text-secondary text-[24px]">grass</span>
</div>

    </>
  );
};

export default AdminExercises;
