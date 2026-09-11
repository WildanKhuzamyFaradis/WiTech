import React, { useState } from 'react';
import { ChevronDown, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { faqs } from '../lib/data';
import { Link } from 'react-router';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background font-sans pt-32 pb-24 overflow-hidden">
      
      {/* ── HEADER ───────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-6 mb-16 relative">
        <div className="absolute top-0 left-10 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border bg-muted text-xs font-bold uppercase tracking-widest mb-6 neo-shadow-sm mx-auto">
            <MessageCircle size={16} className="text-primary" strokeWidth={2.5} />
            FAQ
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6">
            Pertanyaan yang <br />
            <span className="text-primary">Sering Ditanya</span>
          </h1>
          <p className="text-xl font-medium text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Masih ragu buat join Witech? Cek dulu nih beberapa pertanyaan yang sering banget ditanyain. Spoiler: kamu nggak harus anak IT buat ikutan kok!
          </p>
        </div>
      </section>

      {/* ── ACCORDION ────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 mb-20">
        <div className="space-y-4">
          {faqs.map((faq: any, index: number) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className={`neo-card rounded-2xl overflow-hidden transition-all duration-300 bg-white ${
                  isOpen ? 'neo-shadow-md ring-2 ring-primary/20' : 'neo-shadow-sm hover:neo-shadow-md'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none group"
                >
                  <div className="flex items-start gap-4 pr-4">
                    <span className={`shrink-0 size-8 rounded-lg flex items-center justify-center font-black text-sm border-2 transition-colors ${
                      isOpen ? 'bg-primary text-white border-primary' : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      {index + 1}
                    </span>
                    <h3 className={`font-bold text-lg tracking-tight transition-colors ${
                      isOpen ? 'text-primary' : 'text-foreground group-hover:text-primary'
                    }`}>
                      {faq.question}
                    </h3>
                  </div>
                  <div className={`shrink-0 size-8 rounded-lg border-2 border-border flex items-center justify-center transition-all ${
                    isOpen ? 'bg-primary text-white border-primary rotate-180' : 'bg-muted text-foreground'
                  }`}>
                    <ChevronDown size={18} strokeWidth={3} />
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 md:px-8 pb-6 md:pb-8 ml-12">
                    <div className="border-t-2 border-border/10 pt-4">
                      <p className="text-base font-medium text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6">
        <div className="text-center bg-foreground text-background p-12 md:p-16 rounded-[2rem] border-2 border-border neo-shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="size-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles size={32} className="text-accent" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight text-white">Masih bingung?</h2>
            <p className="text-lg font-medium mb-8 text-background/80 max-w-md mx-auto">
              Santai aja, tanya langsung ke pengurus Witech. Kita siap bantu jawab kegalauanmu!
            </p>
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white border-2 border-border rounded-2xl font-black text-lg neo-shadow-sm hover:-translate-y-2 hover:neo-shadow-md transition-all"
            >
              Hubungi Kita <ArrowRight size={20} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
