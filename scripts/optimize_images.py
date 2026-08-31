#!/usr/bin/env python3
"""ブログ画像の軽量化スクリプト（恒久ルール準拠・1コマンド版）

やること（1枚ごと）:
  1. EXIF orientation を反映して正しい向きに回転（orientation=6 横倒し事故の恒久対策）
  2. 長辺を上限px（既定1200）に縮小
  3. 品質を段階的に下げて目標KB（既定150KB）以下に圧縮（品質下限50）
  4. 300KB超が残ったらエラーで停止（デプロイさせない）

使い方:
  python3 scripts/optimize_images.py 写真1.jpg 写真2.HEIC --outdir public/images/wp-content/uploads/2026/08
  python3 scripts/optimize_images.py foo.jpg --name slug-eyecatch --outdir ...   # 1枚だけ改名して出力
  オプション: --max-edge 1200 / --target-kb 150 / --format jpg|webp

HEICはPillowが読めない環境があるため、先に sips で一時JPGへ変換してから処理する。
"""
import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageOps

HARD_LIMIT_KB = 300  # これを超えたら絶対にデプロイしない


def load_image(src: Path) -> Image.Image:
    """HEIC等は sips 経由でJPG化してから読む。"""
    if src.suffix.lower() in (".heic", ".heif"):
        tmp = Path(tempfile.mkstemp(suffix=".jpg")[1])
        subprocess.run(
            ["sips", "-s", "format", "jpeg", str(src), "--out", str(tmp)],
            check=True, capture_output=True,
        )
        img = Image.open(tmp)
        img.load()
        tmp.unlink(missing_ok=True)
        return img
    return Image.open(src)


def optimize_one(src: Path, out: Path, max_edge: int, target_kb: int, fmt: str) -> int:
    img = load_image(src)
    img = ImageOps.exif_transpose(img)  # 向きをピクセルに焼き込み、EXIFに依存しない
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    w, h = img.size
    long_edge = max(w, h)
    if long_edge > max_edge:
        scale = max_edge / long_edge
        img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    out.parent.mkdir(parents=True, exist_ok=True)
    save_fmt = "WEBP" if fmt == "webp" else "JPEG"
    # 第1段階: 品質を段階的に下げる（下限50）
    # 第2段階: それでも重い場合は0.85倍ずつ縮小（品質55固定・下限600px）
    while True:
        for quality in range(85, 45, -5):
            img.save(out, save_fmt, quality=quality, optimize=(save_fmt == "JPEG"))
            if out.stat().st_size // 1024 <= target_kb:
                return out.stat().st_size // 1024
        w, h = img.size
        if max(w, h) * 0.85 < 600:
            return out.stat().st_size // 1024
        img = img.resize((round(w * 0.85), round(h * 0.85)), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+")
    ap.add_argument("--outdir", required=True, help="出力先（uploads/YYYY/MM）")
    ap.add_argument("--name", help="出力ファイル名（拡張子なし・入力1枚の時だけ）")
    ap.add_argument("--max-edge", type=int, default=1200)
    ap.add_argument("--target-kb", type=int, default=150)
    ap.add_argument("--format", choices=["jpg", "webp"], default="jpg")
    args = ap.parse_args()

    if args.name and len(args.files) > 1:
        sys.exit("--name は入力1枚の時だけ使えます")

    outdir = Path(args.outdir)
    failed = []
    for f in args.files:
        src = Path(f)
        if not src.exists():
            sys.exit(f"入力が見つかりません: {src}")
        stem = args.name if args.name else src.stem
        out = outdir / f"{stem}.{args.format}"
        kb = optimize_one(src, out, args.max_edge, args.target_kb, args.format)
        mark = "OK" if kb <= args.target_kb else ("注意" if kb <= HARD_LIMIT_KB else "NG")
        print(f"[{mark}] {out}  {kb}KB")
        if kb > HARD_LIMIT_KB:
            failed.append(out)

    if failed:
        sys.exit(f"エラー: {HARD_LIMIT_KB}KB超が{len(failed)}枚あります。デプロイ禁止: "
                 + ", ".join(str(p) for p in failed))


if __name__ == "__main__":
    main()
