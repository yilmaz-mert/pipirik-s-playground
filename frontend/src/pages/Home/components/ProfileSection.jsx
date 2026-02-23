// src/pages/Home/components/ProfileSection.jsx
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import mertProfile from "../../../assets/mert-profile.webp"; // Yol güncellendi

export default function ProfileSection() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      className="flex justify-center lg:justify-end"
    >
      <div className="relative w-36 h-36 md:w-104 md:h-104 group">
        {/* Arka plan parlaması */}
        <div className="hidden md:block absolute inset-0 bg-linear-to-tr from-[#38BDF8] to-[#818CF8] opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity duration-700" />
        
        {/* Morph Fotoğraf */}
        <div className="relative w-full h-full border-2 border-white/10 bg-[#1e293b] overflow-hidden transition-all duration-1000 ease-in-out group-hover:scale-[1.02] shadow-2xl animate-morph">
          <img 
            src={mertProfile} 
            alt="Mert's Profile" 
            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0f172a]/60 to-transparent" />
        </div>

        {/* Status Badge */}
        <div className="absolute -bottom-2 -right-2 bg-slate-900/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl hidden md:flex items-center gap-3 shadow-2xl animate-bounce-slow">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Status</span>
            <span className="text-sm font-bold text-white">Developing... 🚀</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
