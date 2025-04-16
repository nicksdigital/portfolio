import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Award, Briefcase } from 'lucide-react';

const experiences = [
  {
    title: "Inventor & Lead Architect",
    company: "HYDRA AMM Protocol",
    period: "2022 - Present",
    description: "Created a breakthrough automated market maker protocol with adaptive liquidity curves that minimize slippage in volatile markets. The protocol combines sigmoid, gaussian, and rational functions to achieve 130% capital efficiency.",
    achievements: [
      "Designed advanced mathematical model for optimal liquidity distribution",
      "Implemented dynamic parameter adjustment for varying market conditions",
      "Created comprehensive technical documentation and economic models"
    ]
  },
  {
    title: "Chief Executive Officer",
    company: "TheAxiomverse",
    period: "2020 - Present",
    description: "Leading a FinTech innovation lab pioneering decentralized financial tools that bridge traditional finance with Web3 technologies.",
    achievements: [
      "Established strategic vision and market positioning",
      "Built cross-functional team of developers, economists, and designers",
      "Developed roadmap for suite of decentralized financial products"
    ]
  },
  {
    title: "Chief Technology Officer",
    company: "D4L",
    period: "2021 - Present",
    description: "Building a next-generation decentralized exchange focused on security and seamless cross-chain trading with advanced features for trading and liquidity provision.",
    achievements: [
      "Architected secure, scalable exchange infrastructure",
      "Implementing advanced liquidity pools with HYDRA technology",
      "Designing cross-chain bridges with quantum-resistant security"
    ]
  },
  {
    title: "Chief Technology Officer",
    company: "Genovatix",
    period: "2017 - Present",
    description: "Leading AI and blockchain solutions development focused on enhancing global safety. Building quantum-resistant systems, cryptographic protocols, and distributed computing architectures.",
    achievements: [
      "Designed and implemented cryptographic protocols for secure communication",
      "Authored several research papers on quantum-safe cryptography and distributed systems",
      "Built and mentored high-performing engineering teams focusing on cutting-edge technologies"
    ]
  },
  {
    title: "Chief Technology Officer & Lead Engineer",
    company: "Sportpat",
    period: "2018 - 2024",
    description: "Led technical strategy and implementation for e-commerce systems, integrating advanced POS solutions with Magento 2.",
    achievements: [
      "Drove sales increase of over 150% CAGR over 3 years",
      "Implemented A/B testing methodologies resulting in 10% conversion improvement"
    ]
  },
  {
    title: "Chief Executive Officer & Co-founder",
    company: "Kryptopy",
    period: "2017 - 2018",
    description: "Created and launched a blockchain-based platform combining social media and financial trading. Defined product vision, strategy, and roadmap.",
    achievements: [
      "Nominated for Blockchain Company of the Year at the Canadian FinTech Awards",
      "Built and led a team of 10 professionals to develop and launch the platform"
    ]
  },
  {
    title: "Lead Product Architect",
    company: "Confidential Blockchain Project",
    period: "2019 - 2020",
    description: "Defined product strategy and roadmap for a Binance chain-based charitable cryptocurrency.",
    achievements: [
      "Raised $1.7 million in the first week, exceeding targets by 70%",
      "Designed tokenomics and distribution model for long-term sustainability"
    ]
  },
  {
    title: "Project Lead",
    company: "Molson Coors",
    period: "2009 - 2010",
    description: "Led a $25M project to restructure a nationwide intranet, collaborating with C-level stakeholders.",
    achievements: [
      "Managed a multidisciplinary team, ensuring efficient execution",
      "Delivered a pilot project that established foundation for scalable solution"
    ]
  },
  {
    title: "Chief Executive Officer & Founder",
    company: "Simusoft3D Productions",
    period: "1998 - 2004",
    description: "Founded a game development studio featured in Electronic Gaming Monthly. Developed multiple successful game titles across platforms.",
    achievements: [
      "Featured as centerfold in Electronic Gaming Monthly (2003)",
      "Contributed to titles like Watch Dogs 2, Kohan: Immortal Sovereign, and more",
      "Semi-finalist in the BIG BANG Business Plan Competition at Davis University (2003)"
    ]
  }
];

export default function Experience() {
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
    <section id="experience" className="py-24 relative overflow-hidden bg-luxury-gray/20">
      <div className="absolute inset-0 radial-gradient-bg pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="inline-block text-sm font-medium bg-luxury-accent/20 text-luxury-accent px-3 py-1 rounded-sm mb-4">
              Experience
            </h2>
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Professional Journey
            </h3>
            <p className="text-lg text-luxury-silver max-w-3xl mx-auto">
              Over 25 years of building innovative technologies and leading high-performance teams,
              from gaming and web development to cutting-edge blockchain and decentralized finance.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="space-y-12"
          >
            {experiences.map((experience, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glass-card rounded-md p-8 relative"
              >
                {/* Timeline connector */}
                {index < experiences.length - 1 && (
                  <div className="absolute left-8 bottom-0 w-0.5 h-12 bg-luxury-accent/20 -mb-12 z-0" />
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0 w-full md:w-64">
                    <div className="flex items-center gap-2 text-luxury-accent mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{experience.period}</span>
                    </div>
                    <h4 className="text-xl font-display font-semibold">{experience.title}</h4>
                    <p className="text-luxury-silver font-medium">{experience.company}</p>
                  </div>

                  <div className="flex-grow">
                    <p className="text-luxury-silver mb-4">
                      {experience.description}
                    </p>

                    <h5 className="text-sm font-medium text-luxury-accent mb-3">Key Achievements</h5>
                    <ul className="space-y-2">
                      {experience.achievements.map((achievement, achieveIndex) => (
                        <li key={achieveIndex} className="flex items-start gap-2">
                          <Award className="w-5 h-5 text-luxury-accent flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-luxury-silver">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-16 text-center"
          >
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-luxury-accent text-luxury-accent hover:bg-luxury-accent/10 font-medium rounded-sm transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Download Full Resume</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}