'use client';
import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/ui/Hero';
import About from '@/components/ui/About';
import Experience from '@/components/ui/Experience';
import Expertise from '@/components/ui/Expertise';
import Projects from '@/components/ui/Projects';
import Research from '@/components/ui/Research';
import Articles from '@/components/ui/Articles';
import Contact from '@/components/ui/Contact';
import Footer from '@/components/ui/Footer';

interface PageProps {
  params: {
    locale: string;
  };
}

export default  function Home({ params }: PageProps) {
  // params.locale is available for language-specific customization
 
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Expertise />
      <Projects />
      <Research />
      <Articles />
      <Contact />
      <Footer />
    </main>
  );
}