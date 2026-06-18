import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { PixelFlower, PixelSprout, PixelBird, PixelStar } from '../components/pixel/PixelUI';

const LearningPathDashboard = () => {
  const { xp, league, lessonsCompleted } = useAppStore();

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-lg items-start pt-md pb-xl px-md">
      
      {/* LEFT COLUMN - THE PATH (Duolingo Style) */}
      <section className="flex-1 w-full flex justify-center relative pb-20">
        
        {/* Game Map Container */}
        <div className="relative w-full max-w-md h-[800px] flex-shrink-0 mt-8">
          {/* Background Map Texture */}
          <div className="absolute inset-0 bg-[#A8D08D] opacity-20 rounded-3xl chunky-border" style={{ backgroundImage: 'radial-gradient(#8FBC8F 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
          
          {/* Pixel Environment Decorations */}
          <div className="absolute top-[5%] left-[10%] opacity-80 pointer-events-none transform -rotate-12 z-0">
             <PixelSprout className="scale-[1.2]" />
          </div>
          <div className="absolute top-[25%] right-[5%] opacity-70 pointer-events-none z-0">
             <PixelFlower className="scale-[1.5]" />
          </div>
          <div className="absolute top-[60%] left-[8%] opacity-60 pointer-events-none z-0">
             <PixelBird className="scale-100" />
          </div>

          {/* The Path Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* A perfectly matching zigzag line */}
            <path d="M 50,10 L 25,30 L 50,50 L 75,70 L 50,90" fill="none" stroke="#7A5C43" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 3" />
          </svg>

          {/* Node 1: Completed */}
          <Link to="/active-lesson-exercise" className="absolute top-[10%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 group block">
            <div className="w-20 h-20 bg-secondary rounded-full border-4 border-on-surface shadow-[4px_4px_0px_0px_rgba(81,67,69,1)] flex items-center justify-center relative hover:-translate-y-1 transition-transform">
              <span className="material-symbols-outlined text-on-secondary text-4xl" data-icon="check" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
          </Link>

          {/* Node 2: Completed */}
          <Link to="/active-lesson-exercise" className="absolute top-[30%] left-[25%] -translate-x-1/2 -translate-y-1/2 z-10 group block">
            <div className="w-20 h-20 bg-secondary rounded-full border-4 border-on-surface shadow-[4px_4px_0px_0px_rgba(81,67,69,1)] flex items-center justify-center relative hover:-translate-y-1 transition-transform">
              <span className="material-symbols-outlined text-on-secondary text-4xl" data-icon="check" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
          </Link>

          {/* Node 3: Current (Active) */}
          <Link to="/active-lesson-exercise" className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 group block">
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-primary animate-bounce">
              <span className="material-symbols-outlined text-4xl" data-icon="arrow_drop_down" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_drop_down</span>
            </div>
            <div className="w-24 h-24 bg-primary-container rounded-full border-4 border-on-surface shadow-[6px_6px_0px_0px_rgba(81,67,69,1)] flex items-center justify-center relative z-10 scale-110">
              <span className="material-symbols-outlined text-on-primary-container text-5xl" data-icon="school" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <div className="absolute top-1/2 left-full ml-4 -translate-y-1/2 wooden-sign px-sm py-xs min-w-[120px] text-center shadow-[4px_4px_0px_0px_rgba(81,67,69,1)]">
              <span className="text-[#FDF8E1] font-label-lg text-label-lg whitespace-nowrap">Verbs 101</span>
            </div>
          </Link>

          {/* Node 4: Locked */}
          <div className="absolute top-[70%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-10 group cursor-not-allowed">
            <div className="w-20 h-20 bg-surface-variant rounded-full border-4 border-outline-variant shadow-[2px_2px_0px_0px_rgba(81,67,69,1)] flex items-center justify-center relative opacity-70 grayscale">
              <span className="material-symbols-outlined text-on-surface-variant text-4xl" data-icon="lock" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
          </div>

          {/* Node 5: Locked Chest/Boss */}
          <div className="absolute top-[90%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 group cursor-not-allowed">
            <div className="w-24 h-24 bg-surface-variant rounded-full border-4 border-outline-variant shadow-[2px_2px_0px_0px_rgba(81,67,69,1)] flex items-center justify-center relative opacity-70 grayscale">
              <span className="material-symbols-outlined text-on-surface-variant text-5xl" data-icon="lock" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
            <div className="absolute -top-6 -right-10 pointer-events-none opacity-40 flex items-center justify-center">
              <PixelStar className="scale-150" />
            </div>
          </div>

        </div>
      </section>

      {/* RIGHT COLUMN - STATS & ACTIONS (Duolingo Style) */}
      <aside className="w-full lg:w-[350px] flex flex-col gap-md sticky top-6">
        
        <div className="text-center mb-sm mt-4">
          <h1 className="font-display-md text-display-md text-primary">Welcome back, Alex!</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Ready to continue your journey?</p>
        </div>

        <div className="flex flex-col gap-sm">
          <div className="chunky-card p-sm flex items-center gap-md rounded-lg shadow-[4px_4px_0px_0px_rgba(81,67,69,1)]">
            <div className="w-12 h-12 bg-[#FFFACD] rounded-full border-2 border-[#DAA520] flex items-center justify-center text-[#B8860B]">
              <span className="material-symbols-outlined text-2xl" data-icon="star" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-on-surface leading-tight">{xp.toLocaleString()} XP</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Total Experience</span>
            </div>
          </div>

          <div className="chunky-card p-sm flex items-center gap-md rounded-lg shadow-[4px_4px_0px_0px_rgba(81,67,69,1)]">
            <div className="w-12 h-12 bg-primary-container rounded-full border-2 border-primary flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl" data-icon="emoji_events" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-on-surface leading-tight">{league} League</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Current Rank</span>
            </div>
          </div>

          <div className="chunky-card p-sm flex items-center gap-md rounded-lg shadow-[4px_4px_0px_0px_rgba(81,67,69,1)]">
            <div className="w-12 h-12 bg-secondary-container rounded-full border-2 border-secondary flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-2xl" data-icon="menu_book" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-on-surface leading-tight">{lessonsCompleted}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Lessons Mastered</span>
            </div>
          </div>
        </div>

        <Link to="/active-lesson-exercise" className="mt-sm chunky-btn bg-primary text-on-primary font-headline-md text-headline-md px-lg py-md rounded-lg shadow-[4px_4px_0px_0px_rgba(81,67,69,1)] hover:bg-primary-fixed-dim border-4 border-[#4A3728] inline-flex items-center justify-center uppercase tracking-wide hover:-translate-y-1 transition-transform">
            Continue Path
        </Link>
      </aside>

    </div>
  );
};

export default LearningPathDashboard;
