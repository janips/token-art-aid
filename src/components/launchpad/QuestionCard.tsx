import { motion } from "framer-motion";
import { Coins, Shield, Image, Landmark, Layers } from "lucide-react";
import type { Question, AnswerValue } from "@/lib/token-decision-tree";

const ICON_MAP: Record<string, React.ReactNode> = {
  Coins: <Coins className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  Image: <Image className="w-5 h-5" />,
  Landmark: <Landmark className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
};

interface QuestionCardProps {
  question: Question;
  selectedValue?: AnswerValue;
  onSelect: (questionId: string, value: AnswerValue) => void;
}

const QuestionCard = ({ question, selectedValue, onSelect }: QuestionCardProps) => (
  <motion.div
    key={question.id}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    className="mb-8"
  >
    <h3 className="text-lg font-semibold mb-1 text-foreground">{question.question}</h3>
    <p className="text-xs text-muted-foreground mb-4">Phase {question.phase}: {question.phaseLabel}</p>

    <div className={`grid gap-3 ${question.options.length <= 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {question.options.map((opt) => (
        <motion.button
          key={opt.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(question.id, opt.value)}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedValue === opt.value
              ? "border-primary bg-primary/10 glow-cyan"
              : "border-border bg-card hover:border-primary/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {opt.icon && <span className="text-primary">{ICON_MAP[opt.icon]}</span>}
            <span className="font-semibold text-sm text-foreground">{opt.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{opt.desc}</p>
        </motion.button>
      ))}
    </div>
  </motion.div>
);

export default QuestionCard;
