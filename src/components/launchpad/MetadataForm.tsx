import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { deriveStandard, type AnswerValue } from "@/lib/token-decision-tree";

interface MetadataFormProps {
  answers: Record<string, AnswerValue>;
  tokenName: string;
  tokenSymbol: string;
  initialSupply: string;
  onTokenNameChange: (v: string) => void;
  onTokenSymbolChange: (v: string) => void;
  onInitialSupplyChange: (v: string) => void;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

const MetadataForm = ({
  answers,
  tokenName,
  tokenSymbol,
  initialSupply,
  onTokenNameChange,
  onTokenSymbolChange,
  onInitialSupplyChange,
  onGenerate,
  onBack,
  isGenerating,
}: MetadataFormProps) => {
  const standard = deriveStandard(answers);

  return (
    <div className="bg-gradient-card rounded-xl border border-border p-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Final Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Detected standard: <span className="text-primary font-mono font-semibold">{standard}</span>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Token Name</label>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => onTokenNameChange(e.target.value)}
            placeholder="e.g. My Token"
            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Symbol</label>
          <input
            type="text"
            value={tokenSymbol}
            onChange={(e) => onTokenSymbolChange(e.target.value.toUpperCase())}
            placeholder="e.g. MTK"
            maxLength={5}
            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            {answers.asset_nature === "non-fungible" ? "Max Supply" : "Initial Supply"}
          </label>
          <input
            type="number"
            value={initialSupply}
            onChange={(e) => onInitialSupplyChange(e.target.value)}
            placeholder="1000000"
            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          variant="neon"
          onClick={onGenerate}
          disabled={!tokenName || !tokenSymbol || isGenerating}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" /> AI is generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-1" /> Generate Smart Contract
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MetadataForm;
