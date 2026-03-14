import { motion } from 'framer-motion';

interface LoaderProps {
  onFinish: () => void;
}

export default function Loader({ onFinish }: LoaderProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-5xl font-bold text-accent font-mono"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          CG
        </motion.div>
        <motion.div
          className="w-48 h-[2px] bg-lightest-navy rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.8, duration: 1.2, ease: 'easeInOut' }}
            onAnimationComplete={onFinish}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
