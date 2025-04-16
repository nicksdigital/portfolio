import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Github, Twitter, Linkedin, Send } from 'lucide-react';

export default function Contact() {
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
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-luxury-accent/30 to-transparent" />
      <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-luxury-accent/30 to-transparent" />
      <div className="absolute left-0 top-1/4 w-72 h-72 bg-luxury-accent/10 rounded-full filter blur-3xl opacity-30" />
      <div className="absolute right-0 bottom-1/4 w-72 h-72 bg-luxury-accent/10 rounded-full filter blur-3xl opacity-30" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="inline-block text-sm font-medium bg-luxury-accent/20 text-luxury-accent px-3 py-1 rounded-sm mb-4">
              Get In Touch
            </h2>
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Let&apos;s Build Something Extraordinary
            </h3>
            <p className="text-lg text-luxury-silver max-w-3xl mx-auto">
              Interested in collaborating on innovative blockchain projects?
              I&apos;m open to consulting opportunities, research collaborations, and technical leadership roles.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-8">
            <motion.div
              variants={itemVariants}
              className="md:col-span-2 glass-card p-8 rounded-md"
            >
              <h4 className="text-xl font-display font-semibold mb-6">Connect With Me</h4>

              <div className="space-y-6">
                <a
                  href="mailto:nicolas.cloutier78@gmail.com"
                  className="flex items-center gap-4 text-luxury-silver hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-luxury-gray flex items-center justify-center group-hover:bg-luxury-accent/20 transition-colors">
                    <Mail className="w-5 h-5 text-luxury-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Email</p>
                    <p className="text-sm">nicolas.cloutier78@gmail.com</p>
                  </div>
                </a>

                <a
                  href="https://github.com/nicknailers69"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-luxury-silver hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-luxury-gray flex items-center justify-center group-hover:bg-luxury-accent/20 transition-colors">
                    <Github className="w-5 h-5 text-luxury-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-white">GitHub</p>
                    <p className="text-sm">github.com/nicknailers69</p>
                  </div>
                </a>

                <a
                  href="https://twitter.com/nic_blockchain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-luxury-silver hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-luxury-gray flex items-center justify-center group-hover:bg-luxury-accent/20 transition-colors">
                    <Twitter className="w-5 h-5 text-luxury-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Twitter</p>
                    <p className="text-sm">@nic_blockchain</p>
                  </div>
                </a>

                <a
                  href="https://linkedin.com/in/nicolascloutier1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-luxury-silver hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-luxury-gray flex items-center justify-center group-hover:bg-luxury-accent/20 transition-colors">
                    <Linkedin className="w-5 h-5 text-luxury-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-white">LinkedIn</p>
                    <p className="text-sm">linkedin.com/in/nicolascloutier1</p>
                  </div>
                </a>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="md:col-span-3 glass-card p-8 rounded-md"
            >
              <h4 className="text-xl font-display font-semibold mb-6">Send Me a Message</h4>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm text-luxury-silver block">Name</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full bg-luxury-gray/50 border border-luxury-silver/20 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-luxury-accent/50 transition-colors"
                      placeholder="Your Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm text-luxury-silver block">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full bg-luxury-gray/50 border border-luxury-silver/20 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-luxury-accent/50 transition-colors"
                      placeholder="Your Email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm text-luxury-silver block">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full bg-luxury-gray/50 border border-luxury-silver/20 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-luxury-accent/50 transition-colors"
                    placeholder="Subject"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm text-luxury-silver block">Message</label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full bg-luxury-gray/50 border border-luxury-silver/20 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-luxury-accent/50 transition-colors"
                    placeholder="Your Message"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 bg-luxury-accent text-luxury-black px-6 py-3 rounded-sm font-medium hover:bg-luxury-accent/90 transition-colors"
                >
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}