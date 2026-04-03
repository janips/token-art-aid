export type AnswerValue = string;

export interface QuestionOption {
  value: AnswerValue;
  label: string;
  desc: string;
  icon?: string; // lucide icon name
}

export interface Question {
  id: string;
  phase: number;
  phaseLabel: string;
  question: string;
  options: QuestionOption[];
  /** Only show this question if the condition is met */
  condition?: (answers: Record<string, AnswerValue>) => boolean;
}

export const PHASES = [
  { number: 1, label: "Core Standard", desc: "Determine the token standard" },
  { number: 2, label: "Supply & Minting", desc: "Configure supply mechanics" },
  { number: 3, label: "Compliance & Control", desc: "Set permissions and restrictions" },
  { number: 4, label: "Economics & UX", desc: "Add quality-of-life features" },
];

export const QUESTIONS: Question[] = [
  // ─── Phase 1: Core Standard ───
  {
    id: "asset_nature",
    phase: 1,
    phaseLabel: "Core Standard",
    question: "What is the primary nature of the asset?",
    options: [
      { value: "fungible", label: "Fungible", desc: "Identical units like currency", icon: "Coins" },
      { value: "non-fungible", label: "Non-Fungible", desc: "Unique items like art or collectibles", icon: "Image" },
      { value: "hybrid", label: "Hybrid", desc: "A mix of both (e.g. game with gold & swords)", icon: "Layers" },
    ],
  },
  {
    id: "collection_type",
    phase: 1,
    phaseLabel: "Core Standard",
    question: "Will you manage a single asset type or a massive collection of different items?",
    options: [
      { value: "single", label: "Single", desc: "One token type or one-off NFT" },
      { value: "multiple", label: "Multiple Collections", desc: "Many item types — ERC-1155 for gas efficiency" },
    ],
    condition: (a) => a.asset_nature === "non-fungible" || a.asset_nature === "hybrid",
  },
  {
    id: "asset_backing",
    phase: 1,
    phaseLabel: "Core Standard",
    question: "Does the asset represent a physical world item or a financial instrument?",
    options: [
      { value: "digital", label: "Digital-only", desc: "Purely on-chain digital asset" },
      { value: "rwa", label: "Real World Asset", desc: "Backed by physical property, commodities, etc." },
      { value: "security", label: "Security / Stock", desc: "Represents equity, debt, or financial instrument" },
    ],
  },

  // ─── Phase 2: Supply & Minting ───
  {
    id: "fixed_supply",
    phase: 2,
    phaseLabel: "Supply & Minting",
    question: "Should the total supply be fixed forever at launch?",
    options: [
      { value: "fixed", label: "Yes (Fixed)", desc: "All tokens minted at deploy, no more ever" },
      { value: "mintable", label: "No (Mintable)", desc: "New tokens can be minted over time" },
    ],
  },
  {
    id: "burnable",
    phase: 2,
    phaseLabel: "Supply & Minting",
    question: "Should users be able to destroy their own tokens to reduce supply?",
    options: [
      { value: "yes", label: "Yes (Burnable)", desc: "Users can burn their tokens permanently" },
      { value: "no", label: "No", desc: "Tokens cannot be destroyed" },
    ],
  },
  {
    id: "capped",
    phase: 2,
    phaseLabel: "Supply & Minting",
    question: "Do you need a capped supply limit that can never be exceeded?",
    options: [
      { value: "yes", label: "Yes (Capped)", desc: "Set an absolute maximum token supply" },
      { value: "no", label: "No", desc: "No hard cap on total supply" },
    ],
    condition: (a) => a.fixed_supply === "mintable",
  },

  // ─── Phase 3: Compliance & Control ───
  {
    id: "transfer_restriction",
    phase: 3,
    phaseLabel: "Compliance & Control",
    question: "Do you need to restrict who can hold or transfer the token?",
    options: [
      { value: "none", label: "None (Public)", desc: "Anyone can hold and transfer freely" },
      { value: "whitelist", label: "Whitelist (KYC)", desc: "Only approved addresses can participate" },
      { value: "blacklist", label: "Blacklist", desc: "Block specific addresses from transfers" },
    ],
  },
  {
    id: "admin_control",
    phase: 3,
    phaseLabel: "Compliance & Control",
    question: "Who should have the power to trigger administrative functions?",
    options: [
      { value: "owner", label: "Single Wallet (Owner)", desc: "One address controls admin functions" },
      { value: "multisig", label: "Multi-Signature", desc: "Requires multiple approvals for actions" },
      { value: "dao", label: "Community Vote (DAO)", desc: "Governance-based decision making" },
    ],
  },
  {
    id: "upgradeable",
    phase: 3,
    phaseLabel: "Compliance & Control",
    question: "Should the contract logic be changeable after deployment?",
    options: [
      { value: "yes", label: "Yes (Upgradeable)", desc: "Can update logic via proxy pattern" },
      { value: "no", label: "No (Immutable)", desc: "Contract code is permanent once deployed" },
    ],
  },

  // ─── Phase 4: Economics & UX ───
  {
    id: "royalties",
    phase: 4,
    phaseLabel: "Economics & UX",
    question: "Should you receive a percentage of every secondary sale?",
    options: [
      { value: "yes", label: "Yes (ERC-2981)", desc: "On-chain royalty info for marketplaces" },
      { value: "no", label: "No", desc: "No royalty mechanism" },
    ],
    condition: (a) => a.asset_nature === "non-fungible" || a.asset_nature === "hybrid",
  },
  {
    id: "gasless",
    phase: 4,
    phaseLabel: "Economics & UX",
    question: "Do you want users to sign transactions without paying gas?",
    options: [
      { value: "yes", label: "Yes (Permit / Meta-tx)", desc: "Gasless approvals and meta-transactions" },
      { value: "no", label: "No", desc: "Standard gas-paying transactions" },
    ],
  },
  {
    id: "tax",
    phase: 4,
    phaseLabel: "Economics & UX",
    question: "Should every transaction incur a tax for marketing or liquidity?",
    options: [
      { value: "yes", label: "Yes (Reflective)", desc: "Auto-deduct fees on transfers" },
      { value: "no", label: "No", desc: "No transaction fees" },
    ],
    condition: (a) => a.asset_nature === "fungible",
  },
];

export function getVisibleQuestions(answers: Record<string, AnswerValue>): Question[] {
  return QUESTIONS.filter((q) => !q.condition || q.condition(answers));
}

export function getQuestionsForPhase(phase: number, answers: Record<string, AnswerValue>): Question[] {
  return getVisibleQuestions(answers).filter((q) => q.phase === phase);
}

export function getCurrentPhase(answers: Record<string, AnswerValue>): number {
  const visible = getVisibleQuestions(answers);
  for (const q of visible) {
    if (!(q.id in answers)) return q.phase;
  }
  return 5; // all answered
}

export function isAllAnswered(answers: Record<string, AnswerValue>): boolean {
  const visible = getVisibleQuestions(answers);
  return visible.every((q) => q.id in answers);
}

export function deriveStandard(answers: Record<string, AnswerValue>): string {
  const { asset_nature, collection_type, asset_backing } = answers;
  if (asset_backing === "security" || asset_backing === "rwa") return "ERC-3643 / ERC-1400";
  if (asset_nature === "hybrid" || collection_type === "multiple") return "ERC-1155";
  if (asset_nature === "non-fungible") return "ERC-721";
  return "ERC-20";
}
