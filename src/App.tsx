import { useState, useEffect } from 'react';
import CursorGlow from './components/CursorGlow';
import FluidSimulation from './components/FluidSimulation';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import FeaturedProjects from './components/FeaturedProjects';
import Books from './components/Books';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AudioPlayer from './components/AudioPlayer';
import Loader from './components/Loader';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader onFinish={() => setIsLoading(false)} />;
  }

  return (
    <>
      <FluidSimulation />
      <div className="relative z-[1]">
      <CursorGlow />
      <Navbar />
      <main className="counter-reset" style={{ counterReset: 'section' }}>
        <Hero />
        <About />
        <Experience />
        <FeaturedProjects />
        <Books />
        <Contact />
      </main>
      <Footer />
      <AudioPlayer />
      </div>
    </>
  );
}

export default App;
