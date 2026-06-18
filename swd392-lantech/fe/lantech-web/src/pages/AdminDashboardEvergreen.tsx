
const AdminDashboardEvergreen = () => {
  return (
    <>
      

<aside className="md:col-span-3 hidden md:flex flex-col gap-sm">
<div className="wood-panel p-md bg-[#8B5A2B] text-white !border-[#4A3728]">
<div className="screw-corner screw-tl !bg-[#D2B48C]"></div>
<div className="screw-corner screw-tr !bg-[#D2B48C]"></div>
<div className="screw-corner screw-bl !bg-[#D2B48C]"></div>
<div className="screw-corner screw-br !bg-[#D2B48C]"></div>
<h2 className="font-headline-md text-headline-md mb-sm text-center">Station Logs</h2>
<nav className="flex flex-col gap-xs">
<a className="bg-[#A0522D] p-2 border-2 border-[#4A3728] text-center font-label-lg text-label-lg hover:bg-[#CD853F] transition-colors" href="#">Overview</a>
<a className="bg-[#FDF8E1] text-[#4A3728] p-2 border-2 border-[#4A3728] text-center font-label-lg text-label-lg hover:bg-[#FFE4B5] transition-colors" href="#">Learner Roster</a>
<a className="bg-[#FDF8E1] text-[#4A3728] p-2 border-2 border-[#4A3728] text-center font-label-lg text-label-lg hover:bg-[#FFE4B5] transition-colors" href="#">Trail Map</a>
<a className="bg-[#FDF8E1] text-[#4A3728] p-2 border-2 border-[#4A3728] text-center font-label-lg text-label-lg hover:bg-[#FFE4B5] transition-colors" href="#">System Vitals</a>
</nav>
</div>

<div className="wood-panel p-md bg-secondary-container mt-sm">
<div className="flex items-center gap-xs mb-xs">
<span className="material-symbols-outlined text-secondary">park</span>
<h3 className="font-label-lg text-label-lg text-on-surface">Server Health</h3>
</div>
<div className="inset-panel p-2 flex justify-between items-center">
<span className="font-label-sm text-label-sm text-on-surface-variant">Uptime</span>
<span className="font-label-sm text-label-sm text-secondary">99.9%</span>
</div>
</div>
</aside>

<div className="md:col-span-9 flex flex-col gap-gutter">

<div className="flex flex-col gap-xs mb-md">
<h1 className="font-headline-lg text-headline-lg text-on-surface">Ranger's Overview</h1>
<p className="font-body-md text-body-md text-on-surface-variant">Welcome back. The trails are clear and learners are active.</p>
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-md">

<div className="wood-panel p-md bg-tertiary-fixed flex flex-col items-center text-center">
<div className="screw-corner screw-tl"></div>
<div className="screw-corner screw-tr"></div>
<div className="screw-corner screw-bl"></div>
<div className="screw-corner screw-br"></div>
<span className="material-symbols-outlined text-4xl text-tertiary mb-xs">group</span>
<h3 className="font-label-lg text-label-lg text-on-tertiary-container">Active Explorers</h3>
<div className="font-display-lg text-display-lg text-on-surface mt-sm">1,248</div>
<div className="mt-2 inline-flex items-center gap-1 bg-surface-container px-2 py-1 border-2 border-on-surface rounded-full">
<span className="material-symbols-outlined text-[14px] text-secondary">trending_up</span>
<span className="font-label-sm text-label-sm">+12% this week</span>
</div>
</div>

<div className="wood-panel p-md bg-primary-container flex flex-col items-center text-center">
<div className="screw-corner screw-tl"></div>
<div className="screw-corner screw-tr"></div>
<div className="screw-corner screw-bl"></div>
<div className="screw-corner screw-br"></div>
<span className="material-symbols-outlined text-4xl text-primary mb-xs">book</span>
<h3 className="font-label-lg text-label-lg text-on-primary-container">Trails Completed</h3>
<div className="font-display-lg text-display-lg text-on-surface mt-sm">8,932</div>
<div className="mt-2 inline-flex items-center gap-1 bg-surface-container px-2 py-1 border-2 border-on-surface rounded-full">
<span className="material-symbols-outlined text-[14px] text-secondary">trending_up</span>
<span className="font-label-sm text-label-sm">+5% today</span>
</div>
</div>

<div className="wood-panel p-md bg-surface-variant flex flex-col items-center text-center">
<div className="screw-corner screw-tl"></div>
<div className="screw-corner screw-tr"></div>
<div className="screw-corner screw-bl"></div>
<div className="screw-corner screw-br"></div>
<span className="material-symbols-outlined text-4xl text-on-surface-variant mb-xs">report</span>
<h3 className="font-label-lg text-label-lg text-on-surface-variant">Open Tickets</h3>
<div className="font-display-lg text-display-lg text-on-surface mt-sm">14</div>
<div className="mt-2 inline-flex items-center gap-1 bg-surface-container px-2 py-1 border-2 border-on-surface rounded-full">
<span className="material-symbols-outlined text-[14px] text-error">warning</span>
<span className="font-label-sm text-label-sm">3 need attention</span>
</div>
</div>
</div>

<div className="wood-panel mt-lg p-0 overflow-hidden">
<div className="bg-[#8B5A2B] p-md border-b-4 border-[#4A3728] flex justify-between items-center">
<h2 className="font-headline-md text-headline-md text-[#FDF8E1]">Recent Trail Activity</h2>
<button className="chunky-button bg-secondary text-on-secondary px-sm py-xs font-label-sm text-label-sm">
                        View All
                    </button>
</div>
<div className="p-md flex flex-col gap-sm bg-[#FDF8E1]">

<div className="flex items-center gap-md p-sm inset-panel hover:bg-surface-container-low transition-colors">
<div className="w-12 h-12 bg-tertiary-fixed border-2 border-on-surface flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-tertiary">star</span>
</div>
<div className="flex-grow">
<h4 className="font-label-lg text-label-lg text-on-surface">Alex completed "Basic Foraging"</h4>
<p className="font-body-md text-body-md text-on-surface-variant text-sm">Earned 50 XP and a new badge.</p>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">10 mins ago</span>
</div>

<div className="flex items-center gap-md p-sm inset-panel hover:bg-surface-container-low transition-colors">
<div className="w-12 h-12 bg-primary-fixed border-2 border-on-surface flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary">edit</span>
</div>
<div className="flex-grow">
<h4 className="font-label-lg text-label-lg text-on-surface">System updated "Campfire Protocols"</h4>
<p className="font-body-md text-body-md text-on-surface-variant text-sm">Content revised by Admin_Sarah.</p>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">1 hr ago</span>
</div>

<div className="flex items-center gap-md p-sm inset-panel hover:bg-surface-container-low transition-colors">
<div className="w-12 h-12 bg-surface-variant border-2 border-on-surface flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-surface-variant">person_add</span>
</div>
<div className="flex-grow">
<h4 className="font-label-lg text-label-lg text-on-surface">New Learner Registered</h4>
<p className="font-body-md text-body-md text-on-surface-variant text-sm">Welcome User_90210.</p>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">3 hrs ago</span>
</div>
</div>
</div>
</div>

    </>
  );
};

export default AdminDashboardEvergreen;
