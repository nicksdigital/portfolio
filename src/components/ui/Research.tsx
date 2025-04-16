import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FileText, Download } from 'lucide-react';
import { Link } from '@/navigation';

const papers = [
  {
    title: "Address Generation with Geolocation-Verified Zero-Knowledge Proofs Using Cryptographic Hashing and Quantum-Safe Techniques",
    abstract: "This paper presents an address generation system leveraging geolocation data verification through Zero-Knowledge Proofs (ZKPs) to validate the location without compromising privacy.",
    date: "2024",
    publication: "Under Review",
    keywords: ["Geolocation", "Blake3", "Cryptography", "Quantum Zero-Knowledge Proof", "Probabilistic Encoding"],
    url: "#"
  },
  {
    title: "Quantum Zero-Knowledge Proof (Quantum-ZKP) and Its Applications in Secure Distributed Systems",
    abstract: "This paper introduces Quantum Zero-Knowledge Proof (Quantum-ZKP), a quantum-inspired protocol designed to enhance the security and scalability of zero-knowledge proofs in distributed systems.",
    date: "2024",
    publication: "Accepted",
    keywords: ["Quantum Zero-Knowledge Proof", "Probabilistic Encoding", "Logical Entanglement", "Distributed Consensus"],
    url: "#"
  },
  {
    title: "Layered Matrix and Vector System for Secure, Scalable Distributed Computation",
    abstract: "This paper introduces a Layered Matrix and Vector System for managing secure, multi-dimensional data structures in distributed systems.",
    date: "2023",
    publication: "Published",
    keywords: ["Distributed Systems", "Matrix Computation", "Security", "Fault Tolerance", "Mathematical Modeling"],
    url: "#"
  },
  {
    title: "HYDRA: A Hybrid Dynamic Reactive Automation Curve for Automated Market Makers",
    abstract: "This paper introduces HYDRA (HYbrid Dynamic Reactive Automation), a novel automated market maker (AMM) curve that combines sigmoid, gaussian, and rational functions to optimize liquidity distribution and market adaptability.",
    date: "2023",
    publication: "Published",
    keywords: ["AMM", "DeFi", "Mathematical Modeling", "Liquidity Optimization", "Curve Design"],
    url: "#"
  }
];

export default function Research() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section id="research" className="py-24 relative bg-luxury-gray/20">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="inline-block text-sm font-medium bg-luxury-accent/20 text-luxury-accent px-3 py-1 rounded-sm mb-4">
              Research
            </h2>
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Academic Publications
            </h3>
            <p className="text-lg text-luxury-silver max-w-3xl mx-auto">
              My research contributions to the fields of cryptography, distributed systems, and decentralized finance.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="space-y-8"
          >
            {papers.map((paper, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glass-card p-6 rounded-md transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,194,255,0.15)]"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0 p-4 bg-luxury-accent/10 rounded-md hidden md:block">
                    <FileText className="w-10 h-10 text-luxury-accent" />
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-luxury-silver">{paper.date}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        paper.publication === "Published"
                          ? "bg-green-950 text-green-400"
                          : paper.publication === "Accepted"
                            ? "bg-blue-950 text-blue-400"
                            : "bg-amber-950 text-amber-400"
                      }`}>
                        {paper.publication}
                      </span>
                    </div>

                    <h4 className="text-xl font-display font-semibold mb-3">{paper.title}</h4>
                    <p className="text-luxury-silver text-sm mb-4">{paper.abstract}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {paper.keywords.map((keyword, keywordIndex) => (
                        <span
                          key={keywordIndex}
                          className="text-xs px-2 py-1 rounded bg-luxury-gray text-luxury-silver"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={paper.url}
                      className="inline-flex items-center gap-2 text-sm text-luxury-accent hover:text-luxury-accent/80 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Paper</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}