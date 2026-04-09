import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Cpu, Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 pt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-mono tracking-widest text-primary mb-6 uppercase"
          >
            AI-Powered Web3 Infrastructure
          </motion.p>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Build the Future of{" "}
            <span className="text-gradient-primary">Blockchain</span>
            <br />
            with <span className="text-gradient-primary">AI</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-2">A subdivision of <a href="https://l2blockchain.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">L2 Blockchain</a></p>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Create tokens and audit smart contracts — all powered by
            artificial intelligence. Your complete Web3 development toolkit.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/launchpad">
              <Button variant="neon" size="lg" className="text-base px-8">
                Start Building <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/audit">
              <Button variant="neon-outline" size="lg" className="text-base px-8">
                Audit a Contract
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Service cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8 mt-24 max-w-3xl mx-auto"
        >
          <ServiceCard
            icon={<Cpu className="w-6 h-6" />}
            title="Token Launchpad"
            description="AI-guided token creation. Answer questions and get a production-ready smart contract for utility, security, NFT, or stablecoin tokens."
            href="/launchpad"
            glowClass="glow-cyan border-glow-cyan"
          />
          <ServiceCard
            icon={<Shield className="w-6 h-6" />}
            title="Smart Contract Audit"
            description="Paste your Solidity contract and receive instant AI-powered security analysis with improvement suggestions and best practices."
            href="/audit"
            glowClass="glow-green"
          />
        </motion.div>
      </div>
    </section>
  );
};

const ServiceCard = ({
  icon,
  title,
  description,
  href,
  glowClass,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  glowClass: string;
}) => (
  <Link to={href}>
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`bg-gradient-card rounded-xl p-6 border border-border hover:${glowClass} transition-all duration-300 cursor-pointer group h-full`}
    >
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 text-primary group-hover:glow-cyan transition-all">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  </Link>
);

export default HeroSection;
