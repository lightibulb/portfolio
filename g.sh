#!/usr/bin/env bash
set -euo pipefail

echo "📁 Creating theme directories (d/, r/, c/)..."
mkdir -p d r c

echo "🎨 Generating independent CSS files..."

# ------------------------------------------------------------------------------
# DARK THEME CSS (d/style.css) - Minimalist Charcoal
# ------------------------------------------------------------------------------
cat << 'EOF' > d/style.css
:root {
  --bg: #0a0a0c; --text: #f2efea; --text-dim: #96938f; --text-faint: #63615f;
  --border: rgba(255,255,255,0.09); --border-strong: rgba(255,255,255,0.2); --rule: rgba(255,255,255,0.08);
  --accent: #e8e2d9; --accent-2: #c9a87c; --surface: rgba(255,255,255,0.022);
  --font-display: "Instrument Serif", Georgia, serif; --font-sans: "Inter", sans-serif; --font-mono: "JetBrains Mono", monospace;
}
body { background-color: var(--bg); color: var(--text); font-family: var(--font-sans); }
h1, h2, h3, .hero__title { font-family: var(--font-display); font-weight: 400; }
.bg__grid { opacity: 0.024; } .bg__orb { display: block; }
.bg__scan { display: none; }
.card, .approach__card, .journey__card, .interest { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
EOF

# ------------------------------------------------------------------------------
# RICH THEME CSS (r/style.css) - Premium Cream, Fraunces, Color Blocks
# ------------------------------------------------------------------------------
cat << 'EOF' > r/style.css
:root {
  --bg: #F1EADA; /* Cream */
  --text: #1A1512; /* Espresso */
  --text-dim: #4A3F35; --text-faint: #8A7B6A;
  --border: rgba(26,21,18,0.14); --border-strong: rgba(26,21,18,0.3); --rule: rgba(26,21,18,0.1);
  --accent: #B59E7D; /* Gold */
  --accent-2: #4D0E13; /* Burgundy */
  --surface: rgba(26,21,18,0.04); --surface-hover: rgba(26,21,18,0.07);
  --font-display: "Fraunces", serif; --font-sans: "EB Garamond", serif; --font-mono: "JetBrains Mono", monospace;
}
body { background-color: var(--bg); color: var(--text); font-family: var(--font-sans); font-size: 18px; line-height: 1.7; }
h1, h2, h3, .hero__title, .section__title { font-family: var(--font-display); font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
.hero__title > .hero__line > span { background: none; -webkit-text-fill-color: currentColor; color: var(--text); }
.hero__title em { color: var(--accent-2); }

/* Strip old background entirely */
.bg__grid, .bg__orb, .bg__scan, .bg__shape, .bg__vignette { display: none; }
.bg { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"); background-color: var(--bg); }

/* Color-Block Cards */
.card, .approach__card, .journey__card, .interest, .explore__card, .practice, .thread__card, .tech-panel, .topic, .contact-card {
  background-color: #0F2E28; color: #DAF1DE; border: none; border-radius: 2px; box-shadow: 0 20px 40px -20px rgba(26,21,18,0.2); padding: 2rem;
}
/* Navy alternate */
.approach__card:nth-child(2n), .journey__card:nth-child(2n), .interest:nth-child(2n), .explore__card:nth-child(2n), .card:nth-child(2n) {
  background-color: #2F4156; color: #F5EFEB;
}
/* Burgundy alternate */
.journey__card:last-child, .card:nth-child(3n) {
  background-color: #4D0E13; color: #F5EFEB;
}
/* Card text overrides for dark blocks */
.card h3, .approach__card h3, .journey__card h3, .interest h3 { color: #F5EFEB; font-family: var(--font-display); }
.card p, .approach__card p, .journey__card p, .interest p { color: rgba(245, 239, 235, 0.8); }

/* Buttons */
.btn--primary { background-color: var(--accent-2); color: var(--bg); border-radius: 0; }
.btn--ghost { border-color: var(--text); color: var(--text); border-radius: 0; }
.section__label, .hero__label { color: var(--accent); font-family: var(--font-sans); text-transform: uppercase; letter-spacing: 0.15em; }
EOF

# ------------------------------------------------------------------------------
# CYBERPUNK THEME CSS (c/style.css) - Void, HUD, Sharp edges
# ------------------------------------------------------------------------------
cat << 'EOF' > c/style.css
:root {
  --bg: #05020d; --text: #f1f5ff; --text-dim: #aaa6cf; --text-faint: #8985b6;
  --border: rgba(5,217,232,0.22); --border-strong: rgba(5,217,232,0.6); --rule: rgba(5,217,232,0.18);
  --accent: #fcee0a; --accent-2: #ff2a6d; --accent-3: #05d9e8;
  --surface: rgba(12,8,30,0.6); --surface-hover: rgba(24,12,52,0.85);
  --font-display: "Space Grotesk", sans-serif; --font-sans: "JetBrains Mono", monospace; --font-mono: "JetBrains Mono", monospace;
}
body { background-color: var(--bg); color: var(--text); font-family: var(--font-sans); }
h1, h2, h3, .hero__title, .section__title { font-family: var(--font-display); font-weight: 700; text-transform: uppercase; letter-spacing: -0.02em; color: var(--accent-3); }
.hero__title > .hero__line > span { background: none; -webkit-text-fill-color: currentColor; color: var(--text); }
.hero__title em { color: var(--accent-2); }

/* Cyber BG */
.bg__grid { opacity: 0.14; } .bg__orb { display: none; }
.bg__scan { display: block; opacity: 0.55; animation: scan 10s linear infinite; }
@keyframes scan { to { background-position: 0 100px; } }

/* HUD Cards */
.card, .approach__card, .journey__card, .interest, .explore__card, .practice, .thread__card, .tech-panel, .topic, .contact-card {
  background-color: var(--surface); border: 1px solid var(--accent-3); border-radius: 0; box-shadow: none; padding: 1.5rem; position: relative;
}
.card::before, .approach__card::before, .journey__card::before { content: ""; position: absolute; top: -1px; left: -1px; width: 10px; height: 10px; border-top: 1px solid var(--accent-2); border-left: 1px solid var(--accent-2); }
.card h3, .approach__card h3, .journey__card h3 { color: var(--accent-3); font-family: var(--font-display); text-transform: uppercase; }
.card p, .approach__card p { color: var(--text-dim); }

/* Buttons */
.btn { border-radius: 0; text-transform: uppercase; letter-spacing: 0.1em; font-family: var(--font-mono); }
.btn--primary { background-color: var(--accent); color: #000; border-color: var(--accent); }
.btn--ghost { border-color: var(--accent-3); color: var(--accent-3); }
.section__label, .hero__label { color: var(--accent); }
EOF

echo "📄 Copying and updating HTML files..."

# The pages to migrate
pages=("about.html" "skills.html" "projects.html" "experience.html" "contact.html")

for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    for theme in d r c; do
      # 1. Copy the file
      cp "$page" "$theme/$page"
      
      # 2. Fix asset paths (assets/ -> ../assets/)
      sed -i 's|href="assets/|href="../assets/|g' "$theme/$page"
      sed -i 's|src="assets/|src="../assets/|g' "$theme/$page"
      
      # 3. Inject the new specific style.css
      sed -i "s|</head>|  <link rel=\"stylesheet\" href=\"style.css\" />\n</head>|" "$theme/$page"
      
      # 4. Rewrite Navigation links to include the folder
      sed -i 's|href="about.html"|href="about.html"|g' "$theme/$page"
      sed -i 's|href="skills.html"|href="skills.html"|g' "$theme/$page"
      sed -i 's|href="projects.html"|href="projects.html"|g' "$theme/$page"
      sed -i 's|href="experience.html"|href="experience.html"|g' "$theme/$page"
      sed -i 's|href="contact.html"|href="contact.html"|g' "$theme/$page"
      
      # 5. Fix the "Home" brand link and nav link to go back to root
      sed -i 's|href="index.html"|href="../index.html"|g' "$theme/$page"
      
      # 6. Rewrite the Theme Switcher (replacing the old JS buttons with direct routing links)
      # We target the exact block of theme buttons
      perl -0777 -i -pe '
        s{<div class="nav__theme" role="group".*?</div>}{
          <div class="nav__theme" role="group" aria-label="Choose theme">
            <a href="../d/'$page'" class="nav__theme-btn" aria-label="Dark Theme" title="Dark"></a>
            <a href="../r/'$page'" class="nav__theme-btn" aria-label="Rich Theme" title="Rich"></a>
            <a href="../c/'$page'" class="nav__theme-btn" aria-label="Cyberpunk Theme" title="Cyberpunk"></a>
          </div>
        }gsx' "$theme/$page"
        
      # 7. Fix the closing section links (projects.html, contact.html) inside the new folder
      sed -i 's|href="projects.html"|href="projects.html"|g' "$theme/$page"
      sed -i 's|href="contact.html"|href="contact.html"|g' "$theme/$page"
    done
    echo "  ✓ Migrated $page into d/, r/, and c/"
  fi
done

# Update the CSS to style the new anchor-based theme buttons
echo "
/* Make the theme buttons work as links */
.nav__theme-btn { display: inline-block; width: 22px; height: 22px; border-radius: 50%; position: relative; }
.nav__theme-btn::before { content: ''; display: block; width: 10px; height: 10px; border-radius: 50%; position: absolute; top: 6px; left: 6px; }
.nav__theme-btn[aria-label='Dark Theme']::before { background: #0a0a0c; border: 1px solid #fff; }
.nav__theme-btn[aria-label='Rich Theme']::before { background: #F1EADA; border: 1px solid #1A1512; }
.nav__theme-btn[aria-label='Cyberpunk Theme']::before { background: #05d9e8; border: 1px solid #ff2a6d; }
" >> d/style.css
cp d/style.css r/style.css.bak
cp d/style.css c/style.css.bak
# Append the button styles to all three
echo ".nav__theme-btn { display: inline-block; width: 22px; height: 22px; border-radius: 50%; position: relative; }
.nav__theme-btn::before { content: ''; display: block; width: 10px; height: 10px; border-radius: 50%; position: absolute; top: 6px; left: 6px; }
.nav__theme-btn[aria-label='Dark Theme']::before { background: #0a0a0c; border: 1px solid #fff; }
.nav__theme-btn[aria-label='Rich Theme']::before { background: #F1EADA; border: 1px solid #1A1512; }
.nav__theme-btn[aria-label='Cyberpunk Theme']::before { background: #05d9e8; border: 1px solid #ff2a6d; }" >> r/style.css
echo ".nav__theme-btn { display: inline-block; width: 22px; height: 22px; border-radius: 50%; position: relative; }
.nav__theme-btn::before { content: ''; display: block; width: 10px; height: 10px; border-radius: 50%; position: absolute; top: 6px; left: 6px; }
.nav__theme-btn[aria-label='Dark Theme']::before { background: #0a0a0c; border: 1px solid #fff; }
.nav__theme-btn[aria-label='Rich Theme']::before { background: #F1EADA; border: 1px solid #1A1512; }
.nav__theme-btn[aria-label='Cyberpunk Theme']::before { background: #05d9e8; border: 1px solid #ff2a6d; }" >> c/style.css
rm d/style.css.bak r/style.css.bak c/style.css.bak

echo "🏠 Updating root index.html routing..."

# Modify index.html so the "Enter Portfolio" button routes to the selected theme
# The welcome.js handles the actual redirect, but we should make the theme cards route automatically as a fallback
perl -0777 -i -pe '
  # Change the card buttons to route to r/about.html, d/about.html, c/about.html
  s{<button class="card" type="button" data-theme-value="dark"}{<a class="card" href="d/about.html" data-theme-value="dark"}gs;
  s{<button class="card" type="button" data-theme-value="rich"}{<a class="card" href="r/about.html" data-theme-value="rich"}gs;
  s{<button class="card" type="button" data-theme-value="cyberpunk"}{<a class="card" href="c/about.html" data-theme-value="cyberpunk"}gs;
  
  # Close the tags properly
  s{</button>\n        <!-- ── RICH ── -->}{</a>\n        <!-- ── RICH ── -->}gs;
  s{</button>\n        <!-- ── CYBERPUNK ── -->}{</a>\n        <!-- ── CYBERPUNK ── -->}gs;
  s{</button>\n\n      </section>}{</a>\n\n      </section>}gs;
' index.html

echo "✅ Migration complete!"
echo "IMPORTANT: The theme switcher in the nav now acts as a router."
echo "If you are on r/about.html and click 'Dark', it takes you to d/about.html."
