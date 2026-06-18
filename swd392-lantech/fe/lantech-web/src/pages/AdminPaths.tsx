
const AdminPaths = () => {
  return (
    <>
      

<div className="absolute top-0 left-10 w-20 h-32 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMjAgMGMxMS4wNDYgMCAyMCA4Ljk1NCAyMCAyMHMtOC45NTQgMjAtMjAgMjBTMCAzMS4wNDYgMCAyMCA4Ljk1NCAwIDIwIDB6bTAgOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnoiIGZpbGw9IiM5MmZhOTAiIGZpbGwtb3BhY2l0eT0iLjIiLz48L3N2Zz4=')] bg-repeat-y opacity-50 z-[-1] pointer-events-none"></div>
<div className="grid grid-cols-1 md:grid-cols-12 gap-xl">

<aside className="md:col-span-4 flex flex-col gap-md">
<div className="wooden-sign p-lg text-center">
<div className="screw-bl"></div><div className="screw-br"></div>
<span className="material-symbols-outlined text-[48px] text-primary mb-xs" style={{"fontVariationSettings":"'FILL' 1"}}>map</span>
<h1 className="font-headline-lg text-headline-lg text-on-background mb-sm">New Node</h1>
<p className="font-body-md text-on-surface-variant">Carve out a new destination on the learning path. Make sure it's properly marked for travelers.</p>
</div>
<div className="bg-surface-container border-4 border-on-background p-md shadow-[4px_4px_0px_0px_rgba(40,24,11,1)]">
<h3 className="font-label-lg text-label-lg text-on-background border-b-2 border-outline-variant pb-xs mb-sm">Current Map Segment</h3>
<div className="flex items-center gap-sm mb-xs">
<span className="material-symbols-outlined text-secondary" style={{"fontVariationSettings":"'FILL' 1"}}>park</span>
<span className="font-body-md text-on-surface">The Whispering Woods</span>
</div>
<div className="flex items-center gap-sm opacity-50 pl-xs border-l-2 border-outline-variant ml-[11px] h-8">
</div>
<div className="flex items-center gap-sm text-primary">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>add_circle</span>
<span className="font-label-lg text-label-lg">Placing Node Here...</span>
</div>
</div>
</aside>

<div className="md:col-span-8">
<form className="bg-surface-container-high border-4 border-on-background p-lg shadow-[8px_8px_0px_0px_rgba(40,24,11,1)] relative">

<div className="absolute inset-0 border-2 border-[#fff1e9] pointer-events-none m-unit"></div>
<div className="flex flex-col gap-lg relative z-10">

<div className="flex flex-col gap-xs">
<label className="font-label-lg text-label-lg text-on-background flex items-center gap-xs" htmlFor="nodeName">
<span className="material-symbols-outlined text-secondary text-[20px]" style={{"fontVariationSettings":"'FILL' 1"}}>edit</span>
                                Node Title
                            </label>
<input className="chunky-input w-full p-sm font-body-lg text-body-lg text-on-surface" id="nodeName" placeholder="e.g. Basic Foraging" type="text"/>
<p className="font-label-sm text-label-sm text-on-surface-variant">The name displayed on the wooden signpost.</p>
</div>

<div className="flex flex-col gap-xs">
<label className="font-label-lg text-label-lg text-on-background flex items-center gap-xs" htmlFor="nodeDesc">
<span className="material-symbols-outlined text-secondary text-[20px]" style={{"fontVariationSettings":"'FILL' 1"}}>description</span>
                                Trail Notes
                            </label>
<textarea className="chunky-input w-full p-sm font-body-md text-body-md text-on-surface resize-none" id="nodeDesc" placeholder="Describe the challenges ahead..." rows={4}></textarea>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-md">

<div className="flex flex-col gap-xs">
<label className="font-label-lg text-label-lg text-on-background flex items-center gap-xs" htmlFor="reqXp">
<span className="material-symbols-outlined text-tertiary text-[20px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
                                    Required XP
                                </label>
<input className="chunky-input w-full p-sm font-body-lg text-body-lg text-on-surface" id="reqXp" placeholder="100" type="number"/>
</div>

<div className="flex flex-col gap-xs">
<label className="font-label-lg text-label-lg text-on-background flex items-center gap-xs">
<span className="material-symbols-outlined text-tertiary text-[20px]" style={{"fontVariationSettings":"'FILL' 1"}}>category</span>
                                    Marker Icon
                                </label>
<div className="flex gap-sm">
<button className="w-12 h-12 bg-surface border-2 border-on-background flex items-center justify-center hover:bg-surface-container-highest transition-colors focus:border-primary focus:border-4" type="button">
<span className="material-symbols-outlined">menu_book</span>
</button>
<button className="w-12 h-12 bg-surface border-2 border-on-background flex items-center justify-center hover:bg-surface-container-highest transition-colors focus:border-primary focus:border-4" type="button">
<span className="material-symbols-outlined">quiz</span>
</button>
<button className="w-12 h-12 bg-surface border-2 border-on-background flex items-center justify-center hover:bg-surface-container-highest transition-colors focus:border-primary focus:border-4" type="button">
<span className="material-symbols-outlined">extension</span>
</button>
</div>
</div>
</div>

<div className="mt-md flex justify-end gap-md border-t-4 border-on-background pt-md border-dashed">
<button className="px-lg py-sm font-label-lg text-label-lg text-on-surface-variant hover:text-on-background transition-colors" type="button">
                                Cancel
                            </button>
<button className="chunky-button bg-primary text-on-primary px-lg py-sm font-label-lg text-label-lg flex items-center gap-xs" type="submit">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>construction</span>
                                Build Node
                            </button>
</div>
</div>
</form>
</div>
</div>

    </>
  );
};

export default AdminPaths;
