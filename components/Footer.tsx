import Link from 'next/link';

import GwizaBrandMark from './GwizaBrandMark';

const Footer = () => {
  return (
    <footer className="bg-[#2E5A88] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <GwizaBrandMark size={32} textClassName="text-2xl" />
            </div>
            <p className="text-slate-400 leading-relaxed text-[15px]">
              The leading AI-powered platform for skill challenges and talent matching. 
              We bridge the gap between education and employment.
            </p>
          
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Platform</h4>
            <ul className="space-y-4 text-slate-400 text-[15px]">
              <li><Link href="#challenges" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>


          <div>
            <h4 className="font-bold text-lg mb-6">Stay Updated</h4>
            <p className="text-slate-400 text-sm mb-4">Get the latest challenges and news.</p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full flex-1 bg-brand-accent border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue placeholder:text-slate-400 outline-none"
              />
              <button className="w-full sm:w-auto bg-brand-blue text-white font-bold py-3 px-5 rounded-xl hover:bg-opacity-90 transition-all">
                Subscribe
              </button>
            </form>
          </div>

        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-white/80">
          <p>© 2026 GwizaAI. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
            <Link href="#" className="hover:text-white">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
