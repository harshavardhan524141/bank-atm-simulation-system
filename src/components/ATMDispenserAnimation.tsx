import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Banknote, ShieldCheck } from 'lucide-react';

interface ATMDispenserAnimationProps {
  isOpen: boolean;
  type: 'WITHDRAWAL' | 'DEPOSIT';
  amount: number;
  onComplete: () => void;
}

export const ATMDispenserAnimation: React.FC<ATMDispenserAnimationProps> = ({
  isOpen,
  type,
  amount,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      return;
    }

    const timer1 = setTimeout(() => setStep(1), 700);
    const timer2 = setTimeout(() => setStep(2), 1700);
    const timer3 = setTimeout(() => setStep(3), 2800);
    const timer4 = setTimeout(() => {
      onComplete();
    }, 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const stepsList =
    type === 'WITHDRAWAL'
      ? [
          'Contacting Central Banking Switch...',
          'Verifying Ledger & Daily Limits...',
          'Counting Notes & Dispensing Cash...',
          'Transaction Finalized Successfully!',
        ]
      : [
          'Opening Secure Currency Shutter...',
          'Scanning & Validating Banknotes...',
          'Crediting Balance to Account Ledger...',
          'Deposit Accepted Successfully!',
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#102A43] border border-blue-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center text-white relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* ATM Shutter Graphics */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            ATM Terminal Dispenser
          </div>

          <h3 className="text-xl font-bold tracking-tight mb-1">
            {type === 'WITHDRAWAL' ? 'Dispensing Cash' : 'Accepting Cash Deposit'}
          </h3>
          <p className="text-2xl font-mono font-extrabold text-emerald-400 mb-6">
            ₹{amount.toLocaleString('en-IN')}
          </p>

          {/* Simulated ATM Dispenser Slot */}
          <div className="relative mx-auto w-64 h-28 bg-slate-900 rounded-xl border-4 border-slate-700 shadow-inner flex flex-col items-center justify-center overflow-hidden mb-6">
            {/* Slot indicator light */}
            <div className="absolute top-2 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />

            {/* Dispenser Mouth */}
            <div className="w-48 h-3 bg-black rounded-full shadow-inner mb-2" />

            {/* Animated Cash Notes */}
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  initial={type === 'WITHDRAWAL' ? { y: 30, opacity: 0 } : { y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg text-white font-mono font-bold shadow-lg"
                >
                  <Banknote className="w-6 h-6 animate-pulse" />
                  <span>₹{amount.toLocaleString('en-IN')}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">
              {type === 'WITHDRAWAL' ? 'Please collect your cash' : 'Insert clean flat notes'}
            </span>
          </div>

          {/* Stepper Status */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-300 min-h-[24px]">
              {stepsList[step]}
            </p>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
