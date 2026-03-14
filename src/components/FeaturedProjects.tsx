import { motion } from 'framer-motion';
import { Github, ExternalLink } from 'lucide-react';
import { featuredProjects } from '../data/content';

export default function FeaturedProjects() {
  return (
    <section id="projects" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto blur-panel">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="section-heading"
        >
          Projects
        </motion.h2>

        <div className="space-y-24">
          {featuredProjects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`relative grid md:grid-cols-12 gap-4 items-center ${
                i % 2 !== 0 ? 'md:text-right' : ''
              }`}
            >
              {/* Project image */}
              <div
                className={`md:col-span-7 md:row-start-1 relative group rounded-xl overflow-hidden ${
                  i % 2 !== 0 ? 'md:col-start-1' : 'md:col-start-6'
                }`}
              >
                <a
                  href={project.github || project.external || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-[300px] object-cover transition-all duration-500 group-hover:scale-105 opacity-60 group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-accent/10 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0" />
                  </div>
                </a>
              </div>

              {/* Project content */}
              <div
                className={`md:col-span-7 md:row-start-1 relative z-10 ${
                  i % 2 !== 0 ? 'md:col-start-6 md:text-right' : 'md:col-start-1'
                }`}
              >
                <p className="text-accent font-mono text-sm mb-2">Featured Project</p>
                <h3 className="text-2xl font-bold text-lightest-slate mb-4">
                  {project.title}
                </h3>

                <div className="glass-card p-6 mb-4 text-slate text-sm leading-relaxed">
                  {project.description}
                </div>

                <ul
                  className={`flex flex-wrap gap-3 mb-4 font-mono text-xs text-light-slate ${
                    i % 2 !== 0 ? 'md:justify-end' : ''
                  }`}
                >
                  {project.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>

                <div
                  className={`flex gap-4 ${
                    i % 2 !== 0 ? 'md:justify-end' : ''
                  }`}
                >
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lightest-slate hover:text-accent transition-all duration-200 hover:scale-110"
                      aria-label="GitHub"
                    >
                      <Github size={20} />
                    </a>
                  )}
                  {project.external && (
                    <a
                      href={project.external}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lightest-slate hover:text-accent transition-all duration-200 hover:scale-110"
                      aria-label="External Link"
                    >
                      <ExternalLink size={20} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
