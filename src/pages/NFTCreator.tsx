import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import { Palette, Sparkles, Loader2, Download } from "lucide-react";

const NFTCreator = () => {
  const [form, setForm] = useState({
    subject: "",
    style: "cyberpunk",
    colors: "",
    mood: "",
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const styles = [
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "pixel-art", label: "Pixel Art" },
    { value: "watercolor", label: "Watercolor" },
    { value: "3d-render", label: "3D Render" },
    { value: "anime", label: "Anime" },
    { value: "abstract", label: "Abstract" },
    { value: "surreal", label: "Surreal" },
    { value: "minimalist", label: "Minimalist" },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedImage(null);

    // Build a detailed prompt for NFT generation
    const prompt = `Create an NFT digital artwork: ${form.subject}. Style: ${form.style}. ${
      form.colors ? `Color palette: ${form.colors}.` : ""
    } ${form.mood ? `Mood: ${form.mood}.` : ""} High quality, suitable for NFT collection, detailed, visually striking, square format.`;

    try {
      // Use placeholder generation for now - will integrate with Lovable AI
      // Simulating with a timeout for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Generate a placeholder SVG as NFT
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      const hue1 = Math.random() * 360;
      const hue2 = (hue1 + 120) % 360;
      gradient.addColorStop(0, `hsl(${hue1}, 80%, 30%)`);
      gradient.addColorStop(1, `hsl(${hue2}, 80%, 20%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      
      // Add geometric shapes
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = 30 + Math.random() * 100;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${Math.random() * 360}, 70%, 60%, 0.2)`;
        ctx.fill();
      }
      
      // Add text
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 24px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(form.subject.slice(0, 30) || "NFT", 256, 256);
      ctx.font = "14px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(`Style: ${form.style}`, 256, 290);
      
      setGeneratedImage(canvas.toDataURL("image/png"));
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `nft-${form.subject.replace(/\s/g, "-").toLowerCase() || "art"}.png`;
    link.click();
  };

  return (
    <PageLayout
      title="NFT Creator"
      subtitle="Describe your NFT vision and let AI bring it to life"
    >
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-card rounded-xl border border-border p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Subject / Description
            </label>
            <textarea
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. A mystical dragon guarding a crystal cave..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Art Style</label>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setForm({ ...form, style: s.value })}
                  className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                    form.style === s.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Color Palette</label>
            <input
              type="text"
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
              placeholder="e.g. neon blue, electric purple, gold"
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Mood / Atmosphere</label>
            <input
              type="text"
              value={form.mood}
              onChange={(e) => setForm({ ...form, mood: e.target.value })}
              placeholder="e.g. ethereal, dark, futuristic"
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <Button
            variant="neon"
            className="w-full"
            onClick={handleGenerate}
            disabled={!form.subject || loading}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate NFT</>
            )}
          </Button>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-card rounded-xl border border-border p-6 flex flex-col items-center justify-center min-h-[400px]"
        >
          {generatedImage ? (
            <div className="space-y-4 w-full">
              <div className="rounded-lg overflow-hidden border border-border glow-purple">
                <img
                  src={generatedImage}
                  alt="Generated NFT"
                  className="w-full aspect-square object-cover"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="neon" className="flex-1" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                <Button variant="neon-outline" onClick={handleGenerate} disabled={loading}>
                  Regenerate
                </Button>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Creating your NFT artwork...</p>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                Fill in the details and click Generate to create your NFT artwork
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default NFTCreator;
