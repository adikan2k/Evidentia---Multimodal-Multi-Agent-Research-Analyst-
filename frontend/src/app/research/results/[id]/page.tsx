"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const base = process.env.NEXT_PUBLIC_API_BASE;

  async function load() {
    const r = await fetch(`${base}/report?jobId=${id}`);
    setData(await r.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function refine(path: "recency" | "counterpoints") {
    const r = await fetch(`${base}/refine/${path}?jobId=${id}`, { method: "POST" });
    const j = await r.json();
    if (j.ok) {
      toast.success("Refined");
      load();
    } else {
      toast.error(j.msg ?? "Refine failed");
    }
  }

  async function exportPdf() {
    const r = await fetch(`${base}/export/pdf?jobId=${id}`);
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (!data) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        <div className="h-80 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
      <Card>
        <CardContent className="p-6 prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: data.html }} />
      </Card>

      <aside className="space-y-4">
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="text-sm font-semibold">Evidence Matrix</div>
            <div className="max-h-[60vh] overflow-auto space-y-3">
              {(data.citations ?? []).map((c: any, i: number) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="text-sm font-medium line-clamp-2">{c.claim_span ?? "Claim"}</div>
                  <div className="text-xs text-muted-foreground line-clamp-3">{c.quote_span ?? "Quoted evidence"}</div>
                  {c.url && <a className="text-xs underline" href={c.url} target="_blank">Source</a>}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => refine("recency")} variant="outline">Refine: Recency</Button>
              <Button onClick={() => refine("counterpoints")} variant="outline">Refine: Counterpoints</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="default" onClick={exportPdf}>Export PDF</Button>
              <Button variant="outline" asChild>
                <a href="#" onClick={(e)=>{e.preventDefault(); navigator.clipboard.writeText(JSON.stringify(data.sources ?? [], null, 2)); toast.success("sources.json copied");}}>
                  sources.json
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#" onClick={(e)=>{e.preventDefault(); /* implement CSV later */ toast.message("tables.csv coming soon");}}>
                  tables.csv
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
