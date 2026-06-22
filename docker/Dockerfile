# --- Bağımlılıklar + build ---
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate
# NEXT_PUBLIC_* değişkenleri build zamanında client paketine gömülür. Turnstile
# site key'i (public) burada arg olarak alınır; boşsa captcha widget'ı çıkmaz.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
# Site URL'i build zamanında okunur (canonical/sitemap + güvenlik başlıkları:
# https ise HSTS + upgrade-insecure-requests eklenir, düz http'de eklenmez).
ARG NEXT_PUBLIC_SITE_URL=""
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build
# Seed'i çalıştırılabilir JS'e derle (prod imajında tsx yok; compose seed.js çağırır).
RUN npx tsc prisma/seed.ts --outDir prisma --module commonjs --target es2020 --esModuleInterop --skipLibCheck

# --- Çalışma (standalone) ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma şeması + migration'lar + seed.js (deploy/seed için)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# Prisma CLI (migrate deploy için — ağdan indirme gerekmesin diye imaja gömülür)
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
