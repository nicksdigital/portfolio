import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const expertiseCategories = [
  {
    title: "Protocol Design",
    skills: [
      { name: "AMM Curve Optimization", proficiency: 95 },
      { name: "Mathematical Modeling", proficiency: 90 },
      { name: "Liquidity Management", proficiency: 85 },
      { name: "Quantum-Resistant Cryptography", proficiency: 90 },
    ],
  },
  {
    title: "Blockchain Development",
    skills: [
      { name: "Solidity (0.8.x)", proficiency: 95 },
      { name: "EVM Architecture", proficiency: 90 },
      { name: "Gas Optimization", proficiency: 85 },
      { name: "Layer-2 Solutions", proficiency: 90 },
    ],
  },
  {
    title: "Cryptographic Systems",
    skills: [
      { name: "Zero-Knowledge Proofs", proficiency: 90 },
      { name: "Post-Quantum Algorithms", proficiency: 88 },
      { name: "Falcon/Dilithium", proficiency: 85 },
      { name: "Kyber KEM", proficiency: 85 },
    ],
  },
  {
    title: "Product Architecture",
    skills: [
      { name: "System Design", proficiency: 95 },
      { name: "Technical Leadership", proficiency: 90 },
      { name: "Product Strategy", proficiency: 85 },
      { name: "Agile Methodologies", proficiency: 90 },
    ],
  },
];

const technicalSkills = [
  {
    category: "Blockchain & Web3",
    skills: ["Solidity", "Layer-2 technologies", "Cross-chain technologies", "web3.js/ethers.js", "Hardhat", "OpenZeppelin", "GNOSIS Safe", "Contract Security"]
  },
  {
    category: "Programming Languages",
    skills: ["Go", "Python", "TypeScript", "C++", "C#", "Node.js"]
  },
  {
    category: "Frameworks & Libraries",
    skills: ["React/Next.js", "Vue/Nuxt", "Unity", "libp2p", "liboqs", "OpenSSL", "WolfSSL"]
  },
  {
    category: "Product & Management",
    skills: ["Technical Documentation", "Project Management", "Stakeholder Reporting", "Risk Management", "Business Development", "Proposal Development"]
  }
];

export default function Expertise() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="expertise" className="py-24 relative overflow-hidden bg-luxury-gray/30">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-luxury-accent/30 to-transparent" />
      <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-luxury-accent/30 to-transparent" />

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
              Expertise
            </h2>
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Specialized Skill Set
            </h3>
            <p className="text-lg text-luxury-silver max-w-3xl mx-auto">
              My technical expertise spans across cutting-edge blockchain technologies,
              cryptographic systems, and product architecture with a focus on security and performance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {expertiseCategories.map((category, categoryIndex) => (
              <motion.div 
                key={categoryIndex}
                variants={itemVariants}
                className="glass-card p-8 rounded-md"
              >
                <h4 className="text-xl font-display font-semibold mb-6 text-luxury-accent">
                  {category.title}
                </h4>

                <div className="space-y-6">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.div 
                      key={skillIndex}
                      variants={itemVariants}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{skill.name}</span>
                        <span className="text-sm text-luxury-silver">{skill.proficiency}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-luxury-gray rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-luxury-accent rounded-full"
                          initial={{ width: 0 }}
                          animate={inView ? { width: `${skill.proficiency}%` } : { width: 0 }}
                          transition={{ duration: 1, delay: 0.2 + (skillIndex * 0.1) }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            variants={itemVariants}
            className="mt-16"
          >
            <div className="glass-card p-8 rounded-md">
              <h4 className="text-xl font-display font-semibold mb-6 text-center">Technical Expertise</h4>
              
              <div className="grid md:grid-cols-2 gap-8">
                {technicalSkills.map((category, catIndex) => (
                  <div key={catIndex} className="space-y-4">
                    <h5 className="text-lg font-medium text-luxury-accent">{category.category}</h5>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex}
                          className="px-3 py-1 text-sm bg-luxury-gray/50 text-luxury-silver rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}