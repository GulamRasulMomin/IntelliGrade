import React from 'react';
import { Home, BookOpen, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/my-courses', icon: BookOpen, label: 'My Courses' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const navItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const activeIndicatorVariants = {
    inactive: { scale: 0, opacity: 0 },
    active: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const pageTransitionVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="pb-20"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      
      {/* Bottom Navigation */}
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-around items-center py-2"
        >
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <motion.div
                key={path}
                variants={navItemVariants}
                whileHover="hover"
                whileTap="tap"
                className="relative"
              >
                <Link
                  to={path}
                  className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'text-purple-400 bg-gray-700' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <div className="relative">
                    <Icon size={20} />
                    {/* {isActive && (
                      <motion.div
                        variants={activeIndicatorVariants}
                        initial="inactive"
                        animate="active"
                        className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"
                      />
                    )} */}
                  </div>
                  <span className="text-xs mt-1">{label}</span>
                </Link>
                
                {/* Active underline animation */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-t-lg"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </motion.nav>
    </div>
  );
}