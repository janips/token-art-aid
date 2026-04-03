import { Check } from "lucide-react";
import { PHASES } from "@/lib/token-decision-tree";

interface PhaseProgressProps {
  currentPhase: number;
  completedPhases: number[];
}

const PhaseProgress = ({ currentPhase, completedPhases }: PhaseProgressProps) => (
  <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
    {[...PHASES, { number: 5, label: "Contract", desc: "" }].map((phase, i) => (
      <div key={phase.number} className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
            completedPhases.includes(phase.number) || currentPhase === phase.number
              ? "bg-primary text-primary-foreground border-primary glow-cyan"
              : "border-border text-muted-foreground"
          }`}
        >
          {completedPhases.includes(phase.number) ? <Check className="w-4 h-4" /> : phase.number === 5 ? "✦" : phase.number}
        </div>
        <span
          className={`text-xs hidden sm:inline ${
            completedPhases.includes(phase.number) || currentPhase === phase.number
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          {phase.label}
        </span>
        {i < 4 && (
          <div
            className={`w-8 h-px ${
              completedPhases.includes(phase.number) ? "bg-primary" : "bg-border"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

export default PhaseProgress;
