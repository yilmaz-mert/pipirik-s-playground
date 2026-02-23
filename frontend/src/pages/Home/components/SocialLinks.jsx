// src/pages/Home/components/SocialLinks.jsx
import { Button } from "@heroui/react";
import { FaGithub, FaLinkedin } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function SocialLinks() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="flex items-center justify-center lg:justify-start gap-3 pt-1 md:pt-4"
    >
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
    </motion.div>
  );
}
