import React from 'react';
import { Link } from 'react-router';
import { Camera, MessageCircle, Briefcase, GitFork, ChevronRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-foreground text-background border-t-2 border-border overflow-hidden font-sans">
      {/* Top subtle gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-secondary opacity-80" />
      
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Col */}
          <div className="md:col-span-12 lg:col-span-5">
            <Link to="/" className="flex items-center gap-2 group mb-6 inline-flex bg-white p-2 rounded-xl">
              <img src="/logo.png" alt="Witech Logo" className="h-10 w-auto group-hover:scale-105 transition-transform" />
            </Link>
            <p className="text-base font-medium text-background/70 max-w-sm mb-8 leading-relaxed">
              UKM Teknologi untuk semua jurusan! Belajar, berkarya, dan seru-seruan bareng teknologi sejak 2018.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Instagram" className="p-2.5 bg-background/10 text-background rounded-xl hover:bg-primary hover:text-white transition-colors">
                <Camera size={20} strokeWidth={2.5} />
              </a>
              <a href="#" aria-label="Twitter/X" className="p-2.5 bg-background/10 text-background rounded-xl hover:bg-secondary hover:text-foreground transition-colors">
                <MessageCircle size={20} strokeWidth={2.5} />
              </a>
              <a href="#" aria-label="LinkedIn" className="p-2.5 bg-background/10 text-background rounded-xl hover:bg-[#ffe66d] hover:text-foreground transition-colors">
                <Briefcase size={20} strokeWidth={2.5} />
              </a>
              <a href="#" aria-label="GitHub" className="p-2.5 bg-background/10 text-background rounded-xl hover:bg-white hover:text-foreground transition-colors">
                <GitFork size={20} strokeWidth={2.5} />
              </a>
            </div>
          </div>
          
          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Divisions */}
          <div className="md:col-span-6 lg:col-span-3">
            <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Divisi Witech
            </h3>
            <ul className="space-y-3 font-medium text-sm text-background/70">
              <li><Link to="/divisions" className="hover:text-white transition-colors flex items-center gap-1 group"><ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" /> Digital Literacy</Link></li>
              <li><Link to="/divisions" className="hover:text-white transition-colors flex items-center gap-1 group"><ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-secondary" /> Creative & Design</Link></li>
              <li><Link to="/divisions" className="hover:text-white transition-colors flex items-center gap-1 group"><ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#a855f7]" /> Web & App Dev</Link></li>
              <li><Link to="/divisions" className="hover:text-white transition-colors flex items-center gap-1 group"><ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#ffe66d]" /> Data & AI</Link></li>
              <li><Link to="/divisions" className="hover:text-white transition-colors flex items-center gap-1 group"><ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#10b981]" /> Cyber & Networking</Link></li>
              <li><Link to="/divisions" className="hover:text-white transition-colors flex items-center gap-1 group"><ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#f59e0b]" /> Hardware & IoT</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-6 lg:col-span-3">
            <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Menu Cepat
            </h3>
            <ul className="space-y-3 font-medium text-sm text-background/70">
              <li><Link to="/about" className="hover:text-white transition-colors">Tentang Witech</Link></li>
              <li><Link to="/portfolio" className="hover:text-white transition-colors">Portofolio Karya</Link></li>
              <li><Link to="/members" className="hover:text-white transition-colors">Anggota Witech</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Event & Jadwal</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Tanya Jawab (FAQ)</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Hubungi Kami</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm font-medium text-background/50">
          <p>&copy; {new Date().getFullYear()} Witech UKM. All rights reserved.</p>
          <p className="mt-4 md:mt-0 flex items-center gap-1">
            Built with <span className="text-primary">♥</span> and caffeine.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
