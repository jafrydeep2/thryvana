
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import thryvanaLogo from '../../assets/images/thyvana-logo-3.png'
import { useEffect, useState } from "react";

const AuthLayout = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation(); 

  useEffect(() => {
    const checkAdmin = () => {
      setIsAdmin(location.pathname.includes('/admin'));
    };

    checkAdmin(); // Run on mount

    // Optional: Update if path changes (e.g., using popstate)
    window.addEventListener('popstate', checkAdmin);

    return () => {
      window.removeEventListener('popstate', checkAdmin);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
      <div className={`flex justify-center p-4 ${!isAdmin ? 'items-end' : 'items-center'}`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          {/* <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
            <span className="font-bold">T</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Thryvana</span> */}
          <img src={thryvanaLogo} alt="thryvanaLogo" className="w-[300px]" />

        </motion.div>
      </div>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-4"
      >
        <div className={`w-full ${isAdmin ? 'md:max-w-full' : 'max-w-md'}`}>
          <Outlet />
        </div>
      </motion.main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="p-6 text-center text-sm text-muted-foreground"
      >
        <p>© {new Date().getFullYear()} Thryvana. All rights reserved.</p>
      </motion.footer>
    </div>
  );
};

export default AuthLayout;
