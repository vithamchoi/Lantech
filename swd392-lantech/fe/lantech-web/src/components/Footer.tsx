import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low border-t-4 border-on-surface-variant">
      <div className="absolute -top-6 left-0 w-full h-6 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 10px 24px, #006e1d 12px, transparent 13px)", backgroundSize: "20px 40px" }}></div>
      <div className="w-full px-lg flex flex-col md:flex-row justify-between items-center gap-md py-md">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-headline-md text-headline-md text-primary mb-xs">Lantech</span>
          <p className="text-on-surface-variant font-label-sm text-label-sm">© 2024 Lantech - Harvest Your Knowledge</p>
        </div>
        <div className="flex gap-md font-label-lg text-label-lg">
          <Link className="text-on-surface-variant hover:text-secondary underline" to="/about">About Us</Link>
          <Link className="text-on-surface-variant hover:text-secondary underline" to="/rules">Garden Rules</Link>
          <Link className="text-on-surface-variant hover:text-secondary underline" to="/support">Support</Link>
          <Link className="text-on-surface-variant hover:text-secondary underline" to="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
