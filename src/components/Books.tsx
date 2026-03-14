import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { books } from '../data/content';

export default function Books() {
  const [showAll, setShowAll] = useState(false);
  const GRID_LIMIT = 10;
  const booksToShow = showAll ? books : books.slice(0, GRID_LIMIT);

  return (
    <section id="books" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto blur-panel">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="section-heading"
        >
          My Favorite Books
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence>
            {booksToShow.map((book, i) => (
              <motion.a
                key={book.title}
                href={book.external}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative"
              >
                <div className="glass-card glow-border overflow-hidden rounded-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:shadow-accent/5">
                  <div className="aspect-[2/3] overflow-hidden">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-medium text-lightest-slate truncate">
                      {book.title}
                    </h3>
                    <p className="text-[10px] font-mono text-accent/70 mt-1">
                      {book.category}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>

        {books.length > GRID_LIMIT && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-12"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 border border-accent text-accent font-mono text-sm rounded-lg hover:bg-accent/10 transition-all duration-200 hover:scale-105"
            >
              Show {showAll ? 'Less' : 'More'}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
