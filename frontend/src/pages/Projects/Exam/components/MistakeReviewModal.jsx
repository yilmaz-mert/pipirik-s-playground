// src/pages/Projects/Exam/components/MistakeReviewModal.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, Chip } from "@heroui/react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, ChevronDown } from "lucide-react";

export default function MistakeReviewModal({ isOpen, onOpenChange, wrongList, openWrongDetails, toggleWrongDetail }) {
  const { t } = useTranslation();

  const modalStyles = {
    base: "bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_-12px_rgb(56,189,248,0.2)]",
    header: "border-b border-white/10 text-slate-100 font-bold text-xl",
    footer: "border-t border-white/10 pt-4",
    body: "text-slate-300 py-6",
    closeButton: "hover:bg-white/10 active:bg-white/20 text-slate-400 hover:text-slate-100"
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside" classNames={modalStyles} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2">
                <XCircle className="text-rose-400" />
                {t('exam.reviewMistakes')}
            </ModalHeader>
            <ModalBody className="p-6">
                <div className="flex flex-col gap-6">
                {wrongList.map((w) => {
                    const isDetailOpen = openWrongDetails[w.index];
                    return (
                        <Card key={w.index} className="bg-white/5 border border-white/10 shadow-none">
                            <CardBody className="p-0">
                                <div 
                                    className="p-4 flex items-start gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => toggleWrongDetail(w.index)}
                                >
                                    <div className="shrink-0 w-8 h-8 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center font-bold text-sm">
                                        {w.index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-slate-200 font-medium mb-3" dangerouslySetInnerHTML={{ __html: w.question }} />
                                        <div className="flex gap-3 text-sm">
                                            <Chip size="sm" variant="flat" color="danger">
                                                {t('exam.your')}: <strong className="ml-1">{w.selected}</strong>
                                            </Chip>
                                            <Chip size="sm" variant="flat" color="success" className="bg-emerald-500/20 text-emerald-300">
                                                {t('exam.correct')}: <strong className="ml-1">{w.correct}</strong>
                                            </Chip>
                                        </div>
                                    </div>
                                    <div className="mt-1 text-slate-500">
                                        {isDetailOpen ? <ChevronDown /> : <ChevronRight />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isDetailOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden border-t border-white/5 bg-[#0f172a]/30"
                                        >
                                            <div className="p-4 flex flex-col gap-2">
                                                {w.choices.map((ch, ci) => {
                                                    const letter = ["A","B","C","D","E"][ci];
                                                    const isSelected = letter === w.selected;
                                                    const isCorrect = letter === w.correct;
                                                    let itemClass = "p-3 rounded-lg border text-sm flex items-center gap-3 ";
                                                    
                                                    if (isCorrect) itemClass += "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-medium";
                                                    else if (isSelected) itemClass += "bg-rose-500/20 border-rose-500/50 text-rose-300 line-through opacity-80";
                                                    else itemClass += "bg-white/5 border-white/10 text-slate-400 opacity-60";

                                                    return (
                                                        <div key={ci} className={itemClass}>
                                                            <span className="font-bold">{letter})</span>
                                                            <span dangerouslySetInnerHTML={{ __html: ch }} />
                                                            {isCorrect && <CheckCircle2 className="ml-auto w-4 h-4 text-emerald-400" />}
                                                            {isSelected && !isCorrect && <XCircle className="ml-auto w-4 h-4 text-rose-400" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardBody>
                        </Card>
                    );
                })}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t('common.close', { defaultValue: 'Kapat' })}
                </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}