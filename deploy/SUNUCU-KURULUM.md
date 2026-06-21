# Antalya Bridge — Sunucu Kurulum Kılavuzu (İZOLE)

Bu kılavuz, Antalya Bridge'i sunucuna **zaten çalışan diğer projeye dokunmadan**
kurar. Her şey kendi Docker projesinde (`antalya-bridge`), kendi dizininde ve
kendi portunda (varsayılan 3010) çalışır.

> ⚠️ **Diğer projeye dokunma kuralı:** Aşağıdaki adımlar yalnızca yeni dosyalar
> ekler ve `antalya-bridge` compose projesini yönetir. Mevcut container'ları,
> mevcut nginx server block'larını veya diğer projenin dizinini **değiştirme**.

> 🔐 **Güvenlik:** Panelde paylaşılan root şifresi açıkta kaldı. Kurulum bitince
> **mutlaka değiştir** ve SSH anahtarına geç (en sonda hatırlatma var).

---

## 0) Keşif — önce ne çalışıyor, hangi portlar dolu?

Repoyu klonlamadan önce sunucuda neyin çalıştığını gör. Bu adım **hiçbir şeyi
değiştirmez**:

```bash
# Geçici olarak repoyu okumak için (veya script'i elle yapıştır):
bash deploy/00-kesif.sh
```

Çıktıda **3010, 3000, 80, 443** portları doluysa bana yapıştır; sana boş bir port
seçip `WEB_HTTP_PORT`'u ve nginx'i ona göre ayarlatayım.

---

## 1) Gereksinimler

Sunucuda Docker + Compose v2 olmalı:

```bash
docker --version && docker compose version
```

Yoksa: `curl -fsSL https://get.docker.com | sh`

---

## 2) Repoyu kendi dizinine klonla

Diğer projenin dizinine **girme**; ayrı bir dizin kullan:

```bash
sudo mkdir -p /opt/antalya-bridge
sudo chown "$USER" /opt/antalya-bridge
git clone -b claude/consulting-site-plan-6k4lix <REPO_URL> /opt/antalya-bridge
cd /opt/antalya-bridge
```

---

## 3) Ortam değişkenleri (.env)

```bash
cp .env.production.example .env
nano .env
```

Doldururken:

- `POSTGRES_PASSWORD` ve `DATABASE_URL` içindeki şifre **aynı** ve güçlü olsun.
- `AUTH_SECRET`: `openssl rand -base64 32`
- `ADMIN_PASSWORD`: en az 12 karakter, tahmin edilemez.
- `WEB_HTTP_PORT`: keşifte 3010 doluysa boş bir değere çek (örn. 3011).
- `ANTHROPIC_API_KEY`: bot + AI asistanı için (opsiyonel; yoksa o özellikler kapalı).
- `AI_READONLY_DATABASE_URL`: şimdilik boş bırakabilirsin; 6. adımda dolduracağız.

---

## 4) Başlat (migration + seed otomatik)

```bash
docker compose up -d --build
docker compose logs -f web   # "migrate deploy" + sunucunun ayağa kalkışını izle
```

İlk açılışta `prisma migrate deploy` ve seed otomatik çalışır. Container yalnızca
`127.0.0.1:<WEB_HTTP_PORT>` adresine bağlanır (dışarıya doğrudan açık değil).

Yerel testi:

```bash
curl -I http://127.0.0.1:3010    # (WEB_HTTP_PORT neyse o)
```

---

## 5) Nginx + SSL (mevcut nginx'i bozmadan)

> Sunucuda **host nginx** varsa bu adımı uygula. Diğer proje farklı bir proxy
> kullanıyorsa bana söyle, ona göre uyarlayalım.

```bash
sudo cp deploy/nginx-antalyabridge.conf /etc/nginx/sites-available/antalyabridge
# <DOMAIN>'i gerçek alan adınla değiştir:
sudo sed -i 's/<DOMAIN>/antalyabridge.com/g' /etc/nginx/sites-available/antalyabridge
sudo ln -s /etc/nginx/sites-available/antalyabridge /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d antalyabridge.com -d www.antalyabridge.com
```

`WEB_HTTP_PORT`'u 3010 dışına aldıysan nginx dosyasındaki `proxy_pass ...:3010`
satırını da güncelle.

> DNS: Alan adının A kaydı sunucu IP'sine (`45.67.203.149`) bakmalı.

---

## 6) (Opsiyonel) AI admin asistanı — salt-okunur rol

Admin panelindeki AI asistanının veritabanını **yalnızca okuyabilmesi** için ayrı
bir Postgres rolü oluştur (silme/yazma DB tarafından engellenir):

```bash
# 1) Rol script'inde <GUCLU_SIFRE> yerine güçlü bir parola yaz:
nano prisma/sql/ai_readonly_role.sql

# 2) Script'i uygula:
docker compose exec -T db psql -U antalya -d antalya -f - < prisma/sql/ai_readonly_role.sql

# 3) .env'e salt-okunur URL'i ekle (aynı parolayla) ve yeniden başlat:
#    AI_READONLY_DATABASE_URL="postgresql://ai_readonly:<GUCLU_SIFRE>@db:5432/antalya?schema=public"
nano .env
docker compose up -d
```

Artık `/admin/ai` sayfasında asistan etkin olur.

---

## 7) Doğrulama

- `https://antalyabridge.com` 5 dilde açılıyor, tema/dil seçici çalışıyor.
- `https://antalyabridge.com/admin` → giriş → panel.
- İletişim formu gönder → `/admin/leads`'te görünür + e-posta/Telegram bildirimi.
- (AI açıksa) `/admin/ai`'de "bu ay kaç talep geldi?" → doğru tablo döner;
  "bir kaydı sil" → asistan reddeder, DB de izin vermez.
- **Diğer proje hâlâ çalışıyor mu?** `docker ps` ile teyit et.

---

## 8) Güncelleme (ileride)

```bash
cd /opt/antalya-bridge
git pull origin claude/consulting-site-plan-6k4lix
docker compose up -d --build   # migrate deploy otomatik tekrar çalışır
```

---

## 9) 🔐 KURULUM SONRASI — root şifresini değiştir

```bash
passwd            # yeni güçlü root şifresi
# ve mümkünse SSH anahtarına geçip parola ile girişi kapat:
#   ~/.ssh/authorized_keys'e public key ekle, sonra /etc/ssh/sshd_config:
#   PasswordAuthentication no  →  sudo systemctl restart ssh
```

Sorun olursa: `docker compose logs web` / `docker compose logs db` çıktısını bana gönder.
