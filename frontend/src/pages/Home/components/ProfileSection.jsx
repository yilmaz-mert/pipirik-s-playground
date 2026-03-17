// src/pages/Home/components/ProfileSection.jsx
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import mertProfile from "../../../assets/mert-profile.webp";

export default function ProfileSection() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      data-comp="ProfileSection"
      className="flex justify-center lg:justify-end"
    >
      <div className="relative w-36 h-36 md:w-104 md:h-104 group">

        {/* Ambient glow — accent gradient */}
        <div
          className="hidden md:block absolute inset-0 opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity duration-700 bg-linear-to-tr"
          style={{
            backgroundImage: 'linear-gradient(to top right, var(--color-accent), var(--color-accent-2))',
          }}
        />

        {/* Morphing image container — needs opaque bg so backdrop doesn't bleed through */}
        <div
          className="relative w-full h-full border-2 overflow-hidden transition-all duration-1000 ease-in-out group-hover:scale-[1.02] shadow-2xl animate-morph"
          style={{
            backgroundColor: 'var(--color-bg-card-solid)',
            borderColor:     'var(--color-border-subtle)',
          }}
        >
          <img
            src={mertProfile}
            alt="Mert's Profile"
            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
          />
          {/* Bottom fade — blends image into the page background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, var(--color-image-overlay), transparent)',
            }}
          />
        </div>

        {/* Status badge */}
        <div
          className="absolute -bottom-2 -right-2 backdrop-blur-xl p-4 rounded-2xl hidden md:flex items-center gap-3 shadow-2xl animate-bounce-slow border"
          style={{
            backgroundColor: 'var(--color-bg-overlay)',
            borderColor:     'var(--color-border)',
          }}
        >
          <div className="flex flex-col">
            <span
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Status
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Developing... 🚀
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
