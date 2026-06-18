import { NavLink } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const Header = () => {
  const streak = useAppStore((state) => state.streak);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface dark:bg-surface-dim border-b-4 border-on-surface-variant shadow-[4px_4px_0px_0px_rgba(81,67,69,1)]">
      <div className="flex items-center w-full px-lg py-xs">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <NavLink to="/" className="font-headline-lg text-headline-lg text-primary dark:text-primary-fixed flex items-center gap-xs hover:text-secondary transition-colors">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>potted_plant</span> 
            Lantech
          </NavLink>
        </div>
        
        {/* Center: Navigation */}
        <nav className="hidden md:flex flex-shrink-0 items-center justify-center gap-lg font-label-lg text-label-lg">
          <NavLink to="/learning-path-dashboard" className={({ isActive }) => `flex items-center gap-xs transition-colors hover:translate-y-0.5 duration-100 ${isActive ? 'text-secondary font-bold border-b-4 border-secondary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>
            <span className="material-symbols-outlined text-lg">map</span>Path
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `flex items-center gap-xs transition-colors hover:translate-y-0.5 duration-100 ${isActive ? 'text-secondary font-bold border-b-4 border-secondary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>
            <span className="material-symbols-outlined text-lg">leaderboard</span>Leaderboard
          </NavLink>
          <NavLink to="/flashcard-study-room" className={({ isActive }) => `flex items-center gap-xs transition-colors hover:translate-y-0.5 duration-100 ${isActive ? 'text-secondary font-bold border-b-4 border-secondary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>
            <span className="material-symbols-outlined text-lg">style</span>Flashcards
          </NavLink>
          <NavLink to="/profile-achievements" className={({ isActive }) => `flex items-center gap-xs transition-colors hover:translate-y-0.5 duration-100 ${isActive ? 'text-secondary font-bold border-b-4 border-secondary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>
            <span className="material-symbols-outlined text-lg">person</span>Profile
          </NavLink>
        </nav>
        
        {/* Right: Functional Buttons */}
        <div className="flex-1 flex items-center justify-end gap-md">
          {/* Current Streak Display */}
          <div className="flex items-center gap-1 cream-card px-3 py-1 text-on-surface-variant chunky-border" title="Current Streak">
            <span className="material-symbols-outlined text-[#ff7b00]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            <span className="font-headline-md text-lg text-[#ff7b00] font-bold">{streak}</span>
          </div>
          
          {/* User Profile / Logout */}
          <div className="hidden md:flex items-center gap-xs bg-surface-container px-4 py-2 chunky-border hover:bg-surface-dim transition-colors cursor-pointer active:translate-y-1">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary text-[10px]">JD</div>
            <span className="font-label-lg text-label-lg hidden lg:block">Logout</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
