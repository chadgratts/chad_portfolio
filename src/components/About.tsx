import { motion } from 'framer-motion';
import { skills } from '../data/content';

export default function About() {
  return (
    <section id="about" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto blur-panel">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="section-heading"
        >
          About Me
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4 text-slate leading-relaxed"
        >
          <p>
            I enjoy solving challenging problems and understanding systems in depth. In
            2022, I encountered a logic puzzle —{' '}
            <a
              href="https://www.youtube.com/watch?v=ufrNfkDNiMQ&t=12s"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline hover:scale-105 inline-block transition-transform duration-200"
            >
              lily pad problem
            </a>{' '}
            — that shifted my perspective. It wasn't just about finding the answer but
            recognizing deeper patterns and underlying logic. That moment made me
            realize that I thrive on analytical thinking and problem-solving.
          </p>

          <p>
            Wallace Wattles wrote that everyone has a suited line of work — something
            that aligns with their natural talents and way of thinking. For me, that is
            software development. It's a field where logic, creativity, and structured
            problem-solving come together, allowing me to break down complexity,
            optimize systems, and refine solutions. The more I code, the more I know
            I'm in the right place.
          </p>

          <p>Here are a few technologies I've been working with recently:</p>

          <ul className="grid grid-cols-2 gap-2 mt-4 max-w-md">
            {skills.map((skill) => (
              <li
                key={skill}
                className="flex items-center gap-2 text-sm font-mono text-slate"
              >
                <span className="text-accent text-xs">▹</span>
                {skill}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
