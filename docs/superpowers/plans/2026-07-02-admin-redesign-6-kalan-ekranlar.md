# Admin Yeniden Tasarım — Faz 6: Kalan Ekranlar + Final — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Kalan tüm admin ekranları Faz 1 diline giydirilir (işlev birebir): dashboard düzeni, listeler (Talepler/Rezervasyonlar/Sohbetler/Satış Defteri/Faturalar/Kayıtlar), formlar (Satış, İndirim Kodları, Ödeme Yöntemleri, Ayarlar, Kullanıcılar), Görseller, Özel Sayfalar (CMS) editörü, Turlar liste sayfası, giriş sayfası (eski `#0c2f39` gradyan kalkar). Ardından tüm-fazlar final incelemesi + deploy.

**Architecture:** Yalnız sunum: `.adm-*` sınıfları + `ui.tsx` bileşenleri zaten yeni dili taşıyor; bu faz sayfa-içi kalıntıları temizler (eski inline stiller, altın/eyebrow kalıntıları, gereksiz büyük başlıklar, ağır kart yapıları) ve spec'in ekran kararlarını uygular (dashboard: metrikler → AI kartı → "Bugün ne yapmalıyım?" → son hareketler, hızlı işlemler KALKAR; listelerde ince çizgili satırlar + tek belirgin aksiyon; formlarda bölümlü tek kolon + yardım satırları + üstte Kaydet).

## Global Constraints

- İşlev/veri birebir: server action'lar, alan adları (`key|||locale`, sır maskeleri "boş=değişmez", SaleForm adları), rotalar, tablo/kart-liste davranışı (masaüstü tablo / telefon kart) DEĞİŞMEZ.
- Public dosyalara dokunulmaz.
- Görev başına `npx tsc --noEmit` + `npm run build` → Türkçe commit + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Dashboard düzeni + giriş sayfası

**Files:** Modify `app/admin/page.tsx`, `app/admin/login/page.tsx`.

- Dashboard sırası: metrik StatCard bandı → AI kartı (mevcut) → "Bugün ne yapmalıyım?" dikkat listesi (satır satır, her satırda "Git →") → son hareketler. **Hızlı işlem kutucukları KALDIRILIR.** Boş dikkat listesi: "her şey yolunda ☀️" korunur. Başlık/selamlama sade.
- Giriş: `#0c2f39` gradyan ve dekoratif kalıntılar kalkar — nötr zemin (`--background`), ortada beyaz kart, logo + iki alan + tek buton; `adm-gold-rule` yerine sade ayraç. Alan adları/action birebir.
- [ ] tsc/build → commit `feat(admin): dashboard sadeleşti + giriş sayfası nötr temaya geçti`

### Task 2: Gelen Kutusu + Kayıtlar listeleri (leads, booking, conversations, audit)

**Files:** Modify `app/admin/leads/page.tsx`, `app/admin/booking/page.tsx`, `app/admin/conversations/page.tsx`, `app/admin/audit/page.tsx`.

- Kalıp: PageHeader sade (eyebrow kaldır ya da nötr) → ince çizgili satır listesi/tablo (`adm-card` tek konteyner, satırlar `border-top`), durum `Badge` sakin tonlar, satırda TEK belirgin aksiyon, boş durum `EmptyState` davet diliyle. Masaüstü tablo / mobil kart davranışı korunur (mevcut responsive yapı neyse dokunma, sadece stil).
- İşlev (durum değiştirme formları, slot aç/kapat, sohbet detayları) birebir.
- [ ] tsc/build → commit `style(admin): gelen kutusu + kayıtlar listeleri yeni dile giydirildi`

### Task 3: Satış & Para ekranları (sales, invoices, promos, payments)

**Files:** Modify `app/admin/sales/page.tsx`, `app/admin/sales/[id]/page.tsx`, `app/admin/sales/sale-form.tsx`, `app/admin/invoices/page.tsx`, `app/admin/promos/page.tsx`, `app/admin/payments/page.tsx`.

- Listeler Task 2 kalıbı; formlar: bölümlü tek kolon (`Section`/`Field`), her alan altında kısa yardım ("müşteri görmez" vb. mevcut metinler korunur/taşınır), Kaydet üstte sabit (mevcut `adm-sticky-save` mobilde kalabilir). SaleForm input adları/datalist'ler birebir.
- [ ] tsc/build → commit `style(admin): satış & para ekranları yeni dile giydirildi`

### Task 4: Ayarlar + Kullanıcılar + Görseller + Turlar listesi + Özel Sayfalar

**Files:** Modify `app/admin/settings/page.tsx`, `app/admin/users/page.tsx`, `app/admin/media/page.tsx` (+`media-grid.tsx`, `upload-form.tsx` gerekirse), `app/admin/tours/page.tsx` (+`components/admin/tours-list.tsx`), `app/admin/pages/page.tsx`, `app/admin/pages/[id]/page.tsx`.

- Ayarlar: gruplu bölümler, sır maskele davranışı birebir. Kullanıcılar: liste+form Task 2/3 kalıbı; koruma mantıkları (son admin vb.) dokunulmaz. Görseller: ızgara + "Kullanımda" rozeti + sil korunur, kart stili sadeleşir. Turlar listesi: kartlar yeni dile (sitedeki kart görünümü korunabilir, çerçeve sadeleşir). Özel Sayfalar: blok editörü işlevleri (sürükle, önizleme iframe, yayınla switch, tehlikeli bölge) birebir, görünüm sadeleşir.
- [ ] tsc/build → commit `style(admin): ayarlar/kullanıcılar/görseller/turlar/özel sayfalar yeni dile giydirildi`

### Task 5: Final — tüm-dal incelemesi + deploy + DEVRIM (kontrolör)

- [ ] Ledger'daki tüm Minor bulgular listelenip final incelemeye verilir (merge_base = Faz 1 başlangıcı `2da8fff`)
- [ ] Critical/Important çıkarsa TEK fix görevine toplanır
- [ ] Deploy + canlı tur (public 7 sayfa 200 + admin login 200 + CSS işaretleri)
- [ ] DEVRIM Rev 29/30 + memory güncellemesi
