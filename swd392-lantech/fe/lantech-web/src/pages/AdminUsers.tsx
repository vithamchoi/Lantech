
const AdminUsers = () => {
  return (
    <>
      

<div className="hidden lg:block absolute left-0 top-0 w-[120px] h-full pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTIwIDBDMjAgMjAgMCAyMCAwIDIwQzAgMjAgMjAgMjAgMjAgNDBDMjAgMjAgNDAgMjAgNDAgMjBDNDAgMjAgMjAgMjAgMjAgMHoiIGZpbGw9IiM3N2RkNzciLz48L3N2Zz4=')] bg-repeat-y"></div>
<div className="hidden lg:block absolute right-0 top-0 w-[120px] h-full pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTIwIDBDMjAgMjAgMCAyMCAwIDIwQzAgMjAgMjAgMjAgMjAgNDBDMjAgMjAgNDAgMjAgNDAgMjBDNDAgMjAgMjAgMjAgMjAgMHoiIGZpbGw9IiM3N2RkNzciLz48L3N2Zz4=')] bg-repeat-y transform scale-x-[-1]"></div>
<div className="w-full max-w-container-max relative z-10">

<div className="bg-surface-tint border-4 border-on-surface shadow-[4px_4px_0px_0px_#28180b] p-md mb-lg relative inline-block mx-auto transform -rotate-1">
<div className="pixel-screw top-2 left-2"></div>
<div className="pixel-screw top-2 right-2"></div>
<div className="pixel-screw bottom-2 left-2"></div>
<div className="pixel-screw bottom-2 right-2"></div>
<h1 className="font-display-lg text-display-lg text-surface-container-lowest px-xl py-xs">Guild Registry</h1>
</div>

<div className="bg-surface-variant border-4 border-on-surface shadow-[8px_8px_0px_0px_#28180b] p-[12px] relative">

<div className="border-2 border-outline bg-surface p-unit h-full">

<div className="ledger-paper border-4 border-on-surface min-h-[500px] flex flex-col">

<div className="flex justify-between items-center p-md border-b-4 border-on-surface bg-surface-container-lowest">
<div className="flex gap-sm">
<div className="relative">
<span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface" data-icon="search">search</span>
<input className="pl-xl pr-sm py-xs bg-surface border-t-4 border-l-4 border-r-2 border-b-2 border-on-surface border-r-outline border-b-outline focus:outline-none focus:ring-0 font-label-lg text-label-lg w-[250px] placeholder:text-outline" placeholder="Search members..." type="text"/>
</div>
<button className="bg-secondary-container text-on-secondary-fixed border-4 border-on-surface border-b-[6px] px-sm py-xs font-label-lg text-label-lg flex items-center gap-xs active:border-b-4 active:translate-y-[2px] hover:bg-secondary-fixed transition-all">
<span className="material-symbols-outlined" data-icon="filter_list">filter_list</span>
                                    Filter
                                </button>
</div>
<button className="bg-primary-container text-on-primary-container border-4 border-on-surface border-b-[6px] px-md py-xs font-label-lg text-label-lg flex items-center gap-xs active:border-b-4 active:translate-y-[2px] hover:bg-primary-fixed transition-all">
<span className="material-symbols-outlined" data-icon="person_add">person_add</span>
                                Enroll
                            </button>
</div>

<div className="overflow-x-auto ledger-scroll flex-grow">
<table className="w-full text-left border-collapse">
<thead className="bg-surface-container-high font-headline-md text-headline-md border-b-4 border-on-surface">
<tr>
<th className="p-sm border-r-4 border-on-surface border-b-4 border-b-on-surface sticky top-0 bg-surface-container-highest z-10">ID</th>
<th className="p-sm border-r-4 border-on-surface border-b-4 border-b-on-surface sticky top-0 bg-surface-container-highest z-10">Member Name</th>
<th className="p-sm border-r-4 border-on-surface border-b-4 border-b-on-surface sticky top-0 bg-surface-container-highest z-10">Role</th>
<th className="p-sm border-r-4 border-on-surface border-b-4 border-b-on-surface sticky top-0 bg-surface-container-highest z-10">Status</th>
<th className="p-sm border-b-4 border-b-on-surface text-center sticky top-0 bg-surface-container-highest z-10">Stamps</th>
</tr>
</thead>
<tbody className="font-body-lg bg-surface-container-lowest/80 font-bold text-on-surface">

<tr className="hover:bg-surface-container transition-colors group">
<td className="p-sm border-r-4 border-b-4 border-on-surface font-label-lg">#0042</td>
<td className="p-sm border-r-4 border-b-4 border-on-surface flex items-center gap-md">
<div className="w-[32px] h-[32px] border-2 border-on-surface bg-tertiary-container overflow-hidden">
<img alt="Avatar" className="w-full h-full object-cover" data-alt="A pixel-art style portrait of a cheerful male character with glasses, wearing a simple tunic, set against a soft blue background. Classic 16-bit RPG aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCetV6Z6gJntnEExTPqCE7uSvQgBxe7bNPN3Jvc1BrotvkRj9MsKx_hwPBAOFa8mRIyMxtgq3B-eszNxrSJVFyI4bGcMW66Ezb6n-uUDvQRvo9hM7NkB81nki14unR5R2NwQMcyNjyKGKZg206ek8wQxe6gBzU1JWTdnQT-ff0bU9-WLiMs7FP9lD3fppazZGzIh1_JFIL0k69NXyfjHUVJuVbCiK30A5zBOj1nyYB445mTkNITEz3NxN23PSjprcu1A89gMkevZA"/>
</div>
                                            Oliver Branch
                                        </td>
<td className="p-sm border-r-4 border-b-4 border-on-surface">
<span className="inline-flex items-center px-xs py-[2px] bg-tertiary-container border-2 border-on-surface font-label-sm text-on-tertiary-container uppercase tracking-wider">Scholar</span>
</td>
<td className="p-sm border-r-4 border-b-4 border-on-surface">
<div className="flex items-center gap-xs text-secondary">
<span className="material-symbols-outlined text-[18px]" data-icon="energy_savings_leaf" data-weight="fill" style={{"fontVariationSettings":"'FILL' 1"}}>energy_savings_leaf</span>
                                                Active
                                            </div>
</td>
<td className="p-sm border-b-4 border-on-surface">
<div className="flex justify-center gap-sm opacity-0 group-hover:opacity-100 transition-opacity">

<button className="w-[36px] h-[36px] bg-secondary-container border-4 border-on-surface border-b-[6px] active:border-b-4 active:translate-y-[2px] flex items-center justify-center text-on-secondary-fixed hover:bg-secondary-fixed transition-all group" title="Edit">
<span className="material-symbols-outlined text-[18px] transform group-hover:rotate-12 transition-transform" data-icon="edit_document">edit_document</span>
</button>

<button className="w-[36px] h-[36px] bg-error-container border-4 border-on-surface border-b-[6px] active:border-b-4 active:translate-y-[2px] flex items-center justify-center text-error hover:bg-[#ffb4ab] transition-all group" title="Ban">
<span className="material-symbols-outlined text-[18px] transform group-hover:-rotate-12 transition-transform" data-icon="block">block</span>
</button>
</div>
</td>
</tr>

<tr className="hover:bg-surface-container transition-colors group">
<td className="p-sm border-r-4 border-b-4 border-on-surface font-label-lg">#0089</td>
<td className="p-sm border-r-4 border-b-4 border-on-surface flex items-center gap-md">
<div className="w-[32px] h-[32px] border-2 border-on-surface bg-primary-container overflow-hidden">
<img alt="Avatar" className="w-full h-full object-cover" data-alt="A pixel-art portrait of a female character with braided hair, wearing a dark green cloak, set against a warm pink background. Cozy, nostalgic game art style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPwBTtjWILwiBGCAHtoHHbNHXV7q9FcqDPe_yAHQJY7z_nVfU5H4bf8ISJ7dNavg2F89AYcD7iy1fMMuvYrFf7pUWyGsdGPVn2kfy9dLyTKOWB6wsZzjginWTINNj5zaXD2e9NvVTkZRQeZPPI3OB90trBHx4Y-kUhuTynqWtZZzfmtlqcM5NM2ND-eAYcE7dRVQT2Ct7q_wjeLtbdhbrHENkwfcrRQ3fR2yERjPa4fkAfjWpFIGaxJVIZ1C49bcnNJTz-z-txAA"/>
</div>
                                            Hazel Woods
                                        </td>
<td className="p-sm border-r-4 border-b-4 border-on-surface">
<span className="inline-flex items-center px-xs py-[2px] bg-surface-tint border-2 border-on-surface font-label-sm text-on-primary uppercase tracking-wider">Warden</span>
</td>
<td className="p-sm border-r-4 border-b-4 border-on-surface">
<div className="flex items-center gap-xs text-secondary">
<span className="material-symbols-outlined text-[18px]" data-icon="energy_savings_leaf" data-weight="fill" style={{"fontVariationSettings":"'FILL' 1"}}>energy_savings_leaf</span>
                                                Active
                                            </div>
</td>
<td className="p-sm border-b-4 border-on-surface">
<div className="flex justify-center gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
<button className="w-[36px] h-[36px] bg-secondary-container border-4 border-on-surface border-b-[6px] active:border-b-4 active:translate-y-[2px] flex items-center justify-center text-on-secondary-fixed hover:bg-secondary-fixed transition-all group" title="Edit">
<span className="material-symbols-outlined text-[18px] transform group-hover:rotate-12 transition-transform" data-icon="edit_document">edit_document</span>
</button>
<button className="w-[36px] h-[36px] bg-error-container border-4 border-on-surface border-b-[6px] active:border-b-4 active:translate-y-[2px] flex items-center justify-center text-error hover:bg-[#ffb4ab] transition-all group" title="Ban">
<span className="material-symbols-outlined text-[18px] transform group-hover:-rotate-12 transition-transform" data-icon="block">block</span>
</button>
</div>
</td>
</tr>

<tr className="bg-surface-variant/50 hover:bg-surface-container transition-colors group opacity-75">
<td className="p-sm border-r-4 border-b-4 border-on-surface font-label-lg text-outline">#0112</td>
<td className="p-sm border-r-4 border-b-4 border-on-surface flex items-center gap-md text-outline line-through decoration-on-surface decoration-2">
<div className="w-[32px] h-[32px] border-2 border-outline bg-surface-container-highest overflow-hidden grayscale">
<img alt="Avatar" className="w-full h-full object-cover" data-alt="A desaturated pixel-art portrait of a male character looking stern, set against a gray background. Classic 16-bit RPG aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA08cRuCm_WJkydfL9TFi5vKocx5mf4B9XtdFmNCpJ3CACYIzTaOxBoR2waS4wv0BZENhgucO_Cv4lA7XuDJJRtO_km4CzUSWx_ivkXi3fzjgIdS50Cr7L13q8Cz5gJdvSXDpLuArt7DCss9VpoJNmkBP_eImBijLLMg3U5EkQ9lf1N03pqy4-kGqNMLUeDeXXc2oJV8FVz7yxV7HEJ8LPnpiWaPxzdPE_cYOivcBtJ4_z1Rqr7f82z3qeys33JJMXcCAyKOBhftg"/>
</div>
                                            Thorn Bushes
                                        </td>
<td className="p-sm border-r-4 border-b-4 border-on-surface">
<span className="inline-flex items-center px-xs py-[2px] bg-surface-container border-2 border-outline font-label-sm text-outline uppercase tracking-wider">Wanderer</span>
</td>
<td className="p-sm border-r-4 border-b-4 border-on-surface">
<div className="flex items-center gap-xs text-error font-bold">
<span className="material-symbols-outlined text-[18px]" data-icon="do_not_disturb_on" data-weight="fill" style={{"fontVariationSettings":"'FILL' 1"}}>do_not_disturb_on</span>
                                                Exiled
                                            </div>
</td>
<td className="p-sm border-b-4 border-on-surface">
<div className="flex justify-center gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
<button className="w-[36px] h-[36px] bg-surface-container-highest border-4 border-on-surface border-b-[6px] active:border-b-4 active:translate-y-[2px] flex items-center justify-center text-on-surface hover:bg-surface-dim transition-all group" title="Restore">
<span className="material-symbols-outlined text-[18px] transform group-hover:rotate-12 transition-transform" data-icon="settings_backup_restore">settings_backup_restore</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>

<div className="p-sm border-t-4 border-on-surface flex justify-between items-center bg-surface-container-lowest font-label-lg text-on-surface-variant">
<span>Showing Page 1 of 4</span>
<div className="flex gap-sm">
<button className="p-xs border-4 border-on-surface border-b-[6px] active:border-b-4 active:translate-y-[2px] bg-surface hover:bg-surface-variant opacity-50 cursor-not-allowed">
<span className="material-symbols-outlined block" data-icon="chevron_left">chevron_left</span>
</button>
<button className="p-xs border-4 border-on-surface border-b-[6px] active:border-b-4 active:translate-y-[2px] bg-surface hover:bg-surface-variant text-on-surface">
<span className="material-symbols-outlined block" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
</div>
</div>

    </>
  );
};

export default AdminUsers;
