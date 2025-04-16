import { Link } from '@/navigation';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Footer() {
  const t = useTranslations('Navbar');
  const footerT = useTranslations('Footer');
  const locale = useLocale();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-luxury-silver/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <Link href="/" className="text-xl font-display font-bold mb-4 block">
              <span className="text-white">Nicolas</span>
              <span className="text-luxury-accent">Cloutier</span>
            </Link>
            <p className="text-luxury-silver mb-6 max-w-md">
              {locale === 'en' ?
                "Developer, builder, and blockchain visionary with 25+ years of experience creating innovative solutions that reshape industries." :
                "Développeur, constructeur et visionnaire blockchain avec plus de 25 ans d'expérience dans la création de solutions innovantes qui transforment les industries."
              }
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/nicolascloutier1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-luxury-silver hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com/in/nicolascloutier1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-luxury-silver hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://twitter.com/nicolascloutier"
                target="_blank"
                rel="noopener noreferrer"
                className="text-luxury-silver hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:contact@nicolascloutier.com"
                className="text-luxury-silver hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {locale === 'en' ? "Navigation" : "Navigation"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#about" className="text-luxury-silver hover:text-white transition-colors">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/#experience" className="text-luxury-silver hover:text-white transition-colors">
                  {t('experience')}
                </Link>
              </li>
              <li>
                <Link href="/#projects" className="text-luxury-silver hover:text-white transition-colors">
                  {t('projects')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-luxury-silver hover:text-white transition-colors">
                  {t('blog')}
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-luxury-silver hover:text-white transition-colors">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Language switcher */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {footerT('language')}
            </h4>
            <LanguageSwitcher />
          </div>
        </div>

        <div className="border-t border-luxury-silver/10 mt-12 pt-8 text-center text-luxury-silver text-sm">
          <p>{footerT('copyright', { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
}