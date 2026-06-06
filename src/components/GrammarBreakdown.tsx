interface Token {
  korean: string;
  romanization?: string;
  meaning?: string;
  role?: string;
}
interface GrammarPoint {
  point: string;
  explanation: string;
}
interface Breakdown {
  tokens?: Token[];
  structure?: string;
  grammar?: GrammarPoint[];
  tip?: string;
}

export function GrammarBreakdown({ data }: { data: Breakdown }) {
  return (
    <div className="mt-6 space-y-5 rounded-2xl bg-card/90 p-5 ring-1 ring-border animate-in fade-in slide-in-from-top-2 duration-500">
      {data.structure && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Sentence structure
          </h4>
          <p className="mt-1 text-sm text-foreground">{data.structure}</p>
        </div>
      )}

      {data.tokens && data.tokens.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Word by word
          </h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.tokens.map((t, i) => (
              <div
                key={i}
                className="rounded-xl bg-petal px-3 py-2 ring-1 ring-blossom/60"
              >
                <div
                  className="font-semibold text-foreground"
                  style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
                >
                  {t.korean}
                </div>
                {t.romanization && (
                  <div className="text-[11px] italic text-muted-foreground">
                    {t.romanization}
                  </div>
                )}
                {t.meaning && (
                  <div className="text-xs text-foreground">{t.meaning}</div>
                )}
                {t.role && (
                  <div className="mt-0.5 text-[10px] uppercase tracking-wide text-primary/70">
                    {t.role}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.grammar && data.grammar.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Grammar notes
          </h4>
          <ul className="mt-2 space-y-2">
            {data.grammar.map((g, i) => (
              <li key={i} className="rounded-xl bg-secondary/60 p-3">
                <div className="text-sm font-semibold text-secondary-foreground">
                  {g.point}
                </div>
                <p className="mt-1 text-sm text-foreground/80">{g.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.tip && (
        <div className="rounded-xl bg-accent/15 p-3 text-sm text-foreground">
          <span className="mr-1">🌸</span>
          <span className="font-medium">Tip from Bom-Bunny:</span> {data.tip}
        </div>
      )}
    </div>
  );
}
