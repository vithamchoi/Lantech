
const Login = () => {
  return (
    <>
      

<header className="flex items-center justify-between mb-lg px-md py-sm bg-surface-container wooden-border chunky-shadow relative">
    <div className="pixel-screw screw-tl"></div>
    <div className="pixel-screw screw-tr"></div>
    <div className="pixel-screw screw-bl"></div>
    <div className="pixel-screw screw-br"></div>
    <div className="flex items-center gap-md">
        <h1 className="font-display-lg text-headline-lg text-primary">Lantech</h1>
        <nav className="hidden md:flex items-center gap-sm">
            <a href="#" className="flex items-center gap-xs font-label-lg text-on-surface hover:text-secondary transition-colors">
                <span className="material-symbols-outlined">map</span>Path
            </a>
            <a href="#" className="flex items-center gap-xs font-label-lg text-on-surface hover:text-secondary transition-colors">
                <span className="material-symbols-outlined">leaderboard</span>Leaderboard
            </a>
            <a href="#" className="flex items-center gap-xs font-label-lg text-on-surface hover:text-secondary transition-colors">
                <span className="material-symbols-outlined">style</span>Flashcards
            </a>
        </nav>
    </div>
    <div className="flex items-center gap-sm">
        <div className="flex items-center gap-xs bg-surface-lowest px-xs py-unit border-2 border-on-surface">
            <span className="material-symbols-outlined text-secondary">local_fire_department</span>
            <span className="font-label-sm">7</span>
        </div>
        <button className="p-unit hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined">light_mode</span>
        </button>
        <div className="flex items-center gap-xs bg-surface-lowest px-xs py-unit border-2 border-on-surface">
            <span className="material-symbols-outlined text-primary">account_circle</span>
            <span className="font-label-sm hidden sm:block">Traveler</span>
        </div>
    </div>
</header>

<div className="bg-surface-container-highest p-md wooden-border chunky-shadow relative mb-lg">
<div className="pixel-screw screw-tl"></div>
<div className="pixel-screw screw-tr"></div>
<div className="pixel-screw screw-bl"></div>
<div className="pixel-screw screw-br"></div>
<div className="text-center mb-md mt-sm">
<h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Welcome Back to the Hearth</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Sign in to continue your journey.</p>
</div>
<form action="#" className="space-y-sm" method="POST">
<div>
<label className="block font-label-lg text-label-lg text-on-surface mb-unit" htmlFor="email">Email</label>
<input className="w-full bg-surface-lowest text-on-surface border-t-4 border-l-4 border-r-2 border-b-2 border-on-surface focus:outline-none focus:ring-0 p-xs font-body-md" id="email" name="email" placeholder="traveler@example.com" required={true} type="email" />
</div>
<div>
<label className="block font-label-lg text-label-lg text-on-surface mb-unit" htmlFor="password">Password</label>
<input className="w-full bg-surface-lowest text-on-surface border-t-4 border-l-4 border-r-2 border-b-2 border-on-surface focus:outline-none focus:ring-0 p-xs font-body-md" id="password" name="password" placeholder="••••••••" required={true} type="password" />
</div>
<div className="flex items-center justify-between mt-sm mb-md">
<label className="flex items-center">
<input className="form-checkbox border-2 border-on-surface rounded-none text-secondary focus:ring-secondary w-5 h-5 bg-surface-lowest" type="checkbox" />
<span className="ml-2 font-body-md text-body-md text-on-surface-variant">Remember me</span>
</label>
<a className="font-label-sm text-label-sm text-primary hover:text-secondary transition-colors" href="#">Forgot Password?</a>
</div>
<button className="w-full bg-secondary text-on-secondary font-label-lg text-label-lg py-sm px-md border-4 border-on-surface chunky-shadow chunky-button transition-transform flex items-center justify-center gap-xs" type="submit">
                    Sign In
                    <span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>login</span>
</button>
</form>
<div className="mt-md relative flex items-center py-xs">
<div className="flex-grow border-t-4 border-on-surface border-dashed opacity-30"></div>
<span className="flex-shrink-0 mx-4 text-on-surface-variant font-label-sm text-label-sm">or</span>
<div className="flex-grow border-t-4 border-on-surface border-dashed opacity-30"></div>
</div>
<button className="mt-md w-full bg-surface text-on-surface font-label-lg text-label-lg py-sm px-md border-4 border-on-surface chunky-shadow chunky-button transition-transform flex items-center justify-center gap-xs" type="button">
<span className="material-symbols-outlined text-primary">account_circle</span>
                Sign in with Google
            </button>
<p className="text-center mt-md font-body-md text-body-md text-on-surface-variant">
                New here? <a className="font-label-lg text-label-lg text-primary hover:text-secondary transition-colors underline decoration-2 underline-offset-4" href="#">Create Account</a>
</p>
</div>

    </>
  );
};

export default Login;
