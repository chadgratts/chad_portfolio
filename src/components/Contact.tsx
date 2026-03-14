import { motion } from 'framer-motion';
import { siteConfig } from '../data/content';

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-2xl mx-auto text-center blur-panel">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-accent font-mono text-sm mb-4"
        >
          05. What's Next?
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-lightest-slate mb-6"
        >
          Get In Touch
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate mb-12 leading-relaxed"
        >
          Whether you want to reach out to discuss an opportunity or just say hi!,
          I would love to hear from you.
        </motion.p>

        <motion.a
          href={`mailto:${siteConfig.email}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-block px-8 py-4 border border-accent text-accent font-mono rounded-lg hover:bg-accent/10 transition-all duration-200 hover:scale-105 text-sm"
        >
          Say Hello
        </motion.a>
      </div>
    </section>
  );
}
