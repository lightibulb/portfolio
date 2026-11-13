#!/usr/bin/env bash
# repo-to-txt.sh — dump repo text files into ./EcoFac.txt
set -euo pipefail

if (( BASH_VERSINFO[0] < 4 || (BASH_VERSINFO[0] == 4 && BASH_VERSINFO[1] < 4) )); then
    echo "error: need bash >= 4.4 (found $BASH_VERSION)" >&2; exit 1
fi

REPO_ROOT="${1:-.}"
[[ -d "$REPO_ROOT" ]] || { echo "error: not a directory: $REPO_ROOT" >&2; exit 1; }
cd "$REPO_ROOT"

OUTPUT="portfolio.txt"

# ---- 1. Enumerate -----------------------------------------------------------
# If we're in a git work-tree, git already knows what's "source":
#   --cached            tracked files
#   --others            untracked files…
#   --exclude-standard  …minus anything matched by .gitignore
# .eco.bak, .venv/, __pycache__/, *.pyc, *.egg-info/ are all in .gitignore
# already — git drops them for us. No list to maintain.
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    mapfile -t CANDIDATES < <(git ls-files --cached --others --exclude-standard | sort)
else
    # Fallback for non-git trees — keep the find chain as a safety net.
    mapfile -t CANDIDATES < <(
        find . -type f \
            -not -path './.git/*'                   \
            -not -path '*/.git/*'                   \
            -not -path '*/.eco.bak/*'               \
            -not -path '*/__pycache__/*'            \
            -not -path '*/.mypy_cache/*'            \
            -not -path '*/.pytest_cache/*'          \
            -not -path '*/.ruff_cache/*'            \
            -not -path '*/.tox/*'                   \
            -not -path '*/.eggs/*'                  \
            -not -path '*/.cache/*'                 \
            -not -path '*/.ipynb_checkpoints/*'     \
            -not -path '*/.vscode/*'                \
            -not -path '*/.idea/*'                  \
            -not -path '*/node_modules/*'           \
            -not -path '*/.venv/*'                  \
            -not -path '*/venv/*'                   \
            -not -path '*/env/*'                    \
            -not -path '*/virtualenv/*'             \
            -not -path '*/.virtualenv/*'            \
            -not -path '*/site-packages/*'          \
            -not -path '*/htmlcov/*'                \
            -not -path '*/*.egg-info/*'             \
            -not -path '*/*.dist-info/*'            \
            -not -path '*/.ecofac.bak/*'            \
            -not -path './build/*'                  \
	    -not -path '*.sh'
            -not -path './dist/*'                   \
            -not -name '*.pyc'   -not -name '*.pyo' -not -name '*.pyd' \
            -not -name '*.so'    -not -name '*.dylib' -not -name '*.dll' -not -name '*.exe' \
            -not -name '*.egg'   -not -name '.coverage' -not -name 'coverage.xml' \
            -not -name '*.db'    -not -name '*.sqlite' -not -name '*.sqlite3' \
            -not -name '*.log'   -not -name '.DS_Store' \
            -not -name '*.zip'   -not -name '*.tar'   -not -name '*.tgz'  \
            -not -name '*.gz'    -not -name '*.bz2'   -not -name '*.xz'   -not -name '*.7z' \
            -not -name '*.png'   -not -name '*.jpg'   -not -name '*.jpeg' \
            -not -name '*.gif'   -not -name '*.bmp'   -not -name '*.ico'  \
            -not -name '*.webp'  -not -name '*.svg'   -not -name '*.pdf'  \
            -not -name '*.woff'  -not -name '*.woff2' -not -name '*.ttf'  \
            -not -name '*.otf'   -not -name '*.eot'   \
            -not -name '*.mp3'   -not -name '*.mp4'   -not -name '*.mov'  -not -name '*.wav' \
            | sort
    )
fi

# ---- 2. Filter (self, meta, binary sniff) -----------------------------------
FILES=()
for f in "${CANDIDATES[@]}"; do
    # strip leading ./ that find emits, but git ls-files does not
    f="${f#./}"
    [[ -f "$f" ]] || continue
    # never include our own output or the tree dump
    [[ "$f" == "$OUTPUT"  ]] && continue
    [[ "$f" == "tree.txt" ]] && continue
    # binary sniff
    if [[ -s "$f" ]] && ! grep -Iq . -- "$f" 2>/dev/null; then
        continue
    fi
    FILES+=("$f")
done

# ---- 3. Header + index ------------------------------------------------------
{
    echo "# EcoFac — Whole Project Repository Snapshot"
    echo "# Generated : $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "# Root      : $(pwd)"
    echo "# Files     : ${#FILES[@]}"
    echo ""
    echo "## File Index"
    echo ""
    for f in "${FILES[@]}"; do echo "  $f"; done
    echo ""
} > "$OUTPUT"

# ---- 4. Contents ------------------------------------------------------------
for f in "${FILES[@]}"; do
    {
        echo "======================================================================="
        echo "FILE: $f"
        echo "======================================================================="
        cat -- "$f"
        echo ""
        echo ""
    } >> "$OUTPUT"
done

printf 'Wrote %s — %d files, %s bytes\n' \
       "$OUTPUT" "${#FILES[@]}" "$(wc -c < "$OUTPUT")"
