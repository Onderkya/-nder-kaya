import { fas } from "@fortawesome/free-solid-svg-icons";

/**
 * FONT AWESOME (solid) İKON RENDERER — server-safe, "use client" YOK.
 * @fortawesome/free-solid-svg-icons yalnız VERİ paketidir (react-fontawesome yok);
 * bu bileşen client bundle'a paket sızdırmadan inline <svg> üretir.
 *
 * Kullanım: name = "fa:faPlane" biçiminde. `fa:` öneki yoksa veya ikon
 * bulunamazsa null döner (arayan RouteIcon gibi kendi fallback'ini kullanır).
 *
 * FA veri şekli: fas[key].icon = [width, height, aliases, unicode, pathData]
 * pathData string VEYA string[] olabilir (çok parçalı ikonlar) — ikisi de işlenir.
 */
export const isFaName = (s: string) => s.startsWith("fa:");

export function FaIcon({
  name,
  size = 18,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  if (!isFaName(name)) return null;
  const key = name.slice(3); // "fa:faPlane" -> "faPlane"
  const def = (fas as Record<string, { icon?: unknown }>)[key];
  const icon = def?.icon as [number, number, unknown, unknown, string | string[]] | undefined;
  if (!icon) return null;

  const [width, height, , , pathData] = icon;
  const paths = Array.isArray(pathData) ? pathData : [pathData];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}
