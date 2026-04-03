import { motion } from "framer-motion";

const PageLayout = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="min-h-screen bg-grid pt-24 pb-16">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-gradient-primary">{title}</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>
        <div className="neon-line max-w-xs mx-auto mt-6" />
      </motion.div>
      {children}
    </div>
  </div>
);

export default PageLayout;
