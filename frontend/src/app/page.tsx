"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// shadcn/ui components
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

export default function AskPage() {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState(true);
  const [includeYoutube, setIncludeYoutube] = useState(true);
  const [maxSources, setMaxSources] = useState(12);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function startResearch() {
    if (!q.trim()) return toast.error("Please enter a research question");
    setLoading(true);
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/research/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, options: { recent, includeYoutube, maxSources } }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      toast.success("Research started");
      router.push(`/research/progress?jobId=${data.job_id}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to start research");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="q">Your research question</Label>
            <Textarea
              id="q"
              placeholder="e.g., Compare GLP-1 vs SGLT2 outcomes in T2D."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" && (e.metaKey || e.ctrlKey)) && startResearch()}
              className="min-h-[120px]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Tip: Press Ctrl/Cmd + Enter to submit
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max sources</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={maxSources}
                onChange={(e) => setMaxSources(+e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <div className="text-sm font-medium">Prefer recent</div>
                <div className="text-xs text-muted-foreground">Bias towards newer sources</div>
              </div>
              <Switch checked={recent} onCheckedChange={setRecent} />
            </div>
          </div>

          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <div className="text-sm font-medium">Include YouTube</div>
              <div className="text-xs text-muted-foreground">Transcribe + cite videos</div>
            </div>
            <Switch checked={includeYoutube} onCheckedChange={setIncludeYoutube} />
          </div>

          <Button className="w-full" onClick={startResearch} disabled={!q || loading}>
            {loading ? "Starting…" : "Start Research (Ctrl/Cmd + Enter)"}
          </Button>
        </CardContent>
      </Card>

      <ExamplesPanel />
    </div>
  );
}

function ExamplesPanel() {
  const examples = [
    "Summarize latest trends in generative models for clinical de-identification.",
    "Compare EU AI Act vs. FDA guidance for SaMD.",
    "Efficacy evidence for GLP-1s in obesity beyond weight loss.",
  ];
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <div className="text-sm font-semibold">Try one of these</div>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          {examples.map((ex) => (
            <li key={ex} className="text-muted-foreground">{ex}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
