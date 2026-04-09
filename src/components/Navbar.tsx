import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Token Launchpad", href: "/launchpad" },
  { label: "NFT Creator", href: "/nft-creator" },
  { label: "Contract Audit", href: "/audit" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center glow-cyan">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold font-display text-gradient-primary">ContractForge AI</span>
            <span className="text-[10px] text-muted-foreground tracking-wide">powered by <a href="https://l2blockchain.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">l2blockchain.com</a></span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={`text-sm ${
                  location.pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <Link to="/launchpad">
            <Button variant="neon" size="sm">
              Launch App
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass-panel border-t overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Link to="/launchpad" onClick={() => setMobileOpen(false)}>
                <Button variant="neon" className="w-full mt-2">
                  Launch App
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
