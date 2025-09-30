"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/report?id=${id}`);
      setData(await r.json());
    })();
  }, [id]);

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
              <Button variant="outline">Export PDF</Button>
              <Button variant="outline">sources.json</Button>
              <Button variant="outline">tables.csv</Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
