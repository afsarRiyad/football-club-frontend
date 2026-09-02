import { Variants, Transition } from "framer-motion";

// ============================================
// PRODUCTION ANIMATION VARIANTS
// Optimized for performance and consistency
// ============================================

// Easing functions - match your existing style
const easings = {
  // Smooth, professional feel
  smooth: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  // Snappy, responsive feel
  snappy: [0.22, 1, 0.36, 1] as [number, number, number, number],
  // Natural, spring-like feel
  spring: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
  // Classic ease-out
  easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
};

// Durations - fast but smooth
const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7,
};

// ============================================
// FADE ANIMATIONS
// ============================================

export const fadeUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

export const fadeDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

export const fadeLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

export const fadeRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
};

// ============================================
// SCALE ANIMATIONS
// ============================================

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.fast,
      ease: easings.snappy,
    },
  },
};

export const scaleUp: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: easings.spring,
    },
  },
};

// ============================================
// SLIDE ANIMATIONS
// ============================================

export const slideUp: Variants = {
  hidden: { 
    y: 60, 
    opacity: 0 
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: durations.slow,
      ease: easings.smooth,
    },
  },
};

export const slideDown: Variants = {
  hidden: { 
    y: -60, 
    opacity: 0 
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: durations.slow,
      ease: easings.smooth,
    },
  },
};

// ============================================
// STAGGER CONTAINERS
// ============================================

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

// ============================================
// HOVER STATES FOR CARDS
// ============================================

export const cardHover = {
  rest: { 
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 8px 30px -8px rgba(62, 213, 152, 0.12)",
    transition: {
      duration: durations.fast,
      ease: easings.smooth,
    },
  },
};

// ============================================
// BUTTON ANIMATIONS
// ============================================

export const buttonPress = {
  rest: { scale: 1 },
  press: { scale: 0.97 },
  hover: { scale: 1.02 },
};

export const buttonTap = {
  tap: { scale: 0.95 },
};

// ============================================
// LIST ANIMATIONS
// ============================================

export const listItem: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.fast,
      ease: easings.snappy,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: durations.fast,
    },
  },
};

// ============================================
// MODAL ANIMATIONS
// ============================================

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.fast },
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast },
  },
};

export const modalContent: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: durations.fast,
    },
  },
};

// ============================================
// LOADING STATES
// ============================================

export const pulse = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const shimmer = {
  initial: { 
    backgroundPosition: "-1000px 0" 
  },
  animate: {
    backgroundPosition: ["1000px 0", "-1000px 0"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// ============================================
// VIEWPORT CONFIGS
// ============================================

export const viewportConfig = {
  once: true,
  margin: "-50px",
  amount: 0.2,
};

export const viewportRepeat = {
  once: false,
  margin: "-100px",
  amount: 0.3,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const createTransition = (
  customDuration?: number,
  customEase?: Transition["ease"]
): Transition => ({
  duration: customDuration || durations.normal,
  ease: customEase || easings.smooth,
});

export const getStaggerDelay = (index: number, baseDelay: number = 0.08) => 
  index * baseDelay;

export const reduceMotion = {
  transition: {
    duration: 0.01,
  },
};