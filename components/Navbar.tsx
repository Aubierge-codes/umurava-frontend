import Link from 'next/link';
import GwizaBrandMark from './GwizaBrandMark';
import ThemeToggle from './ThemeToggle';
const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto bg-brand-bg backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <GwizaBrandMark size={36} textClassName="text-xl text-brand-blue" />
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link href="#features" className="hover:text-brand-blue transition-colors">Features</Link>
        <Link href="#how-it-works" className="hover:text-brand-blue transition-colors">How It Works</Link>
        <Link href="#pricing" className="hover:text-brand-blue transition-colors">Pricing</Link>
      </div>

      <div className="flex items-stretch sm:items-center gap-3 sm:gap-4 flex-col sm:flex-row w-full sm:w-auto max-w-[220px] sm:max-w-none">
        <ThemeToggle />
        <Link href="/login" className="w-full sm:w-auto text-center">
          <span className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-brand-dark hover:text-brand-blue transition-colors rounded-full">
            Log In
          </span>
        </Link>
        <Link href="/signup" className="w-full sm:w-auto text-center">
          <span className="inline-flex items-center justify-center w-full sm:w-auto bg-brand-accent text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-blue transition-all shadow-md">
            Sign Up Free
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
