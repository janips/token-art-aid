import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { answers, tokenName, tokenSymbol, initialSupply } = await req.json();

    if (!answers || !tokenName || !tokenSymbol) {
      return new Response(JSON.stringify({ error: "answers, tokenName, and tokenSymbol are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert Solidity smart contract developer specializing in Ethereum token standards (ERC-20, ERC-721, ERC-1155, ERC-1400, ERC-3643).

Generate a complete, production-ready, well-commented Solidity smart contract based on the user's configuration. Use OpenZeppelin v5 contracts where applicable.

Rules:
- Use Solidity ^0.8.20
- Import from @openzeppelin/contracts (latest v5)
- Include SPDX license identifier
- Add NatSpec comments
- The contract MUST compile without errors
- Include all the features and extensions the user selected
- Use proper access control patterns
- Emit events for all state changes
- Follow Solidity best practices

Return ONLY the Solidity code, no explanations.`;

    const userPrompt = `Generate a Solidity smart contract with these specifications:

Token Name: ${tokenName}
Token Symbol: ${tokenSymbol}
Initial/Max Supply: ${initialSupply || "1000000"}

Decision Tree Answers:
${JSON.stringify(answers, null, 2)}

Key decisions explained:
- Asset Nature: ${answers.asset_nature} → determines base standard
- Asset Backing: ${answers.asset_backing}
- Supply: ${answers.fixed_supply === "fixed" ? "Fixed at launch" : "Mintable over time"}
- Burnable: ${answers.burnable === "yes" ? "Yes" : "No"}
- Capped: ${answers.capped === "yes" ? "Yes, with hard cap" : "No cap"}
- Transfer Restrictions: ${answers.transfer_restriction}
- Admin Model: ${answers.admin_control}
- Upgradeable: ${answers.upgradeable === "yes" ? "Yes (proxy pattern)" : "No"}
- Royalties: ${answers.royalties === "yes" ? "ERC-2981" : "None"}
- Gasless: ${answers.gasless === "yes" ? "Permit/Meta-tx" : "Standard"}
- Transaction Tax: ${answers.tax === "yes" ? "Reflective tax" : "None"}

Generate the complete contract now.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      return new Response(JSON.stringify({ error: "Contract generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    content = content.replace(/^```solidity\n?/i, "").replace(/^```\n?/i, "").replace(/\n?```$/i, "").trim();

    return new Response(JSON.stringify({ contract: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-token-contract error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
