import { useState } from "react";
import { Link, useLocation } from "wouter";
import { FaCubes, FaBars } from "react-icons/fa";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-black border-b-4 border-primary/50 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <FaCubes className="text-2xl mr-2" />
              <span className="font-bold text-xl tracking-tight">ModVoyage</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className={`border-b-2 ${location === '/' ? 'border-white' : 'border-transparent hover:border-white'} px-1 pt-1 text-sm font-medium`}>
                {t('common.home')}
              </Link>
              <Link href="/about" className="border-b-2 border-transparent hover:border-white px-1 pt-1 text-sm font-medium">
                {t('common.about')}
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            <div className="sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary/40 focus:outline-none"
                onClick={toggleMobileMenu}
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`sm:hidden ${mobileMenuOpen ? '' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/" className={`block pl-3 pr-4 py-2 border-l-4 ${location === '/' ? 'bg-primary/30 border-primary text-white' : 'border-transparent hover:bg-gray-800 hover:border-primary/60 hover:text-white'}`}>
            {t('common.home')}
          </Link>
          <Link href="/about" className="block pl-3 pr-4 py-2 border-l-4 border-transparent hover:bg-gray-800 hover:border-primary/60 hover:text-white">
            {t('common.about')}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
