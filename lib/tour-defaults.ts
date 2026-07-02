/**
 * KODLU TURLARIN (r1..r5) ADIM VARSAYILANLARI — TEK KAYNAK.
 * Eskiden `components/ready-routes.tsx` içinde satır içi dizilerdi; render çıktısı
 * birebir korunur. `tKey`/`dKey` = `routes` i18n namespace anahtarları (r("...")).
 * `icon` = route-icons.tsx'teki ikon adı. Admin (Task 2+) bu tabanı override eder.
 */
export type DefaultStep = { icon: string; day: number; tKey: string; dKey: string };

export const DEFAULT_STEPS: Record<string, DefaultStep[]> = {
  r1: [
    { icon: "plane", day: 1, tKey: "st_flight_t", dKey: "st_flight_d" },
    { icon: "car", day: 1, tKey: "st_transfer_t", dKey: "st_transfer_d" },
    { icon: "bed", day: 1, tKey: "st_checkin_t", dKey: "r1_ck" },
    { icon: "landmark", day: 2, tKey: "r1_s1_t", dKey: "r1_s1_d" },
    { icon: "droplet", day: 2, tKey: "r1_s2_t", dKey: "r1_s2_d" },
    { icon: "sunset", day: 3, tKey: "r1_s3_t", dKey: "r1_s3_d" },
  ],
  r2: [
    { icon: "plane", day: 1, tKey: "st_flight_t", dKey: "st_flight_d" },
    { icon: "car", day: 1, tKey: "st_transfer_t", dKey: "st_transfer_d" },
    { icon: "bed", day: 1, tKey: "st_checkin_t", dKey: "r2_ck" },
    { icon: "landmark", day: 2, tKey: "r2_s1_t", dKey: "r2_s1_d" },
    { icon: "landmark", day: 3, tKey: "r2_s2_t", dKey: "r2_s2_d" },
    { icon: "droplet", day: 4, tKey: "r2_s3_t", dKey: "r2_s3_d" },
    { icon: "bag", day: 5, tKey: "r2_s4_t", dKey: "r2_s4_d" },
  ],
  r3: [
    { icon: "plane", day: 1, tKey: "st_flight_t", dKey: "st_flight_d" },
    { icon: "car", day: 1, tKey: "st_transfer_t", dKey: "st_transfer_d" },
    { icon: "heart", day: 1, tKey: "st_checkin_t", dKey: "r3_ck" },
    { icon: "landmark", day: 2, tKey: "r3_s1_t", dKey: "r3_s1_d" },
    { icon: "cablecar", day: 3, tKey: "r3_s2_t", dKey: "r3_s2_d" },
    { icon: "sailboat", day: 4, tKey: "r3_s3_t", dKey: "r3_s3_d" },
    { icon: "flower", day: 5, tKey: "r3_s4_t", dKey: "r3_s4_d" },
  ],
  r4: [
    { icon: "plane", day: 1, tKey: "st_flight_t", dKey: "st_flight_d" },
    { icon: "car", day: 1, tKey: "st_transfer_t", dKey: "st_transfer_d" },
    { icon: "bed", day: 1, tKey: "st_checkin_t", dKey: "r4_ck" },
    { icon: "ferris", day: 2, tKey: "r4_s1_t", dKey: "r4_s1_d" },
    { icon: "waves", day: 3, tKey: "r4_s2_t", dKey: "r4_s2_d" },
    { icon: "fish", day: 4, tKey: "r4_s3_t", dKey: "r4_s3_d" },
    { icon: "sailboat", day: 5, tKey: "r4_s4_t", dKey: "r4_s4_d" },
    { icon: "landmark", day: 6, tKey: "r4_s5_t", dKey: "r4_s5_d" },
    { icon: "bag", day: 7, tKey: "r4_s6_t", dKey: "r4_s6_d" },
  ],
  r5: [
    { icon: "plane", day: 1, tKey: "st_flight_t", dKey: "st_flight_d" },
    { icon: "car", day: 1, tKey: "st_transfer_t", dKey: "st_transfer_d" },
    { icon: "bed", day: 1, tKey: "st_checkin_t", dKey: "r5_ck" },
    { icon: "mountain", day: 2, tKey: "r5_s1_t", dKey: "r5_s1_d" },
    { icon: "anchor", day: 3, tKey: "r5_s2_t", dKey: "r5_s2_d" },
    { icon: "sailboat", day: 4, tKey: "r5_s3_t", dKey: "r5_s3_d" },
    { icon: "cablecar", day: 5, tKey: "r5_s4_t", dKey: "r5_s4_d" },
    { icon: "flag", day: 6, tKey: "r5_s5_t", dKey: "r5_s5_d" },
    { icon: "bag", day: 7, tKey: "r5_s6_t", dKey: "r5_s6_d" },
  ],
};

/** "Pakete dahil" varsayılan 6 madde (inc_*). */
export const DEFAULT_INCLUDED: { icon: string; labelKey: string }[] = [
  { icon: "plane", labelKey: "inc_flight" },
  { icon: "car", labelKey: "inc_transfer" },
  { icon: "bed", labelKey: "inc_hotel" },
  { icon: "utensils", labelKey: "inc_board" },
  { icon: "landmark", labelKey: "inc_tours" },
  { icon: "headset", labelKey: "inc_support" },
];
