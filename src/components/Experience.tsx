import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jobs } from '../data/content';

export default function Experience() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="experience" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto blur-panel">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="section-heading"
        >
          Experience
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-6"
        >
          {/* Tab buttons */}
          <div className="flex flex-wrap md:flex-col overflow-visible border-b md:border-b-0 md:border-l border-lightest-navy shrink-0">
            {jobs.map((job, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-3 text-sm font-mono text-left whitespace-nowrap transition-all duration-300 border-b-2 md:border-b-0 md:border-l-2 -mb-px md:mb-0 md:-ml-px ${
                  activeTab === i
                    ? 'text-accent border-accent bg-accent/5'
                    : 'text-slate border-transparent hover:text-accent hover:bg-accent/5'
                }`}
              >
                {job.company}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="min-h-[320px] flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl text-lightest-slate font-medium">
                  {jobs[activeTab].title}
                  <span className="text-accent">
                    {' '}@{' '}
                    <a
                      href={jobs[activeTab].url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline hover:scale-105 inline-block transition-transform duration-200"
                    >
                      {jobs[activeTab].company}
                    </a>
                  </span>
                </h3>

                <p className="text-sm font-mono text-light-slate mt-1 mb-6">
                  {jobs[activeTab].range}
                </p>

                <ul className="space-y-3">
                  {jobs[activeTab].bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-slate text-sm leading-relaxed"
                    >
                      <span className="text-accent mt-1.5 shrink-0">▹</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
