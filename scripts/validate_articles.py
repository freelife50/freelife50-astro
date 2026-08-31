#!/usr/bin/env python3
"""記事front matterのデプロイ前検証（ブログ絶対ルール準拠・1コマンド版）

チェック内容:
  - categories: 承認済みslug 1個のみ
  - tags: 3〜5個
  - eyecatch / sns_image_url: ファイルが public/ 配下に実在し、300KB以下
  - lang: ja/en
  - alternateSlug: 相手記事が存在し、相互リンクになっている
  - slug がファイル名と整合（YYYY-MM-DD-slug.md）

使い方:
  python3 scripts/validate_articles.py src/content/blog/2026-08-17-foo.md [他.md ...]
  引数なし → 直近48時間に更新された記事を自動検出して検証
"""
import re
import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BLOG = REPO / "src" / "content" / "blog"
PUBLIC = REPO / "public"

APPROVED_CATEGORIES = {
    "blog-sidejob", "life-with-momiji", "prepared-life", "healing-walks",
    "society-issues-thoughts", "shumi-taiken-etc", "food-nostalgia",
}
HARD_LIMIT_KB = 300


def parse_front_matter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).splitlines():
        km = re.match(r"^(\w+):\s*(.*)$", line)
        if not km:
            continue
        key, val = km.group(1), km.group(2).strip()
        if val.startswith("["):
            fm[key] = re.findall(r'"([^"]*)"', val)
        else:
            fm[key] = val.strip('"')
    return fm


def check_image(rel_url: str, errors: list, label: str):
    if not rel_url:
        errors.append(f"{label} が未設定")
        return
    p = PUBLIC / rel_url.lstrip("/")
    if not p.exists():
        errors.append(f"{label} のファイルが存在しない: {rel_url}")
        return
    kb = p.stat().st_size // 1024
    if kb > HARD_LIMIT_KB:
        errors.append(f"{label} が{kb}KB（{HARD_LIMIT_KB}KB超・要再圧縮）: {rel_url}")


def find_by_slug(slug: str):
    hits = list(BLOG.glob(f"*-{slug}.md")) + list(BLOG.glob(f"{slug}.md"))
    # ファイル名末尾が完全一致するものだけ（foo と foo-en の誤マッチ防止）
    hits = [h for h in hits if re.sub(r"^\d{4}-\d{2}-\d{2}-", "", h.stem) == slug]
    return hits[0] if hits else None


def validate(path: Path) -> list:
    errors = []
    fm = parse_front_matter(path)
    if not fm:
        return ["front matter が読めない"]

    cats = fm.get("categories", [])
    if len(cats) != 1:
        errors.append(f"categories は1個のみ（現在{len(cats)}個）")
    elif cats[0] not in APPROVED_CATEGORIES:
        errors.append(f"未承認カテゴリ: {cats[0]}")

    tags = fm.get("tags", [])
    if not (3 <= len(tags) <= 5):
        errors.append(f"tags は3〜5個（現在{len(tags)}個）")

    check_image(fm.get("eyecatch", ""), errors, "eyecatch")
    check_image(fm.get("sns_image_url", ""), errors, "sns_image_url")

    lang = fm.get("lang", "")
    if lang not in ("ja", "en"):
        errors.append(f"lang が ja/en 以外: {lang!r}")

    slug = fm.get("slug", "")
    fname_slug = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", path.stem)
    if slug and slug != fname_slug:
        errors.append(f"slug({slug}) とファイル名({fname_slug}) が不一致")

    alt = fm.get("alternateSlug", "")
    if alt:
        alt_path = find_by_slug(alt)
        if not alt_path:
            errors.append(f"alternateSlug の相手記事が存在しない: {alt}")
        else:
            alt_fm = parse_front_matter(alt_path)
            if alt_fm.get("alternateSlug") != slug:
                errors.append(
                    f"alternateSlug が相互になっていない（相手側={alt_fm.get('alternateSlug')!r}）")
    elif lang:
        errors.append("alternateSlug が未設定（日英相互リンク必須）")

    for key in ("title", "date", "excerpt"):
        if not fm.get(key):
            errors.append(f"{key} が未設定")
    return errors


def main():
    if len(sys.argv) > 1:
        targets = [Path(a) for a in sys.argv[1:]]
    else:
        cutoff = time.time() - 48 * 3600
        targets = [p for p in BLOG.glob("*.md") if p.stat().st_mtime > cutoff]
        if not targets:
            print("直近48時間に更新された記事なし。対象を引数で指定してください。")
            return

    ng = 0
    for t in targets:
        if not t.exists():
            print(f"[NG] {t.name}: ファイルが存在しない")
            ng += 1
            continue
        errors = validate(t)
        if errors:
            ng += 1
            print(f"[NG] {t.name}")
            for e in errors:
                print(f"     - {e}")
        else:
            print(f"[OK] {t.name}")

    if ng:
        sys.exit(f"検証NG: {ng}件。修正してから公開してください。")
    print("全記事OK")


if __name__ == "__main__":
    main()
