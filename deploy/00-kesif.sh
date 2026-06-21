#!/usr/bin/env bash
# Antalya Bridge — sunucu KEŞİF script'i (SALT-OKUNUR).
#
# Bu script hiçbir şeyi DEĞİŞTİRMEZ. Amaç: sunucuda zaten çalışan DİĞER projeyi
# tanımak ve Antalya Bridge için boş bir port seçebilmek. Çıktıyı bana yapıştır,
# sana özel port/domain/nginx adımlarını netleştireyim.
#
# Çalıştırma:  bash deploy/00-kesif.sh

set -u
line() { printf '\n=== %s ===\n' "$1"; }

line "Sistem"
uname -a 2>/dev/null
echo "Tarih: $(date)"

line "CPU / RAM / Disk"
nproc 2>/dev/null | sed 's/^/CPU çekirdek: /'
free -h 2>/dev/null
df -h / 2>/dev/null

line "Dinlenen portlar (kullanımda olanlar)"
# Hangi portlar dolu? 3000/3010/80/443 burada görünüyorsa dikkat.
if command -v ss >/dev/null 2>&1; then ss -tlnp 2>/dev/null
else netstat -tlnp 2>/dev/null; fi

line "Çalışan Docker container'ları (DİĞER PROJE buradadır)"
if command -v docker >/dev/null 2>&1; then
  docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}' 2>/dev/null
  echo "--- docker compose projeleri ---"
  docker compose ls 2>/dev/null || true
else
  echo "docker bulunamadı"
fi

line "Nginx mevcut mu / site'lar"
if command -v nginx >/dev/null 2>&1; then
  nginx -v 2>&1
  echo "--- sites-enabled ---"; ls -1 /etc/nginx/sites-enabled/ 2>/dev/null
  echo "--- conf.d ---"; ls -1 /etc/nginx/conf.d/ 2>/dev/null
  echo "(server_name'leri görmek için: grep -R server_name /etc/nginx/ )"
else
  echo "nginx (host) bulunamadı — diğer proje farklı bir reverse-proxy kullanıyor olabilir"
fi

line "Yaygın proje dizinleri"
ls -la /opt 2>/dev/null
ls -la /var/www 2>/dev/null
ls -la /srv 2>/dev/null

line "Certbot / SSL"
command -v certbot >/dev/null 2>&1 && certbot certificates 2>/dev/null | grep -E "Certificate Name|Domains" || echo "certbot yok ya da sertifika yok"

printf '\n>>> Keşif bitti. Bu çıktının tamamını kopyalayıp bana gönder.\n'
