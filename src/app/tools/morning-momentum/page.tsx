import path from "path";
import { listFiles, readText } from "@/lib/data-store";

const reportsDirectory = "reports/morning-surprise";

async function getLatestMorningReport() {
  try {
    const files = (await listFiles(reportsDirectory))
      .filter((file) => file.endsWith(".md"))
      .sort((a, b) => (a > b ? -1 : 1));
    if (files.length === 0) return null;
    const fileName = files[0];
    const content = await readText(path.join(reportsDirectory, fileName));
    const date = fileName.replace("morning-", "").replace(".md", "");
    return { fileName, content, date };
  } catch (error) {
    console.error("Failed to load morning momentum report", error);
    return null;
  }
}

export default async function MorningMomentumPage() {
  const report = await getLatestMorningReport();

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Tools</p>
          <h1 className="text-3xl font-semibold">Morning Momentum</h1>
          <p className="text-sm text-zinc-400">
            Auto-generated morning snapshot that pulls today’s top focus items, reminders, open loops, and yesterday’s wins.
          </p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-card/80 p-6">
          <h2 className="text-xl font-semibold">Latest report</h2>
          {report ? (
            <>
              <p className="text-sm text-zinc-500">Generated file: {report.fileName}</p>
              <div className="mt-4 max-h-[32rem] overflow-y-auto rounded-2xl border border-white/5 bg-black/30 p-4 text-sm text-zinc-200">
                <pre className="whitespace-pre-wrap text-left">{report.content}</pre>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-rose-300">No report files found yet. Run the script below to generate one.</p>
          )}
        </div>

        <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-6 text-sm text-zinc-300">
          <p className="font-semibold text-white">Regenerate manually</p>
          <p className="mt-2 text-zinc-400">From the workspace root:</p>
          <pre className="mt-2 rounded-xl bg-black/60 p-3 text-xs text-zinc-200">node scripts/morning-surprise.mjs --date=YYYY-MM-DD</pre>
          <p className="mt-2 text-xs text-zinc-500">(Omit the --date flag to default to today.)</p>
          <p className="mt-4 text-xs text-zinc-500">Output path: reports/morning-surprise/morning-YYYY-MM-DD.md</p>
        </div>
      </div>
    </div>
  );
}
