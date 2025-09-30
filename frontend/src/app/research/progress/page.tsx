"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function ProgressPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const jobId = sp.get("jobId") ?? "";
  const [status, setStatus] = useState<{ phase: string; percent: number; msg?: string }>({
    phase: "planning",
    percent: 5,
  });

  useEffect(() => {
    const t = setInterval(async () => {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/status?jobId=${jobId}`);
      const s = await r.json();
      setStatus(s);
      if (s.phase === "done") router.push(`/research/results/${jobId}`);
    }, 1200);
    return () => clearInterval(t);
  }, [jobId, router]);

  const steps = ["planning","ingesting","embedding","reranking","drafting","finalizing","done"];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Job #{jobId}</div>
          <Badge variant="secondary">{status.phase}</Badge>
        </div>
        <Progress value={status.percent} />
        <ul className="grid gap-2 md:grid-cols-7 text-xs">
          {steps.map((p) => (
            <li key={p}
              className={`px-2 py-1 rounded ${steps.indexOf(p) <= steps.indexOf(status.phase) ? "bg-primary/10" : "bg-muted"}`}>
              {p}
            </li>
          ))}
        </ul>
        {status.msg && <div className="text-xs text-muted-foreground">{status.msg}</div>}
      </CardContent>
    </Card>
  );
}
