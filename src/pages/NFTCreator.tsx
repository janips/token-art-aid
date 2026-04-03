import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import { Palette, Sparkles, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

    const prompt = `Create an NFT digital artwork: ${form.subject}. Style: ${form.style}. ${
      form.colors ? `Color palette: ${form.colors}.` : ""
    } ${form.mood ? `Mood: ${form.mood}.` : ""} High quality, suitable for NFT collection, detailed, visually striking, square format.`;

    try {
      const { data, error } = await supabase.functions.invoke("generate-nft", {
        body: { prompt },
      });

      if (error) {
        throw new Error(error.message || "Generation failed");
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success("NFT artwork generated!");
      } else {
        toast.error("No image was returned");
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      toast.error(error.message || "Failed to generate NFT artwork");
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
              <p className="text-muted-foreground">Creating your NFT artwork with AI...</p>
              <p className="text-xs text-muted-foreground/60">This may take 10-20 seconds</p>
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
