import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center px-6 md:px-12 lg:px-24 pt-20">
      <div className="max-w-4xl mx-auto w-full flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="flex-1 blur-panel">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-accent font-mono text-sm md:text-base mb-4"
          >
            Hi, my name is
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-lightest-slate mb-2"
          >
            Chad Gratts.
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-slate mb-6"
          >
            I code and play the flute.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-slate text-base md:text-lg max-w-xl mb-8 leading-relaxed"
          >
            I build scalable software, explore AI, and break down complex systems to
            uncover their deeper logic. Driven by endless curiosity, I love
            understanding systems in depth — not just how they work, but why.
            <br /><br />
            I developed{' '}
            <a
              href="https://providence-replay.github.io/"
              target="_blank"
              rel="noreferrer"
              className="text-accent font-semibold hover:underline hover:scale-105 inline-block transition-transform duration-200"
            >
              Providence
            </a>
            , an AI-powered session replay tool that turns raw user interactions into
            clear, actionable insights to improve UI/UX.
          </motion.p>

          <motion.a
            href="mailto:garrettgratts21@gmail.com"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="inline-block px-8 py-4 border border-accent text-accent font-mono rounded-lg hover:bg-accent/10 transition-all duration-200 hover:scale-105 text-sm"
          >
            Let's connect and build something great!
          </motion.a>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative group"
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden">
            <img
              src="/images/me.jpg"
              alt="Chad Gratts"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-accent/10 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0" />
          </div>
          <div className="absolute -inset-2 border border-accent rounded-2xl translate-x-3 translate-y-3 -z-10 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
        </motion.div>
      </div>
    </section>
  );
}
