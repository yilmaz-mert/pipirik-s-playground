// src/pages/Projects/Projects.jsx
import React from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardBody, Divider, Chip } from "@heroui/react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { PlaneTakeoff, CheckSquare, FileQuestion, Gamepad2 } from "lucide-react"; // İkonlar eklendi

const Projects = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  const isMainProjectsPage = location.pathname === '/projects';

  // Projelere ikonlar eklendi
  const projectList = [
    { 
      id: 'flight-tracker', 
      title: t('projects.flightTracker'), 
      desc: t('projects.flightTrackerDesc'),
      size: "lg:col-span-2", 
      tech: ["React", "Leaflet.js", "API", "Lucide"],
      isFeatured: true,
      icon: PlaneTakeoff,
      color: "from-cyan-500/20 to-blue-500/5"
    },
    { 
      id: 'exam', 
      title: t('projects.exam'), 
      desc: t('projects.examDesc'),
      size: "lg:col-span-1",
      tech: ["React", "Validation"],
      icon: FileQuestion,
      color: "from-purple-500/20 to-fuchsia-500/5"
    },
    { 
      id: 'todolist', 
      title: t('projects.todolist'), 
      desc: t('projects.todolistDesc'),
      size: "lg:col-span-1",
      tech: ["Local Storage", "React"],
      icon: CheckSquare,
      color: "from-emerald-500/20 to-teal-500/5"
    },
    { 
      id: 'hangman', 
      title: t('projects.hangman'), 
      desc: t('projects.hangmanDesc'),
      size: "lg:col-span-1",
      tech: ["JavaScript", "CSS Animation"],
      icon: Gamepad2,
      color: "from-orange-500/20 to-red-500/5"
    }
  ];

  // Framer Motion Ayarları
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="mx-auto w-full px-6 sm:px-8 md:px-10 lg:px-12 pb-12 max-w-7xl">
      {isMainProjectsPage ? (
          <>
            {/* Header Kısmı - Animasyonlu */}
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16 pt-16 flex flex-col gap-4 items-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white pb-1">
                {t('projects.titlePart1')}{" "}
                <span className="bg-linear-to-r from-[#38BDF8] to-[#818CF8] bg-clip-text text-transparent">
                  {t('projects.titlePart2')}
                </span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto italic font-medium">
                {t('projects.subtitle', 'Engineered Solutions & Interactive Experiences')}
              </p>
            </motion.header>
          
            {/* Bento Grid Yapısı */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch"
            >
              {projectList.map((project) => {
                const Icon = project.icon;
                
                return (
                  <motion.div key={project.id} variants={itemVariants} className={project.size}>
                    <Card 
                      as={RouterLink}
                      to={project.id}
                      className="group relative h-full flex flex-col overflow-hidden bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10"
                    >
                      {/* Kart İçi Arka Plan Efekti (Glow) */}
                      <div className={`absolute inset-0 bg-linear-to-br ${project.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      
                      {/* Dekoratif İkon (Arka planda büyük ve soluk) */}
                      <Icon className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 group-hover:text-white/10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500" />

                      <CardHeader className="px-6 pt-6 flex-col items-start relative z-10">
                        {project.isFeatured && (
                          <Chip 
                            size="sm" 
                            variant="flat" 
                            className="mb-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium tracking-wide"
                          >
                            {t('projects.featured', { defaultValue: 'Featured Project' })}
                          </Chip>
                        )}
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                          <h3 className="text-2xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                            {project.title}
                          </h3>
                        </div>
                      </CardHeader>

                      <CardBody className="px-6 pb-6 pt-4 flex-1 flex flex-col relative z-10">
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6 flex-1 group-hover:text-slate-300 transition-colors">
                          {project.desc}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-auto">
                          {project.tech.map((item) => (
                            <Chip 
                              key={item} 
                              size="sm" 
                              variant="flat" 
                              className="bg-white/5 text-slate-300 border border-white/5 group-hover:bg-cyan-500/10 group-hover:text-cyan-300 group-hover:border-cyan-500/20 transition-all duration-300 px-3"
                            >
                              {item}
                            </Chip>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
      ) : (
        <Outlet /> 
      )}
    </div>
  );
};

export default Projects;