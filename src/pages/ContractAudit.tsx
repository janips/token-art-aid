import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import { Shield, Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuditResult {
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  suggestion: string;
}

const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleToken {
    mapping(address => uint256) public balances;
    uint256 public totalSupply;
    address public owner;

    constructor(uint256 _initialSupply) {
        owner = msg.sender;
        balances[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    function mint(uint256 amount) public {
        balances[msg.sender] += amount;
        totalSupply += amount;
    }
}`;

const severityConfig = {
  critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: <AlertTriangle className="w-5 h-5" /> },
  high: { color: "text-neon-orange", bg: "bg-neon-orange/10", border: "border-neon-orange/30", icon: <AlertTriangle className="w-5 h-5" /> },
  medium: { color: "text-accent", bg: "bg-accent/10", border: "border-accent/30", icon: <Info className="w-5 h-5" /> },
  low: { color: "text-neon-cyan", bg: "bg-neon-cyan/10", border: "border-neon-cyan/30", icon: <Info className="w-5 h-5" /> },
  info: { color: "text-muted-foreground", bg: "bg-muted", border: "border-border", icon: <CheckCircle2 className="w-5 h-5" /> },
};

const ContractAudit = () => {
  const [code, setCode] = useState("");
  const [results, setResults] = useState<AuditResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    setLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("audit-contract", {
        body: { code },
      });

      if (error) {
        throw new Error(error.message || "Audit failed");
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.findings) {
        setResults(data.findings);
        toast.success(`Audit complete — ${data.findings.length} finding(s)`);
      } else {
        toast.error("No audit results returned");
      }
    } catch (error: any) {
      console.error("Audit failed:", error);
      toast.error(error.message || "Failed to audit contract");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setCode(SAMPLE_CONTRACT);
    setResults(null);
  };

  return (
    <PageLayout
      title="Smart Contract Audit"
      subtitle="Paste your Solidity smart contract and get AI-powered security analysis"
    >
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Contract Code
            </h2>
            <Button variant="ghost" size="sm" onClick={loadSample} className="text-muted-foreground text-xs">
              Load Sample
            </Button>
          </div>

          <textarea
            value={code}
            onChange={(e) => { setCode(e.target.value); setResults(null); }}
            placeholder="// Paste your Solidity smart contract here..."
            rows={20}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none font-mono text-sm leading-relaxed"
          />

          <Button
            variant="neon"
            className="w-full"
            onClick={handleAudit}
            disabled={!code.trim() || loading}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing with AI...</>
            ) : (
              <><Shield className="w-4 h-4 mr-2" /> Audit Contract</>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground">Audit Results</h2>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 gap-4"
              >
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">AI is analyzing your contract...</p>
                <p className="text-xs text-muted-foreground/60">This may take 10-15 seconds</p>
              </motion.div>
            ) : results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide pr-1"
              >
                {/* Summary */}
                <div className="bg-gradient-card rounded-xl border border-border p-4 flex gap-4 flex-wrap">
                  {(["critical", "high", "medium", "low"] as const).map((sev) => {
                    const count = results.filter((r) => r.severity === sev).length;
                    return (
                      <div key={sev} className="text-center">
                        <div className={`text-2xl font-bold ${severityConfig[sev].color}`}>{count}</div>
                        <div className="text-xs text-muted-foreground capitalize">{sev}</div>
                      </div>
                    );
                  })}
                </div>

                {results.map((result, i) => {
                  const cfg = severityConfig[result.severity];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`rounded-xl border ${cfg.border} ${cfg.bg} p-5 space-y-3`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cfg.color}>{cfg.icon}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                              {result.severity}
                            </span>
                            <h3 className="font-semibold text-foreground">{result.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                          <div className="mt-2 p-3 rounded-lg bg-background/50 border border-border">
                            <p className="text-xs font-semibold text-primary mb-1">💡 Suggestion</p>
                            <p className="text-sm text-foreground">{result.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 gap-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Shield className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm text-center">
                  Paste your contract and click Audit to get AI-powered security analysis
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ContractAudit;
