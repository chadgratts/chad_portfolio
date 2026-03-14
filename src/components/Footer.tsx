import { Github, Linkedin } from 'lucide-react';
import { siteConfig } from '../data/content';

const iconMap: Record<string, React.ReactNode> = {
  GitHub: <Github size={18} />,
  LinkedIn: <Linkedin size={18} />,
};

export default function Footer() {
  return (
    <footer className="py-8 px-6 text-center blur-panel mx-6 md:mx-12 lg:mx-24 mb-8">
      <div className="flex justify-center gap-6 mb-4">
        {siteConfig.socialMedia.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate hover:text-accent transition-all duration-200 hover:scale-110"
            aria-label={social.name}
          >
            {iconMap[social.name] || social.name}
          </a>
        ))}
      </div>
      <div className="flex justify-center items-center gap-2 mb-2">
        <a
          href={siteConfig.socialMedia[0]?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate hover:text-accent text-xs font-mono transition-all duration-200 hover:scale-105"
        >
          Built by Chad Gratts
        </a>
      </div>
      <p className="text-slate/50 text-xs font-mono">
        Designed & built with React + Vite + Tailwind
      </p>
    </footer>
  );
}
