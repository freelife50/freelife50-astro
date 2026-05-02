#!/usr/bin/env python3
"""
Phase 3: Extract English content from bilingual JA articles.
Creates separate EN .md files and cleans the original JA .md files.

Usage: python3 scripts/extract-en-bilingual.py [--dry-run] [--article filename.md]
"""

import re
import sys
import os
from pathlib import Path
from datetime import date as Date

BLOG_DIR = Path("/Users/asa/Documents/freelife50-astro/src/content/blog")
ASTRO_CONFIG = Path("/Users/asa/Documents/freelife50-astro/astro.config.mjs")
LOG_PATH = Path("/Users/asa/Documents/freelife50-astro/docs/domain-migration/2026-05-extract-en-log.md")

DRY_RUN = "--dry-run" in sys.argv
SINGLE_FILE = None
for arg in sys.argv[1:]:
    if not arg.startswith("--"):
        SINGLE_FILE = arg

# ──────────────────────────────────────────────────────────────
# Language detection helpers
# ──────────────────────────────────────────────────────────────

def strip_tags(html):
    return re.sub(r'<[^>]+>', '', html)

def strip_urls(text):
    return re.sub(r'https?://\S+', '', text)

def cjk_ratio(text):
    """Ratio of CJK/Hiragana/Katakana characters in cleaned text."""
    clean = re.sub(r'\s+', '', strip_urls(strip_tags(text)))
    if not clean:
        return 0.0
    cjk = len(re.findall(r'[　-鿿豈-﫿가-힯＀-￯]', clean))
    return cjk / len(clean)

def is_en(text):
    return cjk_ratio(text) < 0.05

def is_ja(text):
    return cjk_ratio(text) > 0.22

def ascii_ratio_body(text):
    """ASCII ratio of plain text (no tags, no whitespace)."""
    clean = re.sub(r'\s+', '', strip_urls(strip_tags(text)))
    if not clean:
        return 0.0
    return sum(1 for c in clean if ord(c) < 128) / len(clean)

# ──────────────────────────────────────────────────────────────
# Frontmatter parser
# ──────────────────────────────────────────────────────────────

def parse_frontmatter(content):
    """Parse YAML frontmatter. Returns (dict, body_str)."""
    if not content.startswith('---'):
        return {}, content
    end = content.find('\n---', 3)
    if end == -1:
        return {}, content
    fm_str = content[3:end].strip()
    body = content[end + 4:].lstrip('\n')
    fm = {}
    i = 0
    lines = fm_str.split('\n')
    while i < len(lines):
        line = lines[i]
        # Inline array: key: ["a", "b"]
        m = re.match(r'^(\w+):\s*\[(.+)\]', line)
        if m:
            fm[m.group(1)] = re.findall(r'"([^"]*)"', m.group(2)) or [v.strip() for v in m.group(2).split(',')]
            i += 1
            continue
        # Multi-line array
        m = re.match(r'^(\w+):\s*$', line)
        if m:
            key = m.group(1)
            items = []
            i += 1
            while i < len(lines) and lines[i].startswith('  - '):
                items.append(lines[i][4:].strip().strip('"'))
                i += 1
            fm[key] = items
            continue
        # Quoted string value
        m = re.match(r'^(\w+):\s*"(.*)"$', line)
        if m:
            fm[m.group(1)] = m.group(2)
            i += 1
            continue
        # Unquoted value
        m = re.match(r'^(\w+):\s*(.+)$', line)
        if m:
            fm[m.group(1)] = m.group(2).strip()
            i += 1
            continue
        i += 1
    return fm, body

def format_frontmatter(fm):
    """Serialize frontmatter dict back to YAML string."""
    lines = ['---']
    for key in ['title', 'date', 'slug', 'categories', 'tags', 'eyecatch', 'lang', 'excerpt']:
        if key not in fm:
            continue
        val = fm[key]
        if isinstance(val, list):
            items = ', '.join(f'"{v}"' for v in val)
            lines.append(f'{key}: [{items}]')
        else:
            val_esc = str(val).replace('\\', '\\\\').replace('"', '\\"')
            lines.append(f'{key}: "{val_esc}"')
    lines.append('---')
    return '\n'.join(lines)

# ──────────────────────────────────────────────────────────────
# Title extraction
# ──────────────────────────────────────────────────────────────

# Degenerate EN title words to skip (too short / generic)
DEGENERATE_EN = {
    'body', 'purpose', 'introduction', 'intro', 'purpose statement',
    'opening paragraph', 'summary', 'conclusion', 'reflection', 'note',
    'related posts', 'related articles', 'thank you', 'hello', 'hi',
    'on a whim', 'final thoughts', 'today', 'today s route',
}

def _is_good_en_title(text):
    """True if text is a plausibly good English title (not degenerate)."""
    # Remove non-ASCII, strip punctuation and whitespace
    text = re.sub(r'[^\x00-\x7F]+', '', text).strip()
    text = text.strip('"').strip("'").strip('/').strip(':').strip('–').strip('-').strip()
    if not text or len(text) < 10:
        return False
    lower = text.lower()
    if lower in DEGENERATE_EN:
        return False
    # Skip known degenerate patterns by prefix
    skip_prefixes = ('purpose', 'what this', 'this blog', 'this article',
                     'reading time', 'estimated reading', 'min read',
                     'english reflection', 'english version', 'in english',
                     'google adsense', 'in this post', 'in this article',
                     'in this blog')
    if any(lower.startswith(p) for p in skip_prefixes):
        return False
    # Skip reading time patterns anywhere in text
    skip_contains = ['reading time', 'minutes to read', 'min read', 'minute read',
                     'estimated reading', 'can be read in', 'can read this blog',
                     'you can read', 'takes about', 'minutes to read']
    if any(p in lower for p in skip_contains):
        return False
    # Must have at least 2 words
    words = [w for w in text.split() if len(w) > 1]
    if len(words) < 2:
        return False
    return is_en(text + ' a')

def extract_titles(title):
    """
    Split bilingual title into (ja_title, en_title).
    Returns (title, None) if no EN part found.
    """
    # Strategy A: tabs or 4+ spaces separate JA from EN
    m = re.search(r'^(.+?)(?:\t{2,}|\s{4,})(.+)$', title)
    if m:
        ja, en = m.group(1).strip(), m.group(2).strip().strip('"')
        if _is_good_en_title(en):
            return ja, en

    # Strategy B: slash separator  /  or  ／
    m = re.search(r'^(.+?)\s*[/／]\s*(.+)$', title)
    if m:
        ja, en = m.group(1).strip(), m.group(2).strip().strip('"')
        if _is_good_en_title(en):
            return ja, en

    # Strategy C: find last CJK character, everything after is EN title
    cjk_chars = set('　' + ''.join(chr(c) for c in range(0x3001, 0xA000)) +
                    ''.join(chr(c) for c in range(0xF900, 0xFB00)) +
                    ''.join(chr(c) for c in range(0xAC00, 0xD7B0)))
    last_cjk = -1
    for i, ch in enumerate(title):
        if ch in cjk_chars or (0x4E00 <= ord(ch) <= 0x9FFF):
            last_cjk = i
    if last_cjk >= 0 and last_cjk < len(title) - 5:
        en_candidate = title[last_cjk+1:].strip().strip('"').strip("'").strip('"').strip('"')
        if _is_good_en_title(en_candidate):
            ja = title[:last_cjk+1].strip()
            return ja, en_candidate

    return title.strip(), None

def find_en_title_from_body(body):
    """
    Look for a good English title anywhere in the body.
    Returns the first plausible EN title or None.
    """
    # Helper: split raw HTML on <br> or newlines, strip each part
    def split_raw_lines(raw_html):
        parts = re.split(r'<br\s*/?>\s*|<br>', raw_html, flags=re.IGNORECASE)
        result = []
        for p in parts:
            text = strip_tags(p).strip()
            # Also split on \n within the stripped text
            for line in text.split('\n'):
                line = line.strip()
                if line:
                    result.append(line)
        return result

    # 1. Scan all <p> and <span> raw content for EN title lines
    for m in re.finditer(r'<p[^>]*>(.*?)</p>', body, re.DOTALL | re.IGNORECASE):
        raw_inner = m.group(1)
        for line in split_raw_lines(raw_inner):
            # Try with slash separation first
            if '/' in line or '／' in line:
                slash_m = re.search(r'[/／]\s*(.+)$', line)
                if slash_m:
                    en_part = slash_m.group(1).strip()
                    # Remove leading emoji/symbols
                    en_part = re.sub(r'^[^\w"\']+', '', en_part).strip()
                    # Remove trailing punctuation
                    en_part = re.sub(r'[~〜～]+$', '', en_part).strip()
                    if _is_good_en_title(en_part):
                        return en_part
            # Try the whole line (fallback for non-slash lines)
            clean = re.sub(r'[^\x00-\x7F]+', '', line).strip().strip('/').strip(':').strip()
            if _is_good_en_title(clean):
                return clean

    # 2. Scan headings for EN part
    for m in re.finditer(r'<h[1-6][^>]*>(.*?)</h[1-6]>', body, re.DOTALL | re.IGNORECASE):
        raw_inner = m.group(1)
        content = strip_tags(raw_inner).strip()
        if '/' in content or '／' in content:
            slash_m = re.search(r'[/／]\s*(.+)$', content)
            if slash_m:
                en = slash_m.group(1).strip()
                if _is_good_en_title(en):
                    return en

    # 3. Scan blockquotes for first EN sentence
    for m in re.finditer(r'<blockquote[^>]*>(.*?)</blockquote>', body, re.DOTALL | re.IGNORECASE):
        bq_inner = m.group(1)
        for pm in re.finditer(r'<p[^>]*>(.*?)</p>', bq_inner, re.DOTALL | re.IGNORECASE):
            for line in split_raw_lines(pm.group(1)):
                clean = re.sub(r'[^\x00-\x7F]+', '', line).strip()
                if len(clean) > 30 and _is_good_en_title(clean):
                    lower = clean.lower()
                    skip_patterns = ['this post', 'this article', 'this is a',
                                     'in this post', 'in this article',
                                     'reading time', 'purpose of this']
                    if not any(p in lower for p in skip_patterns):
                        # Truncate to reasonable title length
                        if len(clean) > 80:
                            clean = clean[:80].rsplit(' ', 1)[0]
                        return clean

    return None

def slugify(text):
    """Convert English title to a clean URL slug (without -en suffix)."""
    text = strip_tags(text)
    text = re.sub(r'[^\x00-\x7F]+', '', text)  # remove non-ASCII
    text = re.sub(r"[''\"\"'\"‘’“”]+", '', text)  # remove quotes
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    # Truncate to ~70 chars at word boundary
    if len(text) > 70:
        text = text[:70]
        last = text.rfind('-')
        if last > 45:
            text = text[:last]
    return text or 'article'

# ──────────────────────────────────────────────────────────────
# HTML block-level extraction (depth-aware)
# ──────────────────────────────────────────────────────────────

BLOCK_TAGS = {'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
              'blockquote', 'figure', 'div', 'ul', 'ol', 'li', 'section'}
VOID_TAGS = {'hr', 'br', 'img', 'input', 'meta', 'link'}

def find_close_tag(html, tag, start=0):
    """
    Find the index just after the closing </tag> that matches the opening tag at `start`.
    `start` should point to the character AFTER the opening tag's '>'.
    Returns end_pos or -1 if not found.
    """
    depth = 1
    pos = start
    open_re = re.compile(r'<' + re.escape(tag) + r'[\s>/]', re.IGNORECASE)
    close_re = re.compile(r'</' + re.escape(tag) + r'\s*>', re.IGNORECASE)
    while pos < len(html):
        lt = html.find('<', pos)
        if lt == -1:
            return -1
        open_m = open_re.match(html, lt)
        close_m = close_re.match(html, lt)
        if close_m:
            depth -= 1
            if depth == 0:
                return close_m.end()
            pos = close_m.end()
        elif open_m:
            # Check if self-closing
            gt = html.find('>', lt)
            if gt != -1 and html[gt-1] == '/':
                pos = gt + 1
            else:
                depth += 1
                gt = html.find('>', lt)
                pos = gt + 1 if gt != -1 else len(html)
        else:
            gt = html.find('>', lt)
            pos = gt + 1 if gt != -1 else len(html)
    return -1

def iter_blocks(html):
    """
    Iterate top-level HTML blocks as (tag, full_html) tuples.
    Handles nested elements by depth tracking.
    """
    pos = 0
    while pos < len(html):
        # Skip whitespace
        while pos < len(html) and html[pos] in ' \n\r\t':
            pos += 1
        if pos >= len(html):
            break

        if html[pos] != '<':
            # Bare text
            end = html.find('<', pos)
            end = end if end != -1 else len(html)
            text = html[pos:end].strip()
            if text:
                yield ('text', text)
            pos = end
            continue

        # Find tag name
        m = re.match(r'<([a-zA-Z][a-zA-Z0-9]*)', html[pos:])
        if not m:
            # Comment or declaration – skip
            end = html.find('>', pos)
            pos = end + 1 if end != -1 else len(html)
            continue

        tag = m.group(1).lower()

        # Self-closing / void tags
        if tag in VOID_TAGS:
            end = html.find('>', pos)
            if end == -1:
                break
            yield (tag, html[pos:end+1])
            pos = end + 1
            continue

        # Opening tag: find its close
        gt = html.find('>', pos)
        if gt == -1:
            break

        # Check self-closing
        if html[gt-1] == '/':
            yield (tag, html[pos:gt+1])
            pos = gt + 1
            continue

        open_end = gt + 1  # position after the opening tag's '>'
        close_end = find_close_tag(html, tag, open_end)
        if close_end == -1:
            # No matching close – skip past the opening tag
            pos = open_end
            continue

        yield (tag, html[pos:close_end])
        pos = close_end

# ──────────────────────────────────────────────────────────────
# Per-block EN/JA extraction
# ──────────────────────────────────────────────────────────────

def heading_split(html):
    """
    Split a heading element into (en_html, ja_html).
    Returns (None, original) if no EN part found.
    """
    m = re.match(r'<(h[1-6])([^>]*)>(.*?)</\1>', html, re.DOTALL | re.IGNORECASE)
    if not m:
        return None, html
    tag, attrs, content = m.group(1), m.group(2), m.group(3)
    plain = strip_tags(content).strip()

    # Slash-separated bilingual heading
    slash_m = re.search(r'^(.*?)\s*/\s*(.+)$', plain, re.DOTALL)
    if slash_m:
        ja_text = slash_m.group(1).strip()
        en_text = slash_m.group(2).strip()
        if en_text and is_en(en_text + ' a'):
            return f'<{tag}>{en_text}</{tag}>', f'<{tag}{attrs}>{ja_text}</{tag}>'

    # Whole heading EN?
    if is_en(plain + ' a') and not is_ja(plain):
        return f'<{tag}>{plain}</{tag}>', None

    # Whole heading JA
    return None, html

def para_split(html):
    """
    Split a <p> element into (en_html, ja_html).
    Handles <br>-separated, newline-separated, and pure content.
    """
    m = re.match(r'<p([^>]*)>(.*?)</p>', html, re.DOTALL | re.IGNORECASE)
    if not m:
        return None, html
    attrs, content = m.group(1), m.group(2)
    plain = strip_tags(content).strip()

    if not plain:
        return None, None

    # Pure EN
    if is_en(plain + ' a') and not is_ja(plain):
        return html, None
    # Pure JA: CJK ratio very high (> 0.70) → definitely Japanese, no meaningful EN
    # Note: do NOT use is_ja() here (threshold 0.22 is too loose — catches mixed paragraphs)
    if cjk_ratio(plain) > 0.70:
        return None, html

    # Mixed: try splitting on <br>
    if re.search(r'<br\s*/?>', content, re.IGNORECASE):
        parts = re.split(r'<br\s*/?>', content, flags=re.IGNORECASE)
        en_parts, ja_parts = [], []
        for p in parts:
            pt = strip_tags(p).strip()
            if not pt:
                continue
            if is_en(pt + ' a') and not is_ja(pt):
                en_parts.append(p.strip())
            elif is_ja(pt):
                ja_parts.append(p.strip())
            else:
                # ambiguous – put in JA bucket
                ja_parts.append(p.strip())
        en_html = f'<p>{" ".join(en_parts)}</p>' if en_parts else None
        ja_html = f'<p{attrs}>{"<br>".join(ja_parts)}</p>' if ja_parts else None
        return en_html, ja_html

    # Mixed: try splitting on newlines
    lines = content.split('\n')
    en_lines, ja_lines = [], []
    for line in lines:
        lt = strip_tags(line).strip()
        if not lt:
            continue
        if is_en(lt + ' a') and not is_ja(lt):
            en_lines.append(line.strip())
        elif is_ja(lt):
            ja_lines.append(line.strip())
        else:
            ja_lines.append(line.strip())

    en_html = f'<p>{" ".join(en_lines)}</p>' if en_lines else None
    ja_html = f'<p{attrs}>{"<br>".join(ja_lines)}</p>' if ja_lines else None
    return en_html, ja_html

def blockquote_split(html):
    """
    Split a <blockquote> element into (en_html, ja_html).
    """
    m = re.match(r'<blockquote([^>]*)>(.*?)</blockquote>', html, re.DOTALL | re.IGNORECASE)
    if not m:
        return None, html
    attrs, inner = m.group(1), m.group(2)
    plain = strip_tags(inner).strip()

    # Pure EN blockquote → include in EN body
    if is_en(plain + ' a') and not is_ja(plain):
        return html, None
    # Pure JA blockquote: CJK ratio very high (> 0.70) → definitely Japanese
    # Note: do NOT use is_ja() here (0.22 threshold is too loose for blockquotes)
    if cjk_ratio(plain) > 0.70:
        return None, html

    # Mixed blockquote: process inner paragraphs
    en_parts, ja_parts = [], []
    for tag, block_html in iter_blocks(inner):
        if tag == 'p':
            en_p, ja_p = para_split(block_html)
            if en_p:
                en_parts.append(en_p)
            if ja_p:
                ja_parts.append(ja_p)
        elif tag == 'hr':
            if en_parts:
                en_parts.append(block_html)
            if ja_parts:
                ja_parts.append(block_html)
        elif tag in ('div',):
            # Columns with figures
            en_parts.append(block_html)
            ja_parts.append(block_html)
        elif tag == 'figure':
            en_parts.append(block_html)
            ja_parts.append(block_html)
        elif tag == 'text':
            pt = block_html.strip()
            if pt:
                if is_en(pt + ' a') and not is_ja(pt):
                    en_parts.append(f'<p>{pt}</p>')
                elif is_ja(pt):
                    ja_parts.append(f'<p>{pt}</p>')

    en_html = f'<blockquote{attrs}>{"".join(en_parts)}</blockquote>' if en_parts else None
    ja_html = f'<blockquote{attrs}>{"".join(ja_parts)}</blockquote>' if ja_parts else None
    return en_html, ja_html

def ul_split(html):
    """Split a <ul> list – include if EN, skip if JA."""
    plain = strip_tags(html).strip()
    if is_en(plain + ' a') and not is_ja(plain):
        return html, None
    if is_ja(plain):
        return None, html
    return None, html  # mixed lists: keep in JA, skip from EN

def process_body(body_html):
    """
    Process body HTML into (en_body, ja_body_clean) pair.
    """
    en_blocks = []
    ja_blocks = []

    for tag, block_html in iter_blocks(body_html):
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            en_h, ja_h = heading_split(block_html)
            if en_h:
                en_blocks.append(en_h)
            if ja_h:
                ja_blocks.append(ja_h)

        elif tag == 'blockquote':
            en_bq, ja_bq = blockquote_split(block_html)
            if en_bq:
                en_blocks.append(en_bq)
            if ja_bq:
                ja_blocks.append(ja_bq)

        elif tag == 'p':
            en_p, ja_p = para_split(block_html)
            if en_p:
                en_blocks.append(en_p)
            if ja_p:
                ja_blocks.append(ja_p)

        elif tag == 'figure':
            # Images: include in both
            en_blocks.append(block_html)
            ja_blocks.append(block_html)

        elif tag == 'hr':
            # Separator: include if there's context
            en_blocks.append(block_html)
            ja_blocks.append(block_html)

        elif tag == 'div':
            # wp-block-columns: include in both (contains figures)
            en_blocks.append(block_html)
            ja_blocks.append(block_html)

        elif tag in ('ul', 'ol'):
            en_list, ja_list = ul_split(block_html)
            if en_list:
                en_blocks.append(en_list)
            if ja_list:
                ja_blocks.append(ja_list)

        elif tag == 'text':
            pt = block_html.strip()
            if pt:
                if is_en(pt + ' a') and not is_ja(pt):
                    en_blocks.append(f'<p>{pt}</p>')
                elif is_ja(pt):
                    ja_blocks.append(f'<p>{pt}</p>')

        # br, img, input etc: skip at top level

    # Clean up consecutive HRs and trailing HRs
    def clean_hrs(blocks):
        result = []
        prev_hr = False
        for b in blocks:
            is_hr = re.match(r'<hr', b, re.IGNORECASE)
            if is_hr and prev_hr:
                continue
            result.append(b)
            prev_hr = bool(is_hr)
        # Remove trailing HR
        while result and re.match(r'<hr', result[-1], re.IGNORECASE):
            result.pop()
        return result

    en_blocks = clean_hrs(en_blocks)
    ja_blocks = clean_hrs(ja_blocks)

    return '\n\n'.join(en_blocks), '\n\n'.join(ja_blocks)

# ──────────────────────────────────────────────────────────────
# Excerpt extraction
# ──────────────────────────────────────────────────────────────

def extract_en_excerpt(en_body, max_len=160):
    """Extract first meaningful EN sentence from EN body."""
    for m in re.finditer(r'<p[^>]*>(.*?)</p>', en_body, re.DOTALL | re.IGNORECASE):
        text = strip_tags(m.group(1)).strip()
        # Skip very short or label-like paragraphs
        if len(text) < 20:
            continue
        if is_en(text + ' a') and not is_ja(text):
            if len(text) > max_len:
                text = text[:max_len].rsplit(' ', 1)[0] + '...'
            return text
    return ''

# ──────────────────────────────────────────────────────────────
# Main per-article processor
# ──────────────────────────────────────────────────────────────

def process_article(filepath, dry_run=False):
    """
    Process a single bilingual article.
    Returns (en_slug, status_message).
    """
    content = filepath.read_text(encoding='utf-8')
    fm, body = parse_frontmatter(content)

    if not fm:
        return None, 'ERROR: no frontmatter'
    if fm.get('lang') != 'ja':
        return None, f'SKIP: lang={fm.get("lang")}'
    if '__trashed' in filepath.name:
        return None, 'SKIP: __trashed'

    # ── titles ──
    raw_title = fm.get('title', '')
    ja_title, en_title = extract_titles(raw_title)
    if not en_title:
        en_title = find_en_title_from_body(body)

    date_str = fm.get('date', '2025-04-01')

    if not en_title:
        # Fallback: use JA slug converted to date-based English slug
        ja_slug = fm.get('slug', '')
        # Use date + category as fallback slug
        cat = fm.get('categories', ['article'])
        cat_str = cat[0] if cat else 'article'
        en_title = f'[Blog post {date_str}]'
        en_slug_base = f'{date_str}-{cat_str}-post-en'
    else:
        base = slugify(en_title)
        en_slug_base = base + '-en'

    # Avoid -en-en double suffix
    en_slug = en_slug_base
    if en_slug.endswith('-en-en'):
        en_slug = en_slug[:-3]

    # ── body extraction ──
    en_body, ja_body_clean = process_body(body)

    if not en_body.strip():
        return None, 'WARNING: EN body is empty'

    # ── EN excerpt ──
    en_excerpt = extract_en_excerpt(en_body)

    # ── build EN frontmatter ──
    en_fm = {
        'title': en_title,
        'date':  fm.get('date', ''),
        'slug':  en_slug,
        'categories': fm.get('categories', []),
        'tags':  fm.get('tags', []),
        'eyecatch': fm.get('eyecatch', ''),
        'lang':  'en',
        'excerpt': en_excerpt,
    }

    en_content = format_frontmatter(en_fm) + '\n\n' + en_body + '\n'

    # ── EN filename ──
    en_filename = f'{date_str}-{en_slug}.md'
    en_filepath = filepath.parent / en_filename

    # ── update JA frontmatter ──
    fm['title'] = ja_title

    # ── JA content ──
    ja_content = format_frontmatter(fm) + '\n\n' + ja_body_clean + '\n'

    if dry_run:
        print(f'\n{"="*60}')
        print(f'FILE: {filepath.name}')
        print(f'JA title: {ja_title}')
        print(f'EN title: {en_title}')
        print(f'EN slug:  {en_slug}')
        print(f'EN file:  {en_filename}')
        print(f'EN body preview ({len(en_body)} chars):')
        print(en_body[:500])
        print('...')
        return en_slug, f'DRY-RUN: {en_filename}'

    # Write EN file
    en_filepath.write_text(en_content, encoding='utf-8')

    # Write cleaned JA file
    filepath.write_text(ja_content, encoding='utf-8')

    return en_slug, f'OK: {en_filename}'

# ──────────────────────────────────────────────────────────────
# astro.config.mjs updater
# ──────────────────────────────────────────────────────────────

def add_en_slugs_to_config(new_slugs):
    """Add new EN slugs to the EN_SLUGS array in astro.config.mjs."""
    config = ASTRO_CONFIG.read_text(encoding='utf-8')

    # Find the EN_SLUGS array and its end
    m = re.search(r'(const EN_SLUGS = \[)(.*?)(\];)', config, re.DOTALL)
    if not m:
        print('ERROR: Could not find EN_SLUGS in astro.config.mjs')
        return False

    existing = re.findall(r"'([^']+)'", m.group(2))
    existing_set = set(existing)
    actually_new = [s for s in new_slugs if s not in existing_set]

    if not actually_new:
        print('No new slugs to add (all already present).')
        return True

    # Build new section for WordPress-era extraction slugs
    new_section = '\n  // ── WordPress時代抽出 EN記事（2025-04〜06）────────────────────\n'
    for slug in actually_new:
        new_section += f"  '{slug}',\n"

    # Insert before the closing ];
    new_array_content = m.group(2).rstrip() + new_section
    new_config = config[:m.start(2)] + new_array_content + config[m.start(3):]

    ASTRO_CONFIG.write_text(new_config, encoding='utf-8')
    print(f'Added {len(actually_new)} slugs to EN_SLUGS.')
    return True

# ──────────────────────────────────────────────────────────────
# Target article finder
# ──────────────────────────────────────────────────────────────

def find_target_articles():
    """Find all JA bilingual articles in the WordPress era (2025-04-16 to 2025-06-08)."""
    targets = []
    for f in sorted(BLOG_DIR.glob('*.md')):
        # Date range filter
        m = re.match(r'^(\d{4}-\d{2}-\d{2})', f.name)
        if not m:
            continue
        d = m.group(1)
        if not ('2025-04-16' <= d <= '2025-06-08'):
            continue
        # Skip trashed
        if '__trashed' in f.name:
            continue
        # Check frontmatter
        content = f.read_text(encoding='utf-8')
        if 'lang: "ja"' not in content and "lang: 'ja'" not in content:
            continue
        # All lang:ja articles in the date range are candidates
        # (EN body emptiness check happens during extraction)
        targets.append((f, 0.0))
    return targets

# ──────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────

def main():
    if SINGLE_FILE:
        # Process single file
        fp = BLOG_DIR / SINGLE_FILE if not os.path.isabs(SINGLE_FILE) else Path(SINGLE_FILE)
        if not fp.exists():
            print(f'File not found: {fp}')
            sys.exit(1)
        en_slug, msg = process_article(fp, dry_run=DRY_RUN)
        print(f'{fp.name}: {msg}')
        if en_slug and not DRY_RUN:
            add_en_slugs_to_config([en_slug])
        return

    # Full run
    targets = find_target_articles()
    print(f'Found {len(targets)} target articles')
    print()

    results = []
    en_slugs = []
    errors = []

    for fp, ar in targets:
        en_slug, msg = process_article(fp, dry_run=DRY_RUN)
        status = '✅' if 'OK' in msg or 'DRY-RUN' in msg else ('⚠️' if 'WARNING' in msg else '❌')
        print(f'{status} {fp.name}: {msg}')
        results.append((fp.name, ar, msg))
        if en_slug and ('OK' in msg or 'DRY-RUN' in msg):
            en_slugs.append(en_slug)
        elif 'ERROR' in msg or 'WARNING' in msg:
            errors.append((fp.name, msg))

    print()
    print(f'Processed: {len(results)} articles')
    print(f'EN files created: {len(en_slugs)}')
    print(f'Errors/warnings: {len(errors)}')

    if not DRY_RUN and en_slugs:
        print()
        print('Adding EN slugs to astro.config.mjs...')
        add_en_slugs_to_config(en_slugs)

    # Write log
    if not DRY_RUN:
        write_log(results, en_slugs)

    if errors:
        print()
        print('Issues:')
        for name, msg in errors:
            print(f'  {name}: {msg}')

def write_log(results, en_slugs):
    """Write extraction log."""
    lines = [
        f'# Phase 3 EN抽出ログ',
        f'',
        f'**実行日**: 2026-05-02',
        f'**対象**: WordPress時代の混在記事（2025-04-16〜2025-06-08）',
        f'',
        f'## 結果サマリー',
        f'',
        f'| 項目 | 件数 |',
        f'|------|------|',
        f'| 処理対象記事 | {len(results)} |',
        f'| EN版作成成功 | {len(en_slugs)} |',
        f'| スキップ/エラー | {len(results) - len(en_slugs)} |',
        f'',
        f'## 処理詳細',
        f'',
        f'| ファイル名 | ASCII比率 | 結果 |',
        f'|-----------|----------|------|',
    ]
    for name, ar, msg in results:
        lines.append(f'| `{name}` | {ar:.2f} | {msg} |')

    lines += [
        '',
        '## 追加したEN slugs',
        '',
    ]
    for slug in en_slugs:
        lines.append(f'- `{slug}`')

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'Log written to {LOG_PATH}')

if __name__ == '__main__':
    main()
