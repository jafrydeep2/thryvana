
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, Users, CheckCircle, User, Menu, X, MessageSquare } from "lucide-react";
import thryvanaLogo from '../../assets/images/thyvana-logo-3.png'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate()
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Tribe", path: "/tribe", icon: Users },
    { name: "Check In", path: "/checkin", icon: CheckCircle },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Feedback", path: "/feedback", icon: MessageSquare }, // Add Feedback to nav items
  ];

  const handleCheckin = (path) => {
    const goalID = localStorage.getItem('activeGoal')
    navigate(path + '/' + goalID)
  }

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          {/* <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground"
          >
            <span className="font-bold">T</span>
          </motion.div>
          <span className="font-bold text-lg tracking-tight">Thryvana</span> */}
          <img src={thryvanaLogo} alt="thryvanaLogo" className="w-[150px]" />

        </Link>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item, i) => (
            i === 2 ?
              <button
                key={item.path}
                onClick={() => handleCheckin(item.path)}
                className={cn(
                  "flex items-center gap-2 font-medium transition-colors hover:text-primary",
                  location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </button>
              :
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 font-medium transition-colors hover:text-primary",
                  location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
          ))}
        </nav>

        {/* Mobile navigation - Changed to white background */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-0 right-0 bg-white py-4 shadow-md md:hidden"
          >
            <nav className="flex flex-col space-y-4 px-6">
              {navItems.map((item, i) => (
                i === 2 ?
                  <button
                    key={item.path}
                    onClick={() => {
                      handleCheckin(item.path);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 p-2 font-medium transition-colors hover:text-primary",
                      location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </button>
                  :
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-colors",
                      location.pathname === item.path
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
