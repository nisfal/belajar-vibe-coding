# Gunakan official image dari Bun
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# Install dependencies ke dalam temporary directory
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install production dependencies
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Buat image final untuk production
FROM base AS release
# Kopi node_modules production
COPY --from=install /temp/prod/node_modules node_modules
# Kopi seluruh source code aplikasi
COPY . .

# Set environment agar berjalan di mode production (opsional)
ENV NODE_ENV=production

# Fly.io biasanya memberikan nilai PORT secara otomatis
# Namun secara default Elysia biasanya di 3000
EXPOSE 3000/tcp

# Jalankan server
CMD ["bun", "run", "src/index.ts"]
