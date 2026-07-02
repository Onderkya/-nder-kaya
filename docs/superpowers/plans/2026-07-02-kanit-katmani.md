# Kanıt Katmanı + Yolculuk Anlatımı — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Siteye güven/kanıt katmanı eklemek: ana sayfa fark şeridi, otel kartı→WhatsApp akışı, temsili kurucu fotoğrafı, 6 adımlı burs yolculuğu, 0→C2 seviye yolu, FAQ genişletme.

**Architecture:** Mevcut section-registry kalıbı korunur (her sayfa `sectionBlocks: [string, ReactNode][]` + `applySectionOrder`). Yeni bölümler yeni registry id'leriyle eklenir (applySectionOrder bilinmeyen id'leri komşu konumuna göre otomatik ekler — lib/sections.ts:57-80 doğrulandı). Tüm metinler `messages/{tr,en,ru,kk,uz}.json` dosyalarına girer. Yeni bağımlılık YOK.

**Tech Stack:** Next.js 15 App Router, next-intl, Tailwind + CSS değişkenleri, mevcut Reveal/StudyJourney bileşenleri, Prisma (dokunulmayacak).

**Spec:** `docs/superpowers/specs/2026-07-02-kanit-katmani-design.md`

## Global Constraints

- **Ana sayfa hero'suna (components/dive-hero.tsx ve page.tsx'teki DiveHero çağrısı) DOKUNULMAZ.**
- **Mevcut görsel/video dosyaları silinmez, değiştirilmez.** `public/` altına yalnızca EKLEME yapılabilir (founders.jpg). Yeni bölümler mevcut görselleri yeniden KULLANABİLİR.
- Çeviri eklenen HER anahtar 5 dosyaya birden girer: `messages/tr.json`, `en.json`, `ru.json`, `kk.json`, `uz.json` (uz.json routing'de kapalı ama dosya paritesi korunur).
- Yeni npm paketi eklenmez. Veritabanı şeması değişmez.
- Her görev sonunda `npm run typecheck` temiz olmalı; sonra commit.
- Kod stili: mevcut dosyalardaki gibi Türkçe yorumlar, inline `style={{ }}` + CSS değişkenleri (`rgb(var(--primary))` kalıbı).
- Başlangıç commit'i `17631a6` (spec commit'i) — son doğrulamada diff bu ankora göre alınır.

---

### Task 1: Ana sayfa fark şeridi (`home.diffStrip`)

**Files:**
- Modify: `messages/tr.json`, `messages/en.json`, `messages/ru.json`, `messages/kk.json`, `messages/uz.json` (`home` namespace'ine 2 anahtar)
- Modify: `app/[locale]/page.tsx` (sectionBlocks dizisinin BAŞINA yeni blok)

**Interfaces:**
- Consumes: mevcut `home.heroProof2`, `trust.p1` çevirileri; `IconCheck` (components/icons.tsx).
- Produces: registry id `"home.diffStrip"` (admin panel bölüm sırala/gizle otomatik tanır).

- [ ] **Step 1: Çeviri anahtarlarını 5 dosyaya ekle**

Her dosyada `home` objesi içine, `"heroDiff"` anahtarından hemen sonra ekle (JSON virgüllerine dikkat):

`messages/tr.json`:
```json
    "diffLine": "Acente değiliz — bu yolu yaşamış, Antalya'da yaşayan bir aileyiz.",
    "diffHuman": "Gerçek insan, bot değil",
```

`messages/en.json`:
```json
    "diffLine": "We're not an agency — we're a family living in Antalya who has lived this journey.",
    "diffHuman": "Real people, not bots",
```

`messages/ru.json`:
```json
    "diffLine": "Мы не агентство — мы семья, которая прошла этот путь и живёт в Анталье.",
    "diffHuman": "Живые люди, а не боты",
```

`messages/kk.json`:
```json
    "diffLine": "Біз агенттік емеспіз — бұл жолдан өткен, Антальяда тұратын отбасымыз.",
    "diffHuman": "Бот емес, нағыз адамдар",
```

`messages/uz.json`:
```json
    "diffLine": "Biz agentlik emasmiz — bu yo'lni bosib o'tgan, Antalyada yashaydigan oilamiz.",
    "diffHuman": "Bot emas, haqiqiy insonlar",
```

- [ ] **Step 2: page.tsx'e bölümü ekle**

`app/[locale]/page.tsx` içinde `const sectionBlocks: [string, ReactNode][] = [` satırından hemen sonra, `["home.readyRoutes", ...]`'tan ÖNCE şu bloğu ekle (hero'ya dokunma — bu registry'nin ilk elemanı olur, hero'nun hemen altında çıkar):

```tsx
    ["home.diffStrip", (
      /* Fark şeridi — kimlik cümlesi + 3 mikro-kanıt (hero'ya dokunmadan, hemen altına) */
      <section className="border-b" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))" }}>
        <div className="container-wide flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-left">
          <p className="font-display text-[17px] font-semibold leading-snug" style={{ color: "rgb(var(--foreground))" }}>{t("diffLine")}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium" style={{ color: "rgb(var(--muted-foreground))" }}>
            {[t("heroProof2"), trust("p1"), t("diffHuman")].map((p) => (
              <li key={p} className="inline-flex items-center gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-white" style={{ backgroundColor: "rgb(var(--primary))" }}><IconCheck className="h-3 w-3" /></span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>
    )],
```

Not: `t`, `trust`, `IconCheck` bu dosyada zaten tanımlı/import edilmiş — yeni import gerekmez.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: hatasız çıkış.

- [ ] **Step 4: Commit**

```bash
git add messages/ "app/[locale]/page.tsx"
git commit -m "feat(home): fark şeridi — kimlik cümlesi + 3 mikro-kanıt (hero altı)"
```

---

### Task 2: Otel kartı → WhatsApp akışı

**Files:**
- Modify: `messages/*.json` (5 dosya; `hotelsd` namespace'ine 2 anahtar)
- Modify: `components/hotel-cards.tsx` (HotelCard tipine `wa`, Labels'a `waAsk`; kart gövdesine WhatsApp butonu)
- Modify: `app/[locale]/page.tsx` (hotels map'ine `wa` alanı, labels'a `waAsk`)

**Interfaces:**
- Consumes: `getPublicSettings()` → `{ whatsapp: string, whatsappConfigured: boolean }` (lib/settings.ts:105-118; page.tsx'te `site` olarak zaten mevcut). WhatsApp mesaj kalıbı emsali: `components/ready-routes.tsx:158`.
- NOT: Spec'in "/antalya'daki paket kartları" kısmı ZATEN karşılanıyor — /antalya, ReadyRoutes kullanır ve her paket kartında önyazılı WhatsApp linki mevcut (`routes.waMsg`). Bu görevde yalnız ana sayfa HotelCards'a eklenir; /antalya'ya dokunulmaz.
- Produces: `HotelCard` tipi `wa?: string | null` alanı kazanır; `Labels` tipi `waAsk?: string` kazanır. (HotelCards'ı kullanan tek yer ana sayfa — geriye dönük uyumlu, alanlar opsiyonel.)

- [ ] **Step 1: Çeviri anahtarları — `hotelsd` namespace'i, `"note"` anahtarından sonra**

`messages/tr.json`:
```json
    "waAsk": "WhatsApp'tan sor",
    "waMsg": "Merhaba! {name} için tatil teklifi almak istiyorum.",
```
`messages/en.json`:
```json
    "waAsk": "Ask on WhatsApp",
    "waMsg": "Hello! I'd like to get a vacation offer for {name}.",
```
`messages/ru.json`:
```json
    "waAsk": "Спросить в WhatsApp",
    "waMsg": "Здравствуйте! Хочу получить предложение по отдыху в {name}.",
```
`messages/kk.json`:
```json
    "waAsk": "WhatsApp арқылы сұрау",
    "waMsg": "Сәлеметсіз бе! {name} бойынша демалыс ұсынысын алғым келеді.",
```
`messages/uz.json`:
```json
    "waAsk": "WhatsApp orqali so'rash",
    "waMsg": "Assalomu alaykum! {name} bo'yicha dam olish taklifini olmoqchiman.",
```

- [ ] **Step 2: `components/hotel-cards.tsx` — tip ve buton**

Tip değişiklikleri (dosya başı):
```tsx
export type HotelCard = {
  name: string;
  location: string;
  img: string;
  best: string;
  why: string;
  note: string;
  /** Önceden doldurulmuş wa.me linki; WhatsApp ayarlı değilse null/undefined. */
  wa?: string | null;
};

type Labels = { cta: string; bestFor: string; why: string; note: string; waAsk?: string };
```

Kart gövdesinde mevcut CTA bloğunu (satır ~89-91) şununla değiştir — mevcut `/contact` linki aynen kalır, altına koşullu WhatsApp butonu gelir:
```tsx
            <div className="mt-auto">
              <Link href="/contact" className="btn-accent w-full justify-center shadow-lg shadow-black/10">
                {labels.cta} <IconArrow />
              </Link>
              {h.wa && labels.waAsk ? (
                <a
                  href={h.wa}
                  target="_blank"
                  rel="noopener"
                  className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:brightness-110"
                  style={{ borderColor: "rgb(37 211 102 / 0.55)", backgroundColor: "rgb(37 211 102 / 0.10)", color: "#1da851" }}
                >
                  {labels.waAsk}
                </a>
              ) : null}
            </div>
```
(`mt-auto` sınıfı Link'ten sarmalayıcı div'e taşındı — kart yüksekliği davranışı aynı kalır.)

- [ ] **Step 3: `app/[locale]/page.tsx` — wa linkini kur**

`hotels` map'inde (satır ~79-86) `note` alanından sonra ekle:
```tsx
      // Önceden doldurulmuş WhatsApp mesajı — müşterinin yazma yükü sıfır.
      wa: site.whatsappConfigured
        ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(hd("waMsg", { name: h.name }))}`
        : null,
```
(`site` değişkeni satır 40'ta hotels'ten ÖNCE tanımlı — sıra sorunu yok.)

`HotelCards` çağrısında (satır ~170) labels'a `waAsk` ekle:
```tsx
<HotelCards hotels={hotels} labels={{ cta: t("hotelsCta"), bestFor: hd("bestFor"), why: hd("why"), note: hd("note"), waAsk: hd("waAsk") }} />
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: hatasız.

- [ ] **Step 5: Commit**

```bash
git add messages/ components/hotel-cards.tsx "app/[locale]/page.tsx"
git commit -m "feat(home): otel kartlarına önyazılı WhatsApp sor butonu"
```

---

### Task 3: Temsili kurucu fotoğrafı ⚠️ ORKESTRATÖR GÖREVİ

> Bu görev kullanıcı onayı gerektirir (fotoğraf seçimi) — subagent'a DEĞİL, ana oturuma aittir.

**Files:**
- Create: `public/images/founders.jpg` (telifsiz temsili çift fotoğrafı)
- Modify: `messages/*.json` (5 dosya; `convert` namespace'ine 1 anahtar)
- Modify: `app/[locale]/about/page.tsx` (figcaption'a "temsili görsel" notu + yorum güncelleme)
- Modify: `public/images/CREDITS.txt` (kaynak kaydı)

**Interfaces:**
- Consumes: about sayfası satır 52-57'deki mevcut `existsSync(...founders.jpg)` mantığı — dosya eklenince fotoğraf OTOMATİK devreye girer, kod değişikliği gerekmez (yalnız figcaption güncellenir).
- Produces: `convert.coupleRep` çeviri anahtarı.

- [ ] **Step 1: Aday fotoğrafları bul ve kullanıcıya onaylat**

Pexels/Unsplash'te ara ("couple sea sunset", "couple travel mediterranean" vb. — Orta Asyalı kadın + Akdenizli erkek izlenimi veren, deniz/tatil atmosferli). 2-3 aday linkini AskUserQuestion ile kullanıcıya sun. Seçim gelmeden İLERLEME.

- [ ] **Step 2: Seçilen fotoğrafı indir ve optimize et**

```bash
curl -L -o public/images/founders.jpg "<seçilen-fotoğraf-url>"
sips -Z 2000 public/images/founders.jpg
```
Expected: dosya var, uzun kenar ≤2000px. `CREDITS.txt`'e kaynak satırı ekle (mevcut format: `dosya-adı — kaynak URL — lisans`).

- [ ] **Step 3: Çeviri anahtarı — `convert` namespace'i, `"coupleCaption"` anahtarından sonra**

tr: `"coupleRep": "Temsili görsel",`
en: `"coupleRep": "Representative image",`
ru: `"coupleRep": "Иллюстративное фото",`
kk: `"coupleRep": "Көрнекі сурет",`
uz: `"coupleRep": "Namunaviy surat",`

- [ ] **Step 4: about/page.tsx — figcaption + yorum**

Satır ~127'deki figcaption'ı şununla değiştir:
```tsx
                  <figcaption className="absolute bottom-5 left-6 right-6 text-[13px] font-medium text-white/90">
                    {cv("coupleCaption")}
                    <span className="mt-1 block text-[11px] font-normal text-white/60">{cv("coupleRep")}</span>
                  </figcaption>
```

Satır 49-51'deki yorumu güncelle (artık gerçeği yansıtmıyor):
```tsx
  // Temsili (telifsiz) çift fotoğrafı kullanılır ve figcaption'da "temsili görsel"
  // ibaresiyle işaretlenir — kullanıcı kararı (2026-07, spec: kanit-katmani).
  // Dosya yoksa zarif yer tutucu (🇰🇿 ♥ 🇹🇷) davranışı korunur.
```

- [ ] **Step 5: Typecheck + commit**

Run: `npm run typecheck` → hatasız.
```bash
git add public/images/founders.jpg public/images/CREDITS.txt messages/ "app/[locale]/about/page.tsx"
git commit -m "feat(about): temsili kurucu fotoğrafı + 'temsili görsel' ibaresi"
```

---

### Task 4: Burs yolculuğu — 4 adımdan 6 adıma + "bu adımda biz" notu

**Files:**
- Modify: `components/study-journey.tsx` (JourneyStep'e `weDo?`, bileşene `weDoLabel?` prop)
- Modify: `messages/*.json` (5 dosya; `imm` namespace'ine 17 anahtar)
- Modify: `app/[locale]/education/page.tsx` (steps dizisi 6 eleman, weDo bağlama)

**Interfaces:**
- Consumes: mevcut `StudyJourney({ eyebrow, steps })` (components/study-journey.tsx:25) ve mevcut `imm.edu_s1*..s4*` çevirileri (İÇERİKLERİ DEĞİŞMEZ, yalnız sıra numaraları kayar).
- NOT (spec'ten bilinçli sapma): Spec 6 adımı "hayal→başvuru→belgeler→kabul→varış→mezuniyet" diye örneklemişti; mevcut 4 adımın içeriği zaten güçlü olduğundan onlar korunur, araya "Kabul mektubu" ve sona "Mezuniyet" eklenir. Sonuç yine 6 adımlı, her adımda "biz ne yapıyoruz" notlu — spec'in amacı birebir karşılanır, mevcut içerik silinmez (kapsam disiplini).
- Produces: `JourneyStep` tipi `weDo?: string` kazanır; `StudyJourney` `weDoLabel?: string` prop'u kazanır (opsiyonel — geriye dönük uyumlu). Yeni asset slotları: `education.step5.image`, `education.step6.image`.
- Yeni görseller YOK: 05. adım `/images/turkish-flag-sky.jpg` (education hero'da zaten var), 06. adım `/images/kaleici-harbor.jpg` (about hero'da zaten var) — yeniden kullanım.

- [ ] **Step 1: Çeviri anahtarları — `imm` namespace'i, `"edu_s4b"` anahtarından sonra**

`messages/tr.json`:
```json
    "edu_s5Title": "Kabul mektubu",
    "edu_s5Place": "YTB · Üniversite",
    "edu_s5Text": "Mülakat sonrası o mail gelir: kabul edildin. Uçuş, sigorta ve geliş planını birlikte yaparız.",
    "edu_s5a": "Kabul sonrası yapılacaklar listesi",
    "edu_s5b": "Uçuş ve geliş planı",
    "edu_s6Title": "Mezuniyet & yeni hayat",
    "edu_s6Place": "Antalya · Türkiye",
    "edu_s6Text": "Diploma, akıcı Türkçe ve yeni bir gelecek. Bu yolun sonunu biliyoruz — çünkü biz de buradan geçtik.",
    "edu_s6a": "Mezuniyet sonrası seçenekler",
    "edu_s6b": "Türkiye'de kalma ve kariyer yolları",
    "edu_weDo": "Bu adımda biz",
    "edu_s1We": "Hedefine ve bütçene göre kısa listeyi birlikte çıkarırız.",
    "edu_s2We": "Başvuru dosyanı hazırlar, son tarihleri senin yerine takip ederiz.",
    "edu_s5We": "Mülakata deneme mülakatıyla hazırlar, kabul sonrası her adımı planlarız.",
    "edu_s3We": "Denklik, vize ve evrak çevirisini adım adım yönetiriz.",
    "edu_s4We": "Yurt/ev seçiminde ve ilk haftanda yanında oluruz.",
    "edu_s6We": "İlk mesajdan mezuniyete kadar aynı muhatap olarak kalırız.",
```

`messages/en.json`:
```json
    "edu_s5Title": "Acceptance letter",
    "edu_s5Place": "YTB · University",
    "edu_s5Text": "After the interview, that email arrives: you're accepted. We plan your flight, insurance and arrival together.",
    "edu_s5a": "Post-acceptance checklist",
    "edu_s5b": "Flight and arrival plan",
    "edu_s6Title": "Graduation & a new life",
    "edu_s6Place": "Antalya · Türkiye",
    "edu_s6Text": "A diploma, fluent Turkish and a new future. We know where this road ends — we walked it ourselves.",
    "edu_s6a": "Options after graduation",
    "edu_s6b": "Staying in Türkiye and career paths",
    "edu_weDo": "At this step, we",
    "edu_s1We": "Build your shortlist together, based on your goal and budget.",
    "edu_s2We": "Prepare your application file and track every deadline for you.",
    "edu_s5We": "Run a mock interview and plan every post-acceptance step.",
    "edu_s3We": "Handle equivalency, visa and document translation step by step.",
    "edu_s4We": "Help you choose dorm/housing and stay with you through week one.",
    "edu_s6We": "Stay your single point of contact from first message to graduation.",
```

`messages/ru.json`:
```json
    "edu_s5Title": "Письмо о зачислении",
    "edu_s5Place": "YTB · Университет",
    "edu_s5Text": "После собеседования приходит то самое письмо: вы приняты. Вместе планируем перелёт, страховку и приезд.",
    "edu_s5a": "Чек-лист после зачисления",
    "edu_s5b": "Перелёт и план приезда",
    "edu_s6Title": "Выпуск и новая жизнь",
    "edu_s6Place": "Анталья · Турция",
    "edu_s6Text": "Диплом, свободный турецкий и новое будущее. Мы знаем, куда ведёт эта дорога — мы прошли её сами.",
    "edu_s6a": "Варианты после выпуска",
    "edu_s6b": "Остаться в Турции и карьерные пути",
    "edu_weDo": "На этом шаге мы",
    "edu_s1We": "Вместе составляем шорт-лист под вашу цель и бюджет.",
    "edu_s2We": "Готовим пакет документов и следим за всеми дедлайнами за вас.",
    "edu_s5We": "Проводим пробное собеседование и планируем каждый шаг после зачисления.",
    "edu_s3We": "Шаг за шагом ведём эквивалентность, визу и перевод документов.",
    "edu_s4We": "Помогаем с общежитием/жильём и рядом в первую неделю.",
    "edu_s6We": "Остаёмся вашим единственным контактом от первого сообщения до выпуска.",
```

`messages/kk.json`:
```json
    "edu_s5Title": "Қабылдау хаты",
    "edu_s5Place": "YTB · Университет",
    "edu_s5Text": "Сұхбаттан кейін сол хат келеді: қабылдандыңыз. Ұшу, сақтандыру және келу жоспарын бірге жасаймыз.",
    "edu_s5a": "Қабылданғаннан кейінгі тізім",
    "edu_s5b": "Ұшу және келу жоспары",
    "edu_s6Title": "Бітіру және жаңа өмір",
    "edu_s6Place": "Анталья · Түркия",
    "edu_s6Text": "Диплом, еркін түрік тілі және жаңа болашақ. Бұл жолдың соңын білеміз — өйткені өзіміз де осы жолдан өттік.",
    "edu_s6a": "Бітіргеннен кейінгі мүмкіндіктер",
    "edu_s6b": "Түркияда қалу және мансап жолдары",
    "edu_weDo": "Бұл қадамда біз",
    "edu_s1We": "Мақсатыңыз бен бюджетіңізге қарай қысқа тізімді бірге құрамыз.",
    "edu_s2We": "Өтінім құжаттарыңызды дайындап, барлық мерзімдерді сіз үшін қадағалаймыз.",
    "edu_s5We": "Сынақ сұхбатын өткізіп, қабылданғаннан кейінгі әр қадамды жоспарлаймыз.",
    "edu_s3We": "Баламалылық, виза және құжат аудармасын қадам-қадаммен жүргіземіз.",
    "edu_s4We": "Жатақхана/баспана таңдауда көмектесіп, алғашқы аптада қасыңызда боламыз.",
    "edu_s6We": "Алғашқы хабарламадан бітіруге дейін жалғыз байланыс адамыңыз болып қаламыз.",
```

`messages/uz.json`:
```json
    "edu_s5Title": "Qabul xati",
    "edu_s5Place": "YTB · Universitet",
    "edu_s5Text": "Suhbatdan keyin o'sha xat keladi: qabul qilindingiz. Parvoz, sug'urta va kelish rejasini birga tuzamiz.",
    "edu_s5a": "Qabuldan keyingi ro'yxat",
    "edu_s5b": "Parvoz va kelish rejasi",
    "edu_s6Title": "Bitiruv va yangi hayot",
    "edu_s6Place": "Antalya · Turkiya",
    "edu_s6Text": "Diplom, ravon turk tili va yangi kelajak. Bu yo'lning oxirini bilamiz — chunki o'zimiz ham shu yo'ldan o'tganmiz.",
    "edu_s6a": "Bitiruvdan keyingi imkoniyatlar",
    "edu_s6b": "Turkiyada qolish va karyera yo'llari",
    "edu_weDo": "Bu bosqichda biz",
    "edu_s1We": "Maqsadingiz va byudjetingizga mos qisqa ro'yxatni birga tuzamiz.",
    "edu_s2We": "Ariza hujjatlaringizni tayyorlab, barcha muddatlarni siz uchun kuzatamiz.",
    "edu_s5We": "Sinov suhbatini o'tkazib, qabuldan keyingi har bir qadamni rejalashtiramiz.",
    "edu_s3We": "Ekvivalentlik, viza va hujjat tarjimasini bosqichma-bosqich boshqaramiz.",
    "edu_s4We": "Yotoqxona/uy tanlashda yordam berib, birinchi haftada yoningizda bo'lamiz.",
    "edu_s6We": "Birinchi xabardan bitiruvgacha yagona muloqot odamingiz bo'lib qolamiz.",
```

- [ ] **Step 2: `components/study-journey.tsx` — weDo desteği**

`JourneyStep` tipine ekle (satır ~15, `points?` sonrasına):
```tsx
  /** "Bu adımda biz …" — danışmanlık değerini somutlaştıran kısa not. */
  weDo?: string;
```

Bileşen imzasını genişlet (satır 25):
```tsx
export function StudyJourney({ eyebrow, steps, weDoLabel }: { eyebrow: string; steps: JourneyStep[]; weDoLabel?: string }) {
```

Kart içinde `points` listesinden (satır ~135'teki `: null}` kapanışından) hemen sonra ekle:
```tsx
                  {st.weDo && weDoLabel ? (
                    <p className="mt-5 max-w-md rounded-2xl border px-4 py-3 text-[14px] leading-relaxed text-white/90" style={{ borderColor: "rgb(255 255 255 / 0.22)", backgroundColor: "rgb(255 255 255 / 0.08)" }}>
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgb(var(--gold))" }}>{weDoLabel}</span>
                      {st.weDo}
                    </p>
                  ) : null}
```

Kart konteyner yüksekliğini artır — satır ~117'de `min-h-[22rem]` → `min-h-[27rem]` (weDo kutusu mobilde taşmasın).

- [ ] **Step 3: `app/[locale]/education/page.tsx` — 6 adım**

`education.journey` bloğundaki `<StudyJourney ... />` çağrısını (satır 63-71) şununla değiştir. Mevcut s1-s4 içerikleri AYNEN kalır; kabul (s5) 3. sıraya girer, mezuniyet (s6) sona; `n` etiketleri yeniden numaralanır:

```tsx
      <StudyJourney
        eyebrow={x("edu_journeyEyebrow")}
        weDoLabel={x("edu_weDo")}
        steps={[
          { n: "01", title: x("edu_s1Title"), place: x("edu_s1Place"), text: x("edu_s1Text"), img: campus ?? undefined, video: pickAssetVisible(A, H, "education.step1.video", "/media/campus-aerial.mp4") ?? undefined, points: [x("edu_s1a"), x("edu_s1b")], weDo: x("edu_s1We") },
          { n: "02", title: x("edu_s2Title"), place: x("edu_s2Place"), text: x("edu_s2Text"), img: pickAssetVisible(A, H, "education.step2.image", "/images/campus.jpg") ?? undefined, video: pickAssetVisible(A, H, "education.step2.video", "/media/office-consult.mp4") ?? undefined, points: [x("edu_s2a"), x("edu_s2b")], weDo: x("edu_s2We") },
          { n: "03", title: x("edu_s5Title"), place: x("edu_s5Place"), text: x("edu_s5Text"), img: pickAssetVisible(A, H, "education.step5.image", "/images/turkish-flag-sky.jpg") ?? undefined, points: [x("edu_s5a"), x("edu_s5b")], weDo: x("edu_s5We") },
          { n: "04", title: x("edu_s3Title"), place: x("edu_s3Place"), text: x("edu_s3Text"), img: pickAssetVisible(A, H, "education.step3.image", "/images/kaleici-inside.jpg") ?? undefined, video: pickAssetVisible(A, H, "education.step3.video", "/media/edu-street.mp4") ?? undefined, points: [x("edu_s3a"), x("edu_s3b")], weDo: x("edu_s3We") },
          { n: "05", title: x("edu_s4Title"), place: x("edu_s4Place"), text: x("edu_s4Text"), img: pickAssetVisible(A, H, "education.step4.image", "/images/dorm.jpg") ?? undefined, points: [x("edu_s4a"), x("edu_s4b")], weDo: x("edu_s4We") },
          { n: "06", title: x("edu_s6Title"), place: x("edu_s6Place"), text: x("edu_s6Text"), img: pickAssetVisible(A, H, "education.step6.image", "/images/kaleici-harbor.jpg") ?? undefined, points: [x("edu_s6a"), x("edu_s6b")], weDo: x("edu_s6We") },
        ]}
      />
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: hatasız.

- [ ] **Step 5: Commit**

```bash
git add messages/ components/study-journey.tsx "app/[locale]/education/page.tsx"
git commit -m "feat(education): burs yolculuğu 6 adıma çıktı + 'bu adımda biz' notları"
```

---

### Task 5: 0'dan C2'ye yol (`lessons.levelPath`)

**Files:**
- Create: `components/level-path.tsx`
- Modify: `messages/*.json` (5 dosya; `imm` namespace'ine 11 anahtar)
- Modify: `app/[locale]/lessons/page.tsx` (yeni registry bloğu `"lessons.levelPath"`, `"lessons.teacher"` bloğundan SONRA)

**Interfaces:**
- Consumes: `Reveal` (components/reveal.tsx).
- Produces: `LevelPath({ eyebrow, title, note, daily, nowLabel, levels })` — `levels: { code: string; text: string; now?: boolean }[]`. Registry id `"lessons.levelPath"`.

- [ ] **Step 1: Çeviri anahtarları — `imm` namespace'i, `"lived_cta"` anahtarından sonra** (dikkat: `lived_cta` imm'in son anahtarı — önceki satıra virgül ekle)

`messages/tr.json`:
```json
    "lvl_eyebrow": "Yol haritan",
    "lvl_title": "Sıfırdan C2'ye — öğretmeninin bizzat yürüdüğü yol",
    "lvl_note": "Öğretmenimiz bu çizginin tamamını sıfırdan yürüdü: Kazakistan'dan geldi, bugün C2 seviyesinde. Nereden başlarsan başla, yolun her adımını bilen biriyle ilerlersin.",
    "lvl_daily": "Her seviyede PetLingo ile günlük pratik yanında.",
    "lvl_now": "Öğretmenimizin seviyesi",
    "lvl_a1": "İlk selamlaşma; kendini tanıtırsın.",
    "lvl_a2": "Pazarda, takside, restoranda derdini anlatırsın.",
    "lvl_b1": "Günlük hayatı rahat yürütür, başından geçeni anlatırsın.",
    "lvl_b2": "Diziyi altyazısız izler, tartışmaya katılırsın.",
    "lvl_c1": "Üniversite dersini takip eder, resmi işlerini kendin halledersin.",
    "lvl_c2": "Anadili gibi konuşursun.",
```

`messages/en.json`:
```json
    "lvl_eyebrow": "Your roadmap",
    "lvl_title": "From zero to C2 — the road your teacher walked herself",
    "lvl_note": "Our teacher walked this entire line from zero: she came from Kazakhstan and is at C2 today. Wherever you start, you move forward with someone who knows every step of the road.",
    "lvl_daily": "At every level, daily practice with PetLingo is by your side.",
    "lvl_now": "Our teacher's level",
    "lvl_a1": "First greetings; you introduce yourself.",
    "lvl_a2": "You get by at the market, in a taxi, at a restaurant.",
    "lvl_b1": "You handle daily life with ease and tell what happened to you.",
    "lvl_b2": "You watch series without subtitles and join discussions.",
    "lvl_c1": "You follow university lectures and handle official matters yourself.",
    "lvl_c2": "You speak like a native.",
```

`messages/ru.json`:
```json
    "lvl_eyebrow": "Ваша дорожная карта",
    "lvl_title": "С нуля до C2 — путь, который ваш преподаватель прошла сама",
    "lvl_note": "Наш преподаватель прошла всю эту линию с нуля: приехала из Казахстана, сегодня — уровень C2. С какого бы уровня вы ни начали, вы идёте с человеком, который знает каждый шаг этого пути.",
    "lvl_daily": "На каждом уровне рядом ежедневная практика с PetLingo.",
    "lvl_now": "Уровень нашего преподавателя",
    "lvl_a1": "Первые приветствия; вы представляетесь.",
    "lvl_a2": "Объясняетесь на рынке, в такси, в ресторане.",
    "lvl_b1": "Свободно ведёте быт и рассказываете, что с вами случилось.",
    "lvl_b2": "Смотрите сериалы без субтитров и участвуете в дискуссиях.",
    "lvl_c1": "Понимаете университетские лекции и сами решаете официальные вопросы.",
    "lvl_c2": "Говорите как носитель.",
```

`messages/kk.json`:
```json
    "lvl_eyebrow": "Жол картаңыз",
    "lvl_title": "Нөлден C2-ге дейін — мұғаліміңіз өзі жүріп өткен жол",
    "lvl_note": "Біздің мұғалім осы жолдың бәрін нөлден жүріп өтті: Қазақстаннан келіп, бүгін C2 деңгейінде. Қай деңгейден бастасаңыз да, жолдың әр қадамын білетін адаммен ілгерілейсіз.",
    "lvl_daily": "Әр деңгейде PetLingo-мен күнделікті жаттығу қасыңызда.",
    "lvl_now": "Мұғаліміміздің деңгейі",
    "lvl_a1": "Алғашқы сәлемдесу; өзіңізді таныстырасыз.",
    "lvl_a2": "Базарда, таксиде, мейрамханада ойыңызды жеткізесіз.",
    "lvl_b1": "Күнделікті өмірді еркін жүргізіп, басыңыздан өткенді айтасыз.",
    "lvl_b2": "Сериалды субтитрсіз көріп, пікірталасқа қатысасыз.",
    "lvl_c1": "Университет дәрісін түсініп, ресми істеріңізді өзіңіз шешесіз.",
    "lvl_c2": "Ана тіліндей сөйлейсіз.",
```

`messages/uz.json`:
```json
    "lvl_eyebrow": "Yo'l xaritangiz",
    "lvl_title": "Noldan C2 gacha — o'qituvchingiz o'zi bosib o'tgan yo'l",
    "lvl_note": "O'qituvchimiz bu yo'lning hammasini noldan bosib o'tdi: Qozog'istondan keldi, bugun C2 darajasida. Qaysi darajadan boshlamang, yo'lning har bir qadamini biladigan inson bilan olg'a borasiz.",
    "lvl_daily": "Har darajada PetLingo bilan kundalik mashq yoningizda.",
    "lvl_now": "O'qituvchimizning darajasi",
    "lvl_a1": "Birinchi salomlashuv; o'zingizni tanishtirasiz.",
    "lvl_a2": "Bozorda, taksida, restoranda fikringizni yetkazasiz.",
    "lvl_b1": "Kundalik hayotni bemalol boshqarib, boshingizdan o'tganni aytib berasiz.",
    "lvl_b2": "Serialni subtitrsiz ko'rib, munozaraga qo'shilasiz.",
    "lvl_c1": "Universitet darsini tushunib, rasmiy ishlaringizni o'zingiz hal qilasiz.",
    "lvl_c2": "Ona tilidek gapirasiz.",
```

- [ ] **Step 2: `components/level-path.tsx` oluştur** (server bileşeni — client JS yok, tam içerik):

```tsx
import { Reveal } from "./reveal";

export type LevelStep = {
  code: string;
  text: string;
  /** Öğretmenin bugünkü seviyesi — altın rozetle vurgulanır. */
  now?: boolean;
};

/**
 * 0'dan C2'ye seviye yolu — öğretmenin bizzat yürüdüğü çizgi.
 * Mobilde dikey zaman çizgisi, sm+ ekranda 2/3 sütunlu grid.
 * Kanıt anlatısı: her seviyede "neyi konuşabilir hale gelirsin" + C2'de
 * öğretmen rozeti. Animasyon Reveal ile (prefers-reduced-motion'da nötrlenir).
 */
export function LevelPath({
  eyebrow,
  title,
  note,
  daily,
  nowLabel,
  levels,
}: {
  eyebrow: string;
  title: string;
  note: string;
  daily: string;
  nowLabel: string;
  levels: LevelStep[];
}) {
  return (
    <section className="py-24 sm:py-28" style={{ backgroundColor: "rgb(var(--muted) / 0.5)" }}>
      <div className="container-wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{eyebrow}</p>
          <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>{title}</h2>
          <p className="mt-5 text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{note}</p>
        </Reveal>

        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((lv, i) => (
            <Reveal as="li" key={lv.code} delay={i * 80} className="h-full">
              <div
                className="card-lift relative flex h-full items-start gap-4 rounded-3xl border p-5"
                style={{
                  borderColor: lv.now ? "rgb(var(--gold) / 0.6)" : "rgb(var(--border))",
                  backgroundColor: "rgb(var(--card))",
                  ...(lv.now ? { boxShadow: "0 18px 40px -20px rgb(var(--gold) / 0.5)" } : {}),
                }}
              >
                <span className="font-display grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg font-semibold text-white" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}>
                  {lv.code}
                </span>
                <div>
                  {lv.now ? (
                    <span className="mb-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: "rgb(var(--gold) / 0.15)", color: "rgb(var(--gold))" }}>
                      ★ {nowLabel}
                    </span>
                  ) : null}
                  <p className="text-[14.5px] font-medium leading-relaxed" style={{ color: "rgb(var(--foreground))" }}>{lv.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={120} className="mt-9">
          <p className="mx-auto flex max-w-xl items-center justify-center gap-2.5 rounded-full border px-5 py-3 text-center text-[13.5px] font-semibold" style={{ borderColor: "rgb(var(--primary) / 0.35)", backgroundColor: "rgb(var(--primary) / 0.07)", color: "rgb(var(--primary))" }}>
            <span aria-hidden>🐾</span>{daily}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `app/[locale]/lessons/page.tsx` — bölümü ekle**

Import (mevcut import bloğuna): `import { LevelPath } from "@/components/level-path";`

`sectionBlocks` dizisinde `["lessons.teacher", ...]` bloğunun kapanışından (`)],`) hemen sonra ekle:
```tsx
    ["lessons.levelPath", (
      /* 0'dan C2'ye yol — öğretmenin bizzat yürüdüğü çizgi (kanıt anlatısı) */
      <LevelPath
        eyebrow={x("lvl_eyebrow")}
        title={x("lvl_title")}
        note={x("lvl_note")}
        daily={x("lvl_daily")}
        nowLabel={x("lvl_now")}
        levels={[
          { code: "A1", text: x("lvl_a1") },
          { code: "A2", text: x("lvl_a2") },
          { code: "B1", text: x("lvl_b1") },
          { code: "B2", text: x("lvl_b2") },
          { code: "C1", text: x("lvl_c1") },
          { code: "C2", text: x("lvl_c2"), now: true },
        ]}
      />
    )],
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: hatasız. (Not: `Reveal`'ın `as="li"` prop'u mevcut — reveal.tsx:13.)

- [ ] **Step 5: Commit**

```bash
git add messages/ components/level-path.tsx "app/[locale]/lessons/page.tsx"
git commit -m "feat(lessons): 0'dan C2'ye seviye yolu — öğretmenin yürüdüğü çizgi"
```

---

### Task 6: FAQ genişletme (12 yeni soru — AI/Google görünürlüğü)

**Files:**
- Modify: `messages/*.json` (5 dosya; `faq` namespace'ine 24 anahtar: q5-q16, a5-a16)
- Modify: `app/[locale]/faq/page.tsx` (items dizisi 16 soruya çıkar)

**Interfaces:**
- Consumes: mevcut `faq.q1-q4/a1-a4`; `getFaqExtrasFor(locale)` (değişmez, sona eklenmeye devam eder).
- Produces: FAQPage JSON-LD otomatik 16 soruyu kapsar (faq/page.tsx:69-78 items'tan türetiyor — kod değişikliği JSON-LD için gerekmez). Ana sayfa mini-FAQ 4 soruda KALIR (dokunma).

- [ ] **Step 1: Çeviri anahtarları — `faq` namespace'i, `"a4"` anahtarından sonra**

`messages/tr.json`:
```json
    "q5": "Hazır paket fiyatına neler dahil?",
    "a5": "Rotaya göre otel, havalimanı transferi, gün gün gezi planı ve rehberli girişler dahildir; uçak bileti talebe göre ayarlanır. Her paketin kartında 'pakete dahil' listesi ayrıca yazar.",
    "q6": "Havalimanı transferi var mı?",
    "a6": "Evet. İnişte sizi karşılar, kapıdan kapıya otele ulaştırırız; dönüşte de aynı şekilde.",
    "q7": "Tatil planı çıkarmak ücretli mi?",
    "a7": "Hayır — plan çıkarmak ücretsiz ve taahhütsüz. Yalnızca üzerinde anlaştığımız hizmet için ödersiniz; ödemeden önce net anlaşma yazılı olarak elinizde olur.",
    "q8": "Çocuklu aile için uygun mu?",
    "a8": "Evet. Otel ve rotayı kişi sayısına ve çocukların yaşına göre seçeriz; Land of Legends gibi aile rotalarımız hazır.",
    "q9": "Zoom dersi kaç dakika sürüyor?",
    "a9": "15, 30 veya 60 dakikalık seanslar var; randevuyu takvimden kendiniz seçersiniz. İlk seviye tespiti ücretsizdir.",
    "q10": "PetLingo derse dahil mi?",
    "a10": "Evet — Türkçe dersi alan herkese kendi uygulamamız PetLingo ücretsiz. Ders aralarında oyunlaştırılmış tekrar ve sesli telaffuz pratiği yaparsınız.",
    "q11": "Hiç Türkçe bilmiyorum, başlayabilir miyim?",
    "a11": "Evet. Öğretmenimizin anadili Kazakça ve Rusça, Türkçesi C2 — sizin dilinizde başlar, Türkçeye birlikte geçersiniz. Kendisi de Türkçeye sıfırdan başladı.",
    "q12": "Hangi seviyeden başlayacağımı nasıl bilirim?",
    "a12": "İlk derste ücretsiz seviye tespiti yaparız ve hedefinize göre kişisel bir plan çıkarırız.",
    "q13": "Türkiye Bursları başvurusu ücretli mi?",
    "a13": "Türkiye Bursları'na başvurmak tamamen ücretsizdir; YTB hiçbir ücret almaz. Bizim hizmetimiz, başvuru dosyanızı güçlendirme ve süreci adım adım yönetme danışmanlığıdır.",
    "q14": "Başvuru için hangi belgeler gerekiyor?",
    "a14": "Genellikle diploma/transkript, kimlik, niyet mektubu ve referanslar istenir; programa göre değişir. Listeyi durumunuza göre birlikte netleştirir, eksiksiz hazırlarız.",
    "q15": "Burs mülakatına nasıl hazırlanıyorsunuz?",
    "a15": "Bu mülakat sürecini bizzat geçmiş biriyle deneme mülakatı yapar; sık sorulan soruları ve niyet mektubunuzu birlikte çalışırız.",
    "q16": "Burs çıkmazsa ne olur?",
    "a16": "Türkiye Bursları tek yol değil. Devlet ve vakıf üniversitelerinin kendi burs ve kabul seçeneklerini birlikte değerlendirir, dürüst bir B planı çıkarırız.",
```

`messages/en.json`:
```json
    "q5": "What's included in a ready package price?",
    "a5": "Depending on the route: hotel, airport transfer, day-by-day itinerary and guided entries; flights are arranged on request. Each package card also lists exactly what's included.",
    "q6": "Is airport transfer included?",
    "a6": "Yes. We meet you at arrival and take you door-to-door to your hotel — and back the same way.",
    "q7": "Does getting a vacation plan cost anything?",
    "a7": "No — planning is free and non-binding. You only pay for the service we agree on, and you get a clear written agreement before any payment.",
    "q8": "Is it suitable for families with children?",
    "a8": "Yes. We pick the hotel and route based on group size and children's ages; family routes like Land of Legends are ready.",
    "q9": "How long is a Zoom lesson?",
    "a9": "Sessions are 15, 30 or 60 minutes; you pick the slot from the calendar yourself. The first level assessment is free.",
    "q10": "Is PetLingo included with lessons?",
    "a10": "Yes — everyone taking Turkish lessons gets our own app PetLingo for free. Between lessons you practice with gamified review and voiced pronunciation.",
    "q11": "I don't know any Turkish — can I start?",
    "a11": "Yes. Our teacher is a native Kazakh and Russian speaker with C2 Turkish — she starts in your language and you switch to Turkish together. She started Turkish from zero herself.",
    "q12": "How do I know which level to start from?",
    "a12": "In the first lesson we run a free level assessment and build a personal plan around your goal.",
    "q13": "Does applying to Türkiye Scholarships cost money?",
    "a13": "Applying to Türkiye Bursları is completely free; YTB charges nothing. Our service is consulting: strengthening your application file and managing the process step by step.",
    "q14": "Which documents are needed for the application?",
    "a14": "Usually diploma/transcript, ID, letter of intent and references; it varies by program. We finalize the list for your case together and prepare it in full.",
    "q15": "How do you prepare me for the scholarship interview?",
    "a15": "You do a mock interview with someone who went through this exact process, and we work on frequent questions and your letter of intent together.",
    "q16": "What if I don't get the scholarship?",
    "a16": "Türkiye Bursları isn't the only road. We evaluate state and foundation universities' own scholarship and admission options together and build you an honest plan B.",
```

`messages/ru.json`:
```json
    "q5": "Что входит в цену готового пакета?",
    "a5": "В зависимости от маршрута: отель, трансфер из аэропорта, план по дням и входы с гидом; авиабилеты — по запросу. На карточке каждого пакета отдельно указано, что включено.",
    "q6": "Есть ли трансфер из аэропорта?",
    "a6": "Да. Встречаем по прилёте и довозим до отеля от двери до двери — и обратно так же.",
    "q7": "План отпуска — это платно?",
    "a7": "Нет — составление плана бесплатно и ни к чему не обязывает. Вы платите только за услугу, о которой мы договорились, и до оплаты получаете чёткое письменное соглашение.",
    "q8": "Подходит ли для семей с детьми?",
    "a8": "Да. Отель и маршрут подбираем под состав семьи и возраст детей; семейные маршруты вроде Land of Legends уже готовы.",
    "q9": "Сколько длится урок в Zoom?",
    "a9": "Сессии по 15, 30 или 60 минут; время вы выбираете сами в календаре. Первое определение уровня — бесплатно.",
    "q10": "PetLingo входит в уроки?",
    "a10": "Да — все, кто берёт уроки турецкого, получают наше приложение PetLingo бесплатно. Между уроками вы закрепляете материал в играх и с озвученным произношением.",
    "q11": "Я совсем не знаю турецкий — можно начать?",
    "a11": "Да. Родные языки нашего преподавателя — казахский и русский, турецкий — C2. Она начинает на вашем языке, и вы вместе переходите на турецкий. Сама она начинала турецкий с нуля.",
    "q12": "Как понять, с какого уровня начинать?",
    "a12": "На первом уроке бесплатно определяем уровень и строим личный план под вашу цель.",
    "q13": "Подача на Türkiye Bursları — платная?",
    "a13": "Подача на Türkiye Bursları полностью бесплатна; YTB не берёт никаких сборов. Наша услуга — консультация: усиление вашего досье и пошаговое ведение процесса.",
    "q14": "Какие документы нужны для заявки?",
    "a14": "Обычно диплом/транскрипт, удостоверение личности, мотивационное письмо и рекомендации; зависит от программы. Уточняем список под ваш случай и готовим его полностью.",
    "q15": "Как вы готовите к собеседованию на стипендию?",
    "a15": "Пробное собеседование с человеком, который сам прошёл этот процесс; вместе разбираем частые вопросы и ваше мотивационное письмо.",
    "q16": "А если стипендию не дадут?",
    "a16": "Türkiye Bursları — не единственный путь. Вместе рассматриваем собственные стипендии и варианты поступления государственных и частных университетов и строим честный план Б.",
```

`messages/kk.json`:
```json
    "q5": "Дайын пакет бағасына не кіреді?",
    "a5": "Бағытқа қарай: қонақүй, әуежай трансфері, күн сайынғы жоспар және гидпен кірулер; әуе билеті сұраныс бойынша реттеледі. Әр пакеттің картасында не кіретіні бөлек жазылған.",
    "q6": "Әуежай трансфері бар ма?",
    "a6": "Иә. Қонған кезде қарсы алып, есіктен есікке дейін қонақүйге жеткіземіз — қайтарда да солай.",
    "q7": "Демалыс жоспарын жасау ақылы ма?",
    "a7": "Жоқ — жоспар жасау тегін және міндеттемесіз. Тек келіскен қызмет үшін төлейсіз; төлемнен бұрын нақты жазбаша келісім қолыңызда болады.",
    "q8": "Балалы отбасына қолайлы ма?",
    "a8": "Иә. Қонақүй мен бағытты адам санына және балалардың жасына қарай таңдаймыз; Land of Legends сияқты отбасылық бағыттар дайын.",
    "q9": "Zoom сабағы қанша минутқа созылады?",
    "a9": "15, 30 немесе 60 минуттық сеанстар бар; уақытты күнтізбеден өзіңіз таңдайсыз. Алғашқы деңгей анықтау — тегін.",
    "q10": "PetLingo сабаққа кіре ме?",
    "a10": "Иә — түрік тілі сабағын алатындардың бәріне өз қосымшамыз PetLingo тегін. Сабақ аралығында ойын түрінде қайталап, дауысты айтылыммен жаттығасыз.",
    "q11": "Түрікше мүлдем білмеймін — бастай аламын ба?",
    "a11": "Иә. Мұғаліміміздің ана тілі — қазақ және орыс тілдері, түрікшесі — C2. Сіздің тіліңізде бастап, түрікшеге бірге көшесіздер. Өзі де түрікшені нөлден бастаған.",
    "q12": "Қай деңгейден бастайтынымды қалай білемін?",
    "a12": "Алғашқы сабақта деңгейді тегін анықтап, мақсатыңызға қарай жеке жоспар құрамыз.",
    "q13": "Türkiye Bursları-ға өтінім беру ақылы ма?",
    "a13": "Türkiye Bursları-ға өтінім беру мүлдем тегін; YTB ешқандай ақы алмайды. Біздің қызмет — кеңес беру: өтінім құжаттарыңызды күшейту және процесті қадам-қадаммен жүргізу.",
    "q14": "Өтінімге қандай құжаттар қажет?",
    "a14": "Әдетте диплом/транскрипт, жеке куәлік, ниет хаты және ұсынымдар; бағдарламаға байланысты. Тізімді жағдайыңызға қарай бірге нақтылап, толық дайындаймыз.",
    "q15": "Стипендия сұхбатына қалай дайындайсыздар?",
    "a15": "Бұл сұхбат процесінен өзі өткен адаммен сынақ сұхбатын өткізіп, жиі қойылатын сұрақтар мен ниет хатыңызды бірге пысықтаймыз.",
    "q16": "Стипендия берілмесе не болады?",
    "a16": "Türkiye Bursları — жалғыз жол емес. Мемлекеттік және қор университеттерінің өз стипендиялары мен қабылдау мүмкіндіктерін бірге қарастырып, адал Б жоспарын құрамыз.",
```

`messages/uz.json`:
```json
    "q5": "Tayyor paket narxiga nima kiradi?",
    "a5": "Yo'nalishga qarab: mehmonxona, aeroport transferi, kunma-kun reja va gid bilan kirishlar; aviachipta so'rov bo'yicha. Har paket kartasida nima kirishi alohida yozilgan.",
    "q6": "Aeroport transferi bormi?",
    "a6": "Ha. Qo'nganingizda kutib olamiz va eshikdan eshikkacha mehmonxonaga yetkazamiz — qaytishda ham xuddi shunday.",
    "q7": "Dam olish rejasini tuzish pullikmi?",
    "a7": "Yo'q — reja tuzish bepul va majburiyatsiz. Faqat kelishilgan xizmat uchun to'laysiz; to'lovdan oldin aniq yozma kelishuv qo'lingizda bo'ladi.",
    "q8": "Bolali oilalar uchun mosmi?",
    "a8": "Ha. Mehmonxona va yo'nalishni odam soni va bolalar yoshiga qarab tanlaymiz; Land of Legends kabi oilaviy yo'nalishlar tayyor.",
    "q9": "Zoom darsi necha daqiqa davom etadi?",
    "a9": "15, 30 yoki 60 daqiqalik seanslar bor; vaqtni taqvimdan o'zingiz tanlaysiz. Birinchi daraja aniqlash — bepul.",
    "q10": "PetLingo darsga kiradimi?",
    "a10": "Ha — turk tili darsini olganlarning hammasiga o'z ilovamiz PetLingo bepul. Darslar orasida o'yin tarzida takrorlab, ovozli talaffuz bilan mashq qilasiz.",
    "q11": "Turkchani umuman bilmayman — boshlay olamanmi?",
    "a11": "Ha. O'qituvchimizning ona tillari — qozoq va rus tillari, turkchasi — C2. Sizning tilingizda boshlab, turkchaga birga o'tasizlar. O'zi ham turkchani noldan boshlagan.",
    "q12": "Qaysi darajadan boshlashimni qanday bilaman?",
    "a12": "Birinchi darsda darajani bepul aniqlab, maqsadingizga mos shaxsiy reja tuzamiz.",
    "q13": "Türkiye Bursları'ga ariza berish pullikmi?",
    "a13": "Türkiye Bursları'ga ariza berish mutlaqo bepul; YTB hech qanday haq olmaydi. Bizning xizmatimiz — maslahat: ariza hujjatlaringizni kuchaytirish va jarayonni bosqichma-bosqich boshqarish.",
    "q14": "Ariza uchun qanday hujjatlar kerak?",
    "a14": "Odatda diplom/transkript, shaxsiy hujjat, niyat xati va tavsiyalar; dasturga qarab o'zgaradi. Ro'yxatni holatingizga qarab birga aniqlashtirib, to'liq tayyorlaymiz.",
    "q15": "Stipendiya suhbatiga qanday tayyorlaysizlar?",
    "a15": "Bu jarayondan o'zi o'tgan inson bilan sinov suhbatini o'tkazamiz; tez-tez so'raladigan savollar va niyat xatingizni birga ishlaymiz.",
    "q16": "Stipendiya chiqmasa nima bo'ladi?",
    "a16": "Türkiye Bursları — yagona yo'l emas. Davlat va vaqf universitetlarining o'z stipendiya va qabul imkoniyatlarini birga ko'rib chiqib, halol B rejasini tuzamiz.",
```

- [ ] **Step 2: `app/[locale]/faq/page.tsx` — items'ı 16'ya çıkar**

Satır 39-45'teki items tanımını şununla değiştir:
```tsx
  const extras = await getFaqExtrasFor(locale);
  // 16 sabit soru (q1-q16) + admin'den eklenen ekstralar.
  const items = [
    ...Array.from({ length: 16 }, (_, i) => ({ q: t(`q${i + 1}`), a: t(`a${i + 1}`) })),
    ...extras,
  ];
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: hatasız.

- [ ] **Step 4: Commit**

```bash
git add messages/ "app/[locale]/faq/page.tsx"
git commit -m "feat(faq): 12 yeni soru-cevap — 3 hizmet için itiraz giderme + AI görünürlüğü"
```

---

### Task 7: Uçtan uca doğrulama (build + preview + değişmezlik kontrolleri)

**Files:** yok (salt doğrulama; bulgu çıkarsa ilgili görevin dosyasında düzeltilir)

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: hatasız derleme; tüm locale sayfaları üretilir. `MISSING_MESSAGE` uyarısı görülürse ilgili json dosyasında anahtar eksik demektir — düzelt.

- [ ] **Step 2: Değişmezlik kontrolleri**

```bash
git diff --name-only 17631a6..HEAD -- components/dive-hero.tsx
git diff --diff-filter=DM --name-only 17631a6..HEAD -- public/
```
Expected: HER İKİ komut da BOŞ çıktı verir (hero'ya dokunulmadı; public'te silme/değiştirme yok — yalnız founders.jpg EKLENDİ, o `--diff-filter=A` kapsamındadır ve listelenmez).

- [ ] **Step 3: Preview doğrulaması** (preview_start → localhost)

Kontrol listesi:
1. `/tr` — hero birebir aynı; hemen altında fark şeridi; otel kartlarında WhatsApp butonu (WHATSAPP_NUMBER ayarlıysa) ve tıklanınca `wa.me/...?text=Merhaba!%20Cullinan...` formatında link.
2. `/tr/education` — 6 adımlı yolculuk kayarak ilerliyor; her adımda altın "Bu adımda biz" kutusu.
3. `/tr/lessons` — öğretmen bandından sonra A1→C2 yolu; C2 kartında ★ rozet.
4. `/tr/about` — founders.jpg + altında "Temsili görsel" ibaresi.
5. `/tr/faq` — 16 soru; sayfa kaynağında FAQPage JSON-LD 16 `Question` içeriyor.
6. `/en`, `/ru`, `/kk` için 1-5'in örneklem kontrolü (en az başlıklar doğru dilde).
7. Mobil (375px, preview_resize): fark şeridi alt alta düzgün; yolculuk kartları taşmıyor; seviye kartları tek sütun.
8. Reduced-motion: StudyJourney statik karta düşüyor (mevcut davranış — bozulmamış olmalı).
9. Konsolda hata yok (preview_console_logs).

- [ ] **Step 4: Bağımsız kod incelemesi**

Sonnet subagent'a `git diff 17631a6..HEAD` incelet: JSON sözdizimi, çeviri anahtar paritesi (5 dosyada aynı anahtarlar), i18n placeholder tutarlılığı (`{name}`), registry id çakışması olmadığı.

- [ ] **Step 5: Son commit (bulgu düzeltmeleri varsa)**

```bash
git add -A && git commit -m "fix: doğrulama bulguları — kanıt katmanı rötuşları"
```
(Bulgu yoksa bu adım atlanır.)
