import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Copy, ArrowLeft, RotateCcw } from "lucide-react";

interface ContractPreviewProps {
  contract: string;
  fileName: string;
  onEdit: () => void;
  onReset: () => void;
}

const ContractPreview = ({ contract, fileName, onEdit, onReset }: ContractPreviewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(contract);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="bg-gradient-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-accent" />
            <div className="w-3 h-3 rounded-full bg-neon-green" />
            <span className="text-xs font-mono text-muted-foreground ml-2">{fileName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
            {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
            <span className="ml-1 text-xs">{copied ? "Copied!" : "Copy"}</span>
          </Button>
        </div>
        <pre className="p-5 text-sm font-mono text-foreground overflow-x-auto scrollbar-hide leading-relaxed max-h-[500px] overflow-y-auto">
          {contract}
        </pre>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="ghost" onClick={onEdit} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Edit Details
        </Button>
        <Button variant="neon-outline" onClick={onReset} className="flex-1">
          <RotateCcw className="w-4 h-4 mr-1" /> Start Over
        </Button>
      </div>
    </motion.div>
  );
};

export default ContractPreview;
