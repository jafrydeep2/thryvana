
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 container max-w-6xl mx-auto p-4 md:p-6"
      >
        <Outlet />
      </motion.main>
      
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Thryvana. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;
