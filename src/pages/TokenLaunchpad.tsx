import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import PhaseProgress from "@/components/launchpad/PhaseProgress";
import QuestionCard from "@/components/launchpad/QuestionCard";
import MetadataForm from "@/components/launchpad/MetadataForm";
import ContractPreview from "@/components/launchpad/ContractPreview";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  type AnswerValue,
  getVisibleQuestions,
  getCurrentPhase,
  isAllAnswered,
  PHASES,
} from "@/lib/token-decision-tree";

type Stage = "questions" | "metadata" | "preview";

const TokenLaunchpad = () => {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [stage, setStage] = useState<Stage>("questions");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("1000000");
  const [generatedContract, setGeneratedContract] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers]);
  const currentPhase = useMemo(() => getCurrentPhase(answers), [answers]);
  const allAnswered = useMemo(() => isAllAnswered(answers), [answers]);

  const completedPhases = useMemo(() => {
    const done: number[] = [];
    for (const phase of PHASES) {
      const phaseQs = visibleQuestions.filter((q) => q.phase === phase.number);
      if (phaseQs.length > 0 && phaseQs.every((q) => q.id in answers)) {
        done.push(phase.number);
      }
    }
    if (stage === "preview") done.push(5);
    return done;
  }, [visibleQuestions, answers, stage]);

  // Find the current unanswered question
  const currentQuestion = useMemo(() => {
    return visibleQuestions.find((q) => !(q.id in answers));
  }, [visibleQuestions, answers]);

  const handleAnswer = (questionId: string, value: AnswerValue) => {
    const updated = { ...answers, [questionId]: value };
    // Clear dependent answers that are no longer visible
    const nowVisible = getVisibleQuestions(updated);
    const visibleIds = new Set(nowVisible.map((q) => q.id));
    const cleaned: Record<string, AnswerValue> = {};
    for (const [k, v] of Object.entries(updated)) {
      if (visibleIds.has(k)) cleaned[k] = v;
    }
    setAnswers(cleaned);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-token-contract", {
        body: { answers, tokenName, tokenSymbol, initialSupply },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setGeneratedContract(data.contract);
      setStage("preview");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate contract");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setStage("questions");
    setTokenName("");
    setTokenSymbol("");
    setInitialSupply("1000000");
    setGeneratedContract("");
  };

  return (
    <PageLayout
      title="Token Launchpad"
      subtitle="Answer a few questions and our AI will generate your production-ready smart contract"
    >
      <div className="max-w-3xl mx-auto">
        <PhaseProgress
          currentPhase={stage === "preview" ? 5 : stage === "metadata" ? 5 : currentPhase}
          completedPhases={completedPhases}
        />

        <AnimatePresence mode="wait">
          {stage === "questions" && !allAnswered && currentQuestion && (
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <QuestionCard
                question={currentQuestion}
                selectedValue={answers[currentQuestion.id]}
                onSelect={(id, val) => handleAnswer(id, val)}
              />
              {/* Show summary of answered questions */}
              {Object.keys(answers).length > 0 && (
                <div className="mt-6 p-4 rounded-lg border border-border bg-card/50">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Your selections</p>
                  <div className="flex flex-wrap gap-2">
                    {visibleQuestions
                      .filter((q) => q.id in answers)
                      .map((q) => {
                        const opt = q.options.find((o) => o.value === answers[q.id]);
                        return (
                          <button
                            key={q.id}
                            onClick={() => {
                              // Remove this and all subsequent answers
                              const idx = visibleQuestions.findIndex((vq) => vq.id === q.id);
                              const cleaned: Record<string, AnswerValue> = {};
                              for (const vq of visibleQuestions.slice(0, idx)) {
                                if (vq.id in answers) cleaned[vq.id] = answers[vq.id];
                              }
                              setAnswers(cleaned);
                            }}
                            className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                          >
                            {opt?.label} ✕
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {stage === "questions" && allAnswered && (
            <motion.div key="proceed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center p-8 bg-gradient-card rounded-xl border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-2">All decisions made!</h2>
                <p className="text-muted-foreground text-sm mb-6">Now let's name your token and generate the contract.</p>
                <Button variant="neon" onClick={() => setStage("metadata")}>
                  Continue to Final Details <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              {/* Answered summary */}
              <div className="mt-6 p-4 rounded-lg border border-border bg-card/50">
                <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Your selections</p>
                <div className="flex flex-wrap gap-2">
                  {visibleQuestions.map((q) => {
                    const opt = q.options.find((o) => o.value === answers[q.id]);
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          const idx = visibleQuestions.findIndex((vq) => vq.id === q.id);
                          const cleaned: Record<string, AnswerValue> = {};
                          for (const vq of visibleQuestions.slice(0, idx)) {
                            if (vq.id in answers) cleaned[vq.id] = answers[vq.id];
                          }
                          setAnswers(cleaned);
                        }}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                      >
                        {opt?.label} ✕
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {stage === "metadata" && (
            <motion.div key="metadata" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <MetadataForm
                answers={answers}
                tokenName={tokenName}
                tokenSymbol={tokenSymbol}
                initialSupply={initialSupply}
                onTokenNameChange={setTokenName}
                onTokenSymbolChange={setTokenSymbol}
                onInitialSupplyChange={setInitialSupply}
                onGenerate={handleGenerate}
                onBack={() => setStage("questions")}
                isGenerating={isGenerating}
              />
            </motion.div>
          )}

          {stage === "preview" && (
            <ContractPreview
              contract={generatedContract}
              fileName={`${tokenName.replace(/\s/g, "")}.sol`}
              onEdit={() => setStage("metadata")}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};

export default TokenLaunchpad;
