import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import { ArrowRight, ArrowLeft, Coins, Shield, Image, Landmark, Check, Copy, Loader2 } from "lucide-react";

type TokenType = "utility" | "security" | "nft" | "stablecoin" | null;

interface TokenConfig {
  name: string;
  symbol: string;
  supply: string;
  decimals: string;
}

const TOKEN_QUESTIONS = [
  {
    question: "What is the primary purpose of your token?",
    options: [
      { value: "utility" as TokenType, label: "Utility Token", desc: "Access services, governance, or in-app currency", icon: <Coins className="w-5 h-5" /> },
      { value: "security" as TokenType, label: "Security Token", desc: "Represents ownership in real-world assets", icon: <Shield className="w-5 h-5" /> },
      { value: "nft" as TokenType, label: "NFT Collection", desc: "Unique digital assets (ERC-721)", icon: <Image className="w-5 h-5" /> },
      { value: "stablecoin" as TokenType, label: "Stablecoin", desc: "Pegged to fiat currency or commodity", icon: <Landmark className="w-5 h-5" /> },
    ],
  },
];

const generateContract = (type: TokenType, config: TokenConfig): string => {
  const { name, symbol, supply, decimals } = config;
  
  if (type === "nft") {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ${name}
 * @dev ERC-721 NFT Collection
 * @symbol ${symbol}
 * @maxSupply ${supply}
 */
contract ${name.replace(/\s/g, "")} is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = ${supply};

    constructor() ERC721("${name}", "${symbol}") Ownable(msg.sender) {}

    function safeMint(address to, string memory uri) public onlyOwner {
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage)
        returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage)
        returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`;
  }

  if (type === "stablecoin") {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ${name}
 * @dev Stablecoin with minting/burning controlled by authorized minters
 * @symbol ${symbol}
 * @decimals ${decimals}
 */
contract ${name.replace(/\s/g, "")} is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("${name}", "${symbol}") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return ${decimals};
    }
}`;
  }

  if (type === "security") {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ${name}
 * @dev Security Token with transfer restrictions and KYC whitelisting
 * @symbol ${symbol}
 * @totalSupply ${supply}
 * @decimals ${decimals}
 */
contract ${name.replace(/\s/g, "")} is ERC20, AccessControl {
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    mapping(address => bool) public whitelisted;

    constructor() ERC20("${name}", "${symbol}") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        whitelisted[msg.sender] = true;
        _mint(msg.sender, ${supply} * 10 ** ${decimals});
    }

    function addToWhitelist(address account) public onlyRole(COMPLIANCE_ROLE) {
        whitelisted[account] = true;
    }

    function removeFromWhitelist(address account) public onlyRole(COMPLIANCE_ROLE) {
        whitelisted[account] = false;
    }

    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0)) require(whitelisted[from], "Sender not whitelisted");
        if (to != address(0)) require(whitelisted[to], "Recipient not whitelisted");
        super._update(from, to, value);
    }

    function decimals() public pure override returns (uint8) {
        return ${decimals};
    }
}`;
  }

  // utility token (default)
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ${name}
 * @dev ERC-20 Utility Token
 * @symbol ${symbol}
 * @totalSupply ${supply}
 * @decimals ${decimals}
 */
contract ${name.replace(/\s/g, "")} is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("${name}", "${symbol}") Ownable(msg.sender) {
        _mint(msg.sender, ${supply} * 10 ** decimals());
    }

    function decimals() public pure override returns (uint8) {
        return ${decimals};
    }
}`;
};

const TokenLaunchpad = () => {
  const [step, setStep] = useState(0); // 0=question, 1=config, 2=result
  const [tokenType, setTokenType] = useState<TokenType>(null);
  const [config, setConfig] = useState<TokenConfig>({
    name: "",
    symbol: "",
    supply: "1000000",
    decimals: "18",
  });
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(generateContract(tokenType, config));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageLayout
      title="Token Launchpad"
      subtitle="Answer a few questions and we'll generate your production-ready smart contract"
    >
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {["Token Type", "Configuration", "Smart Contract"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                i <= step ? "bg-primary text-primary-foreground border-primary glow-cyan" : "border-border text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:inline ${i <= step ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
              {i < 2 && <div className={`w-8 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-semibold mb-6 text-center text-foreground">{TOKEN_QUESTIONS[0].question}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {TOKEN_QUESTIONS[0].options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setTokenType(opt.value); setStep(1); }}
                    className={`p-5 rounded-xl border text-left transition-all ${
                      tokenType === opt.value
                        ? "border-primary bg-primary/10 glow-cyan"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-primary">{opt.icon}</span>
                      <span className="font-semibold text-foreground">{opt.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-gradient-card rounded-xl border border-border p-8 space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Configure Your Token</h2>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Token Name</label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                      placeholder="e.g. My Token"
                      className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Symbol</label>
                    <input
                      type="text"
                      value={config.symbol}
                      onChange={(e) => setConfig({ ...config, symbol: e.target.value.toUpperCase() })}
                      placeholder="e.g. MTK"
                      maxLength={5}
                      className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      {tokenType === "nft" ? "Max Supply" : "Total Supply"}
                    </label>
                    <input
                      type="number"
                      value={config.supply}
                      onChange={(e) => setConfig({ ...config, supply: e.target.value })}
                      placeholder="1000000"
                      className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  {tokenType !== "nft" && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Decimal Points</label>
                      <input
                        type="number"
                        value={config.decimals}
                        onChange={(e) => setConfig({ ...config, decimals: e.target.value })}
                        placeholder="18"
                        min={0}
                        max={18}
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setStep(0)} className="text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    variant="neon"
                    onClick={() => setStep(2)}
                    disabled={!config.name || !config.symbol}
                    className="flex-1"
                  >
                    Generate Contract <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-gradient-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <div className="w-3 h-3 rounded-full bg-neon-green" />
                    <span className="text-xs font-mono text-muted-foreground ml-2">{config.name.replace(/\s/g, "")}.sol</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
                    {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-1 text-xs">{copied ? "Copied!" : "Copy"}</span>
                  </Button>
                </div>
                <pre className="p-5 text-sm font-mono text-foreground overflow-x-auto scrollbar-hide leading-relaxed max-h-[500px] overflow-y-auto">
                  {generateContract(tokenType, config)}
                </pre>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="ghost" onClick={() => setStep(1)} className="text-muted-foreground">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Edit Config
                </Button>
                <Button variant="neon-outline" onClick={() => { setStep(0); setTokenType(null); setConfig({ name: "", symbol: "", supply: "1000000", decimals: "18" }); }} className="flex-1">
                  Create Another Token
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};

export default TokenLaunchpad;
