/**
 * DOĞRULAMA: GALLERY_DEFAULTS öğeleri, canlı bileşen verisiyle (page.tsx +
 * antalya/page.tsx içindeki satır içi listeler) BİREBİR eşleşmeli.
 * Çalıştır: npx tsx .superpowers/verify-gallery-defaults.ts
 */
import { readFileSync } from "fs";
import { GALLERY_DEFAULTS } from "../lib/gallery-defaults";

type Live = { src: string; type: "image" | "video"; poster?: string; tKey: string; dKey: string };

// --- home.zipper: ZipItem { video?, img, name, sub } -> video varsa video, yoksa image
function parseZipper(): Live[] {
  const src = readFileSync("app/[locale]/page.tsx", "utf8");
  const block = src.slice(src.indexOf('["home.zipper"'), src.indexOf('["home.why"'));
  const out: Live[] = [];
  const re = /\{\s*video:\s*pickAsset\([^,]+,\s*"[^"]+",\s*"([^"]+)"\),\s*img:\s*pickAsset\([^,]+,\s*"[^"]+",\s*"([^"]+)"\),\s*name:\s*(t\("([^"]+)"\)|"([^"]+)"),\s*sub:\s*"([^"]+)"\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    const [, video, img, , tkey, lit, sub] = m;
    out.push({ src: video, type: "video", poster: img, tKey: tkey ?? lit, dKey: sub });
  }
  return out;
}

// --- antalya.regions: Place { img, name, sub, video? } -> video varsa video
function parseRegions(): Live[] {
  const src = readFileSync("app/[locale]/antalya/page.tsx", "utf8");
  const block = src.slice(src.indexOf('["antalya.regions"'), src.indexOf("];", src.indexOf('["antalya.regions"')));
  const out: Live[] = [];
  // Her öğe { ... } — satır bazlı ayrıştır.
  for (const line of block.split("\n")) {
    if (!line.trim().startsWith("{ img:")) continue;
    const img = /img:\s*pickAsset\([^,]+,\s*"[^"]+",\s*"([^"]+)"\)/.exec(line)?.[1];
    const video = /video:\s*pickAsset\([^,]+,\s*"[^"]+",\s*"([^"]+)"\)/.exec(line)?.[1];
    const name = /name:\s*"([^"]+)"/.exec(line)?.[1];
    const sub = /sub:\s*"([^"]+)"/.exec(line)?.[1];
    if (!img || !name || !sub) continue;
    if (video) out.push({ src: video, type: "video", poster: img, tKey: name, dKey: sub });
    else out.push({ src: img, type: "image", tKey: name, dKey: sub });
  }
  return out;
}

function compare(section: string, live: Live[]) {
  const def = GALLERY_DEFAULTS[section];
  console.log(`\n=== ${section} (live ${live.length} / defaults ${def.length}) ===`);
  console.log("idx  ok  src / type / poster / tKey / dKey");
  let allOk = true;
  const n = Math.max(live.length, def.length);
  for (let i = 0; i < n; i++) {
    const l = live[i];
    const d = def[i];
    const ok =
      !!l && !!d &&
      l.src === d.src &&
      l.type === d.type &&
      (l.poster ?? undefined) === (d.poster ?? undefined) &&
      l.tKey === (d.tKey ?? "") &&
      l.dKey === (d.dKey ?? "");
    if (!ok) allOk = false;
    console.log(
      `${String(i).padStart(2)}   ${ok ? "OK" : "XX"}  ` +
        `L{${l ? `${l.src}|${l.type}|${l.poster ?? "-"}|${l.tKey}|${l.dKey}` : "MISSING"}}` +
        (ok ? "" : `\n         D{${d ? `${d.src}|${d.type}|${d.poster ?? "-"}|${d.tKey ?? ""}|${d.dKey ?? ""}` : "MISSING"}}`),
    );
  }
  console.log(`RESULT ${section}: ${allOk ? "PASS (1:1)" : "FAIL"}`);
  return allOk;
}

const a = compare("home.zipper", parseZipper());
const b = compare("antalya.regions", parseRegions());
console.log(`\nOVERALL: ${a && b ? "PASS — defaults match live components 1:1" : "FAIL"}`);
process.exit(a && b ? 0 : 1);
