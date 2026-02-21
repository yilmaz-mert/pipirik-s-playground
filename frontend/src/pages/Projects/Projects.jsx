import React from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardBody, Divider, Chip } from "@heroui/react";

const Projects = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  const isMainProjectsPage = location.pathname === '/projects';

  // Proje listesi ve Bento Grid için özel ayarlar
  // breakpointleri orta ekranlarda (768-1024) tek sütunda bozulmayı önleyecek şekilde lg'ye taşıyoruz
  const projectList = [
    { 
      id: 'flight-tracker', 
      title: t('projects.flightTracker'), 
      desc: t('projects.flightTrackerDesc'),
      size: "lg:col-span-2", // Bu projeyi öne çıkarıyoruz, sadece large ekranlarda genişlesin
      tech: ["React", "Leaflet.js", "API", "Lucide"],
      isFeatured: true
    },
    { 
      id: 'exam', 
      title: t('projects.exam'), 
      desc: t('projects.examDesc'),
      size: "lg:col-span-1",
      tech: ["React", "Validation"]
    },
    { 
      id: 'todolist', 
      title: t('projects.todolist'), 
      desc: t('projects.todolistDesc'),
      size: "lg:col-span-1",
      tech: ["Local Storage", "React"]
    },
    { 
      id: 'hangman', 
      title: t('projects.hangman'), 
      desc: t('projects.hangmanDesc'),
      size: "lg:col-span-1",
      tech: ["JavaScript", "CSS Animation"]
    }
  ];

  return (
    <div
      className="mx-auto w-full px-6 sm:px-8 md:px-10 lg:px-12 pb-8 max-w-300"

    >
      {isMainProjectsPage ? (
          <>
            {/* Header Kısmı */}
            <header className="text-center mb-12 pt-16 flex flex-col gap-6 items-center">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#F8FAFC] mb-4 pb-1">
                {t('projects.titlePart1')}{" "}
                <span className="bg-linear-to-r from-[#38BDF8] to-[#818CF8] bg-clip-text text-transparent">
                  {t('projects.titlePart2')}
                </span>
              </h1>
              <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto italic">
                {t('projects.subtitle', 'Engineered Solutions & Interactive Experiences')}
              </p>
            </header>
          
            {/* Bento Grid Yapısı */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {projectList.map((project) => (
                <Card 
                  key={project.id}
                  isPressable
                  as={RouterLink}
                  to={project.id}
                  className={`group transition-all duration-500 ${project.size} h-full flex flex-col`}
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <CardHeader className="px-6 pt-6 flex-col items-start">
                    {project.isFeatured && (
                      <Chip 
                        size="sm" 
                        variant="flat" 
                        color="primary" 
                        className="mb-2 border-white/10"
                        style={{ color: 'var(--accent)' }}
                      >
                        {t('projects.featured', { defaultValue: 'Featured Project' })}
                      </Chip>
                    )}
                    <h3 className="text-2xl font-bold text-[#F8FAFC] group-hover:text-(--accent) transition-colors">
                      {project.title}
                    </h3>
                  </CardHeader>

                  <CardBody className="px-6 pb-6 flex-1 flex flex-col">
                    <p className="text-(--muted) text-sm leading-relaxed mb-6 flex-1">
                      {project.desc}
                    </p>

                    {/* Teknoloji Etiketleri (Chips) */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.tech.map((item) => (
                        <Chip 
                          key={item} 
                          size="sm" 
                          variant="flat" 
                          className="text-[10px] font-mono inline-flex items-center justify-center"
                          style={{
                            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                            color: 'var(--accent)',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '9999px',
                            userSelect: 'none',
                            lineHeight: 1,
                            border: '1px solid rgba(255,255,255,0.04)',
                            transition: 'transform .12s ease, background .12s ease'
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {item}
                        </Chip>
                      ))}
                    </div>

                    <Divider className="bg-white/5 my-4" />
                  </CardBody>
                </Card>
              ))}
            </div>
          </>
      ) : (
        <Outlet /> 
      )}
    </div>
  );
};

export default Projects;