import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface WelcomeMessageProps {
  onContinue: () => void;
  onBack: () => void;
}

export function WelcomeMessage({ onContinue, onBack }: WelcomeMessageProps) {
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);

  const canContinue = agreementAccepted && policyAccepted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold text-slate-800 dark:text-white mb-2"
          >
            Welcome to our social club
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl text-slate-600 dark:text-slate-300 mb-2"
          >
            The chillest spot ✌️
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-lg text-slate-500 dark:text-slate-400"
          >
            Scan in. Spark up. Stay smooth.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-base text-slate-600 dark:text-slate-300 mt-4"
          >
            Let's get you registered — it's quick & easy
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Cannabis Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">
              Regarding Cannabis
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
              This social club operates based on a donation model and does not engage in the explicit sale of cannabis. 
              Members may make voluntary donations to support the club's activities and operations. In return for these 
              donations, members may be provided with cannabis as a gesture of appreciation.
            </p>
            <div className="flex items-start space-x-3 mt-4">
              <Checkbox
                id="agreement"
                checked={agreementAccepted}
                onCheckedChange={(checked) => setAgreementAccepted(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="agreement" className="text-sm text-amber-700 dark:text-amber-300 cursor-pointer">
                I understand and agree to the donation model
              </label>
            </div>
          </div>

          {/* Consumption Policy */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3">
              Consumption & Removal Policy
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed mb-3">
              For the safety, legal compliance, and integrity of the club, all cannabis provided must be consumed 
              only within the designated areas on club premises.
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              Any cannabis that is consumed or taken outside the club will result in a permanent ban.
            </p>
            <div className="flex items-start space-x-3 mt-4">
              <Checkbox
                id="policy"
                checked={policyAccepted}
                onCheckedChange={(checked) => setPolicyAccepted(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="policy" className="text-sm text-red-700 dark:text-red-300 cursor-pointer">
                I understand and agree to the consumption policy
              </label>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex justify-between mt-8"
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="px-6 py-3"
          >
            Back
          </Button>
          
          <Button
            onClick={onContinue}
            disabled={!canContinue}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Registration
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}