// src/pages/Projects/Projects.jsx
// ─────────────────────────────────────────────────────────────────────────────
// LIST VIEW ONLY — the <Outlet /> branch renders isolated mini-apps untouched.
// DO NOT modify anything inside src/pages/Projects/[ProjectName]/.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardBody, Chip } from '@heroui/react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  PlaneTakeoff, CheckSquare, FileQuestion,
  Gamepad2, Calculator, ExternalLink,
} from 'lucide-react';
import TiltCard from '../../components/TiltCard/TiltCard';

// ── Asymmetrical Bento grid placement ────────────────────────────────────────
// CSS Grid auto-placement fills the 3-column layout with no manual grid-area:
//
//   lg (3 cols, gridAutoRows: minmax(240px,auto)):
//   ┌──────────────────────┬──────────────┐
//   │  Multiplication Mania │ FlightTracker│  row 1
//   │  col 1-2 · row 1-2   ├──────────────┤
//   │                       │     Exam     │  row 2
//   ├──────────────┬─────────┴──────────────┤
//   │   TodoList   │        Hangman          │  row 3
//   └──────────────┴─────────────────────────┘
//
//   sm (2 cols): Mania spans both cols; rest stack 2-up.
//   mobile:      single column stack.

const GRID_CLASSES = {
  'multiplication-mania': 'sm:col-span-2 lg:col-span-2 lg:row-span-2',
  'flight-tracker':       '',
  'exam':                 '',
  'todolist':             '',
  'hangman':              'lg:col-span-2',
};

// ── Framer Motion variants ────────────────────────────────────────────────────
const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0, 0.2, 1] } },
};

// ── Projects ─────────────────────────────────────────────────────────────────
const Projects = () => {
  const location = useLocation();
  const { t }    = useTranslation();

  const isListView = location.pathname === '/projects';

  const projectList = [
    {
      id:          'multiplication-mania',
      title:       t('projects.multiplicationMania'),
      desc:        t('projects.multiplicationManiaDesc'),
      tech:        ['React 19', 'Tailwind v4', 'Zustand', 'Framer Motion', 'use-sound'],
      isFeatured:  true,
      icon:        Calculator,
      accentColor: 'from-amber-500/20 to-yellow-500/5',
      externalUrl: 'https://akilkati.yilmaz.website/',
    },
    {
      id:          'flight-tracker',
      title:       t('projects.flightTracker'),
      desc:        t('projects.flightTrackerDesc'),
      tech:        ['React', 'Leaflet.js', 'API', 'Lucide'],
      icon:        PlaneTakeoff,
      accentColor: 'from-[var(--color-accent)]/20 to-[var(--color-accent-2)]/5',
    },
    {
      id:          'exam',
      title:       t('projects.exam'),
      desc:        t('projects.examDesc'),
      tech:        ['React', 'Validation'],
      icon:        FileQuestion,
      accentColor: 'from-[var(--color-accent-2)]/20 to-[var(--color-accent)]/5',
    },
    {
      id:          'todolist',
      title:       t('projects.todolist'),
      desc:        t('projects.todolistDesc'),
      tech:        ['Local Storage', 'React'],
      icon:        CheckSquare,
      accentColor: 'from-emerald-500/20 to-teal-500/5',
    },
    {
      id:          'hangman',
      title:       t('projects.hangman'),
      desc:        t('projects.hangmanDesc'),
      tech:        ['JavaScript', 'CSS Animation'],
      icon:        Gamepad2,
      accentColor: 'from-orange-500/20 to-red-500/5',
    },
  ];

  return (
    <div data-comp="Projects" className="mx-auto w-full px-6 sm:px-8 md:px-10 lg:px-12 pb-12 max-w-7xl">
      {isListView ? (
        <>
          {/* ── Page header ── */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0, 0.2, 1] }}
            className="text-center mb-14 pt-14 flex flex-col gap-4 items-center"
          >
            <h1
              className="text-5xl md:text-7xl font-bold tracking-tight pb-1"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t('projects.titlePart1')}{' '}
              <span className="bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] bg-clip-text text-transparent">
                {t('projects.titlePart2')}
              </span>
            </h1>
            <p
              className="text-lg md:text-xl max-w-2xl mx-auto italic font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {t('projects.subtitle', 'Engineered Solutions & Interactive Experiences')}
            </p>
          </motion.header>

          {/* ── Asymmetrical Bento Grid ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
            style={{ gridAutoRows: 'minmax(240px, auto)' }}
          >
            {projectList.map((project) => {
              const Icon = project.icon;

              return (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className={`${GRID_CLASSES[project.id]} min-h-0`}
                >
                  {/*
                    TiltCard wraps the Card in a 3D perspective tilt.
                    The Card itself keeps its group-hover classes so all
                    child hover effects (text colour, glow, chip colour) still fire.
                  */}
                  <TiltCard>
                    <Card
                      {...(project.externalUrl
                        ? { as: 'a', href: project.externalUrl, target: '_blank', rel: 'noopener noreferrer' }
                        : { as: RouterLink, to: project.id }
                      )}
                      className="group relative h-full flex flex-col overflow-hidden
                                 backdrop-blur-xl border transition-colors duration-500
                                 shadow-lg hover:shadow-2xl"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor:     'var(--color-border-subtle)',
                        // Border brightens on hover via a CSS variable — no Tailwind opacity modifier needed
                        '--hover-border': 'var(--color-border)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; }}
                    >
                      {/* Per-card tinted glow that bleeds in on hover */}
                      <div
                        className={`absolute inset-0 bg-linear-to-br ${project.accentColor}
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      />

                      {/* Oversized decorative background icon */}
                      <Icon
                        className="absolute -right-6 -bottom-6 w-36 h-36
                                   text-white/[0.04] group-hover:text-white/[0.08]
                                   group-hover:scale-110 group-hover:-rotate-12
                                   transition-all duration-500"
                      />

                      <CardHeader className="px-6 pt-6 flex-col items-start relative z-10">
                        {/* Featured badge */}
                        {project.isFeatured && (
                          <div className="mb-3">
                            <Chip
                              size="sm"
                              variant="flat"
                              className="font-semibold tracking-wide border"
                              style={{
                                backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
                                color:           'var(--color-accent)',
                                borderColor:     'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                              }}
                            >
                              {t('projects.featured', { defaultValue: 'Featured' })}
                            </Chip>
                          </div>
                        )}

                        <div className="flex items-center gap-3 w-full">
                          <Icon
                            className="w-6 h-6 flex-shrink-0 transition-colors duration-300
                                       group-hover:text-[var(--color-accent)]"
                            style={{ color: 'var(--color-text-muted)' }}
                          />
                          <h3
                            className="text-xl lg:text-2xl font-bold transition-colors duration-300
                                       group-hover:text-[var(--color-accent)]"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {project.title}
                          </h3>
                          {/* External link indicator — visible only on projects that open a new tab */}
                          {project.externalUrl && (
                            <ExternalLink
                              className="w-4 h-4 flex-shrink-0 ml-auto transition-opacity duration-300
                                         opacity-30 group-hover:opacity-70"
                              style={{ color: 'var(--color-accent)' }}
                            />
                          )}
                        </div>
                      </CardHeader>

                      <CardBody className="px-6 pb-6 pt-3 flex-1 flex flex-col relative z-10">
                        <p
                          className="text-sm md:text-base leading-relaxed mb-5 flex-1
                                     transition-colors duration-300
                                     group-hover:text-[var(--color-text-secondary)]"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {project.desc}
                        </p>

                        {/* Tech stack chips */}
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {project.tech.map((tag) => (
                            <Chip
                              key={tag}
                              size="sm"
                              variant="flat"
                              className="border transition-all duration-300 px-3
                                         group-hover:text-[var(--color-accent-2)]
                                         group-hover:bg-[var(--color-surface-hover)]
                                         group-hover:border-[var(--color-border)]"
                              style={{
                                backgroundColor: 'var(--color-bg-surface)',
                                borderColor:     'var(--color-border-subtle)',
                                color:           'var(--color-text-secondary)',
                              }}
                            >
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </TiltCard>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      ) : (
        // ── Sub-route outlet — renders isolated mini-apps (DO NOT TOUCH) ──
        <Outlet />
      )}
    </div>
  );
};

export default Projects;
