// src/pages/Home.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Button, Chip } from "@heroui/react";
import mertProfile from "../assets/mert-profile.webp";

const Home = () => {
  const { t } = useTranslation();
  const skills = t('home.skills', { returnObjects: true }) || [];

  return (
    // svh (Small Viewport Height) kullanarak Opera ve Safari alt barları için tam uyum sağlıyoruz
    <main className="relative z-10 flex items-center justify-center h-[calc(100svh-var(--navbar-height))] overflow-hidden">
      <div 
        className="mx-auto w-full px-6 sm:px-12 lg:px-16 max-w-325 h-full flex items-center"
        style={{ paddingTop: '0' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center w-full py-2">
          
          {/* Sol Taraf: Metin ve Bilgiler */}
          <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3 animate-appearance-in">
            <header className="space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-medium">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                {t('home.availableForWork', { defaultValue: 'Available for new opportunities' })}
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none">
                {t('home.heroTitle', { name: 'Mert' })}
              </h1>
              
              <h2 className="text-2xl md:text-4xl font-bold bg-linear-to-r from-[#38BDF8] to-[#818CF8] bg-clip-text text-transparent">
                {t('home.heroSubtitle')}
              </h2>
            </header>

            <p className="text-slate-400 text-base md:text-xl leading-snug max-w-xl font-medium">
              {t('home.specializedPrefix')}{' '}
              <span className="text-white font-semibold">{t('home.skill1')}</span>
              {' '}{t('home.and') || '&'}{' '}
              <span className="text-white font-semibold">{t('home.skill2')}</span>.
              <br className="hidden md:block" />
              <span className="opacity-80 italic"> Crafting digital experiences where performance meets aesthetics.</span>
            </p>

            {/* Yetenek Etiketleri - Mobilde daha kompakt görünüm için gap-1.5 */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 max-w-md" role="list">
              {skills.map((skill) => (
                <Chip
                  key={skill}
                  variant="flat"
                  className="border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors cursor-default px-4 h-8"
                >
                  {skill}
                </Chip>
              ))}
            </div>

            {/* Sosyal Medya Butonları */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
              <Button
                as="a"
                href="https://github.com/yilmaz-mert"
                target="_blank"
                isIconOnly
                variant="flat"
                size="lg"
                className="bg-white/5 border border-white/10 hover:border-[#38BDF8] text-slate-400 hover:text-[#38BDF8] transition-all h-14 w-14"
              >
                <FaGithub size={24} />
              </Button>
              <Button
                as="a"
                href="https://www.linkedin.com/in/yilmaz-mert/"
                target="_blank"
                isIconOnly
                variant="flat"
                size="lg"
                className="bg-white/5 border border-white/10 hover:border-[#818CF8] text-slate-400 hover:text-[#818CF8] transition-all h-14 w-14"
              >
                <FaLinkedin size={24} />
              </Button>
            </div>
          </div>

          {/* Sağ Taraf: Profil Fotoğrafı */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-44 h-44 md:w-105 md:h-105 group">
              {/* Performans için mobilde gizlenen, sadece masaüstünde çalışan parıltı efekti */}
              <div className="hidden md:block absolute inset-0 bg-linear-to-tr from-[#38BDF8] to-[#818CF8] opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity duration-700" />
              
              <div 
                className="relative w-full h-full border-2 border-white/10 bg-[#1e293b] overflow-hidden transition-all duration-1000 ease-in-out group-hover:scale-[1.02] shadow-2xl"
                style={{
                  borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                  animation: 'morph 8s ease-in-out infinite'
                }}
              >
                <img 
                  src={mertProfile} 
                  alt="Mert's Profile" 
                  fetchpriority="high" // LCP skoru için yüksek öncelik
                  loading="eager"      // Anında yükleme
                  width="420"          // CLS önlemek için genişlik
                  height="420"         // CLS önlemek için yükseklik
                  className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0f172a]/60 to-transparent" />
              </div>

              <div className="absolute -bottom-2 -right-2 bg-slate-900/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl hidden md:flex items-center gap-3 shadow-2xl animate-bounce-slow">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Status</span>
                  <span className="text-sm font-bold text-white">Developing... 🚀</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes morph {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
      `}} />
    </main>
  );
};

export default Home;