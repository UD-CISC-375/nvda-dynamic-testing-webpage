# syntax=docker/dockerfile:1
# Builds this site and serves it with nginx. Used by compose.yaml; the build
# context is this repo, either your local copy or a branch that Docker clones
# from GitHub.

# Stage 1: build the static files. Node 20 matches .github/workflows/main.yml.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Same as main.yml: with CI set, Create React App fails the build on lint warnings.
RUN CI=false npm run build

# Stage 2: serve the files. Only nginx and the built site end up in this image.
FROM nginx:1.31-alpine

# ---------------------------------------------------------------------------
# Helper file: nginx settings (/etc/nginx/conf.d/default.conf)
# Written into the image only; it is not a file in this repo.
#
# Why it's needed: "homepage" in package.json hard-codes the GitHub Pages
# path /nvda-dynamic-testing-webpage/ into every link in the build, so the
# site has to be served under that path (see the last line of this file).
# These settings send / to that path and keep nginx's redirects working
# through a published port like 8080. The tests don't need them; they're for
# people viewing the site.
# ---------------------------------------------------------------------------
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    root /usr/share/nginx/html;

    # Keep redirects relative ("/path/", not "http://localhost/path/") so they
    # still work when the site is reached through a published port like 8080.
    absolute_redirect off;

    # Send / to the site, which lives under /nvda-dynamic-testing-webpage/.
    location = / {
        return 302 /nvda-dynamic-testing-webpage/;
    }
}
EOF

# Served under the hard-coded path described above, the same one GitHub Pages uses.
COPY --from=build /app/build /usr/share/nginx/html/nvda-dynamic-testing-webpage
