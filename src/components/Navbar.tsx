import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { siteConfig } from '../data/content';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [menuOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 2.2 }}
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 transition-all duration-300 bg-white/70 backdrop-blur-xl ${
          scrolled
            ? 'shadow-lg shadow-black/5'
            : ''
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="#"
            className="text-accent font-mono text-xl font-bold hover:text-accent/80 transition-colors"
          >
            CG
          </a>

          <div className="hidden md:flex items-center gap-8">
            {siteConfig.navLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.url}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4 + i * 0.1 }}
                className="text-lightest-slate hover:text-accent text-sm font-mono transition-all duration-200 hover:scale-105"
              >
                <span className="text-accent text-xs mr-1">0{i + 1}.</span>
                {link.name}
              </motion.a>
            ))}
            <motion.a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.9 }}
              className="px-4 py-2 border border-accent text-accent text-sm font-mono rounded-md hover:bg-accent/10 transition-all duration-200 hover:scale-105"
            >
              Resume
            </motion.a>
          </div>

          <button
            className="md:hidden text-[#1d4ed8] z-[60] relative"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex items-center justify-center md:hidden"
          >
            <nav className="flex flex-col items-center gap-8">
              {siteConfig.navLinks.map((link, i) => (
                <a
                  key={link.name}
                  href={link.url}
                  onClick={() => setMenuOpen(false)}
                  className="text-lightest-slate hover:text-accent text-lg font-mono transition-all duration-200 hover:scale-105"
                >
                  <span className="text-accent text-sm mr-2">0{i + 1}.</span>
                  {link.name}
                </a>
              ))}
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-6 py-3 border border-accent text-accent font-mono rounded-md hover:bg-accent/10 transition-all duration-200 hover:scale-105"
              >
                Resume
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
