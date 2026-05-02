# freelife50.com ドメイン移管前 現状確認レポート

**作成日**: 2026-05-01  
**目的**: ConoHa(GMO) → Cloudflare Registrar へのドメイン移管準備  
**実施時期**: GW中（2026年5月）予定

---

## ⚠️ 重要警告：GW中の移管は不可能

> **ICANN の60日ロックルール**により、2026-04-29 に WHOIS が更新されているため  
> 移管可能になるのは最短 **2026-06-28（月）以降** です。

詳細は「リスク評価」セクションを参照。

---

## 1. 現状の構造図

```
【レジストラ（ドメイン登録管理）】
GMO Internet Group / Onamae.com（IANA ID: 49）
  ↑ ConoHa経由で取得 → ConoHa管理画面からのみ操作可
  ドメイン: freelife50.com
  作成日  : 2025-04-13
  有効期限: 2027-04-13 ← 残り約1年
  ロック  : clientTransferProhibited（移管前に解除必須）
       ↓ ネームサーバーをCloudflareに向けている（変更済み）
【ネームサーバー（DNS権威サーバー）】
  dorthy.ns.cloudflare.com
  ivan.ns.cloudflare.com
       ↓ DNSゾーン管理
【DNS管理】Cloudflare ← ここでレコード追加・変更する
  A   freelife50.com     → 104.21.27.201 / 172.67.169.187（CF anycast）
  A   www.freelife50.com → 同上
  MX  freelife50.com     → mail1006.conoha.ne.jp（メールはConoHa）
  TXT freelife50.com     → v=spf1 include:_spf.conoha.ne.jp ~all
       ↓
【Cloudflare Pages】
  プロジェクト : freelife50-astro
  デフォルトURL: freelife50-astro.pages.dev
  カスタムドメイン: freelife50.com（設定済み）
  en.freelife50.com: 未設定
       ↓
【ブログ表示】https://freelife50.com → Astro ビルド済み静的サイト
```

---

## 2. リポジトリ・デプロイ環境

| 項目 | 状態 |
|------|------|
| ブランチ | main（作業中） |
| リモートとの差分 | **origin/main より 9コミット先行**（未 push） |
| 未コミットファイル | `*-iijmio-*.md` 2件 modified + 画像 2件 untracked |
| wrangler.toml | `name = "freelife50"` / `compatibility_date = "2024-01-01"` |
| Pages プロジェクト | `freelife50-astro`（最終更新: 5時間前） |

### バックアップブランチ

```
backup/before-full-restore
backup/before-gallery-restore
backup/before-tag-restore
```

### WordPress XMLバックアップ

```
~/Downloads/ramenbeerampblog.WordPress.2026-04-29.xml（12.2MB、2026-04-29）
```

---

## 3. DNS・WHOIS 現状

### ネームサーバー（✅ 移管前後で変更不要）

```
dorthy.ns.cloudflare.com.
ivan.ns.cloudflare.com.
```

→ Cloudflare Registrar に移管後も**同じネームサーバーを継続使用**できるため、  
　 移管によるDNS停止リスクはほぼゼロ。

### DNS レコード一覧

| タイプ | 名前 | 値 | 備考 |
|--------|------|----|------|
| A | freelife50.com | 104.21.27.201 | CF anycast |
| A | freelife50.com | 172.67.169.187 | CF anycast |
| A | www.freelife50.com | 同上 | CF anycast |
| NS | freelife50.com | dorthy/ivan.ns.cloudflare.com | — |
| MX | freelife50.com | mail1006.conoha.ne.jp (pri=10) | メール |
| TXT | freelife50.com | v=spf1 include:_spf.conoha.ne.jp | SPF |
| — | en.freelife50.com | **未設定** | 要追加 |

### WHOIS 重要値

| 項目 | 値 |
|------|----|
| Registrar | GMO Internet Group, Inc. d/b/a Onamae.com |
| Registrar WHOIS Server | whois.discount-domain.com |
| 作成日 | 2025-04-13 |
| 有効期限 | **2027-04-13** |
| 最終更新日 | **2026-04-29T02:38:18Z** ← 60日ロック起点 |
| ドメインステータス | **clientTransferProhibited** |

---

## 4. 記事構成・言語判定

### 記事数内訳

| カテゴリ | 件数 |
|----------|------|
| `-en.md`（英語記事） | 8件 |
| `-ja.md`（`-ja` 明示の日本語記事） | 1件 |
| その他（日本語が大半・命名規則なし） | 約220件 |
| **合計** | **229件** |

### 現在の言語判定方法

- `src/content.config.ts` の `lang: z.enum(['ja', 'en']).default('ja')` で管理
- 各記事の frontmatter に `lang: en` / `lang: ja` を設定
- `[slug].astro` で `lang={post.data.lang}` を `PostLayout` に渡して `<html lang="">` を切り替え
- **全記事が `freelife50.com/[slug]` の同一ドメイン・同一パス構造**で配信中

### `en.freelife50.com` サブドメイン分離に必要な改修（設計のみ）

現在の仕組みでは日英が同一ドメインで混在しているため、以下の実装が必要：

**Option A: ランタイム振り分け（Cloudflare Workers）**  
- `en.freelife50.com` へのアクセスを Cloudflare Workers でフックし、`lang: en` の記事のみを返す  
- メリット: Astro 側の変更最小  
- デメリット: Workers の追加コスト（無料枠内）

**Option B: Astro ビルド時に分離**  
- `[slug].astro` の `getStaticPaths()` で `lang` によってパスを分岐  
- `en.freelife50.com` 用の専用ページルーティングを追加  
- メリット: 静的サイトのまま、追加コストなし  
- デメリット: Astro の改修が必要（中規模）

**Option C: 英語版を別 Pages プロジェクトに分ける**  
- `freelife50-en` という新しい Pages プロジェクトを作成  
- `en.freelife50.com` をカスタムドメインとして設定  
- メリット: 完全分離・独立デプロイ可  
- デメリット: 記事管理が2リポジトリに分散

---

## 5. バックアップ状況

| バックアップ | 状態 | 場所 |
|-------------|------|------|
| WordPress XML | ✅ あり | `~/Downloads/ramenbeerampblog.WordPress.2026-04-29.xml`（12.2MB） |
| git backup ブランチ | ✅ 3本あり | `backup/before-*-restore` |
| リモートリポジトリ | ⚠️ 9コミット未 push | origin/main が古い状態 |

---

## 6. リスク評価

### ⛔ 最大リスク：60日ロックで GW 中の移管は不可

ICANN 標準ルールにより、**レジストラを変更するか WHOIS を更新した場合、60日間は移管禁止**。

```
Updated Date: 2026-04-29
60日後      : 2026-06-28（日）
移管可能日  : 2026-06-29（月）以降
```

**GW中（2026年5月）の移管は不可能。**  
6月末〜7月以降に実施するよう計画変更が必要。

### その他リスク一覧

| リスク | 内容 | 影響 | 対策 |
|--------|------|------|------|
| clientTransferProhibited | 現在ロック中 | 移管不可 | ConoHa管理画面でロック解除（移管直前に実施） |
| 移管中のブログ停止 | Cloudflare→Cloudflare 移管はネームサーバー変更不要 | **ほぼリスクなし** | — |
| DNS レコード喪失 | 移管後、CloudflareのDNSゾーンはそのまま引き継ぎ | **リスクなし** | — |
| メール影響（MX） | 移管後もMXはconoha.ne.jpのまま | **変更不要・影響なし** | — |
| auth-code（EPP コード）紛失 | 移管に必要なコード | — | 移管直前にConoHaで取得・メモ必須 |
| ロールバック | Cloudflare Registrar → ConoHaへ戻すのは難しい | 要注意 | 移管後はConoHaへの返却は実質不可 |
| ConoHa WING 解約との切り離し | WING解約（2027年2月）とドメイン移管は無関係 | 影響なし | ドメイン移管先をCloudflareにすれば ConoHa解約後も継続 |

---

## 7. 移管手順（実施は6月末以降）

### 事前確認チェックリスト

- [ ] 2026-06-29 以降であることを確認（60日ロック解除後）
- [ ] リモートリポジトリを最新化（`git push` 9コミット分）
- [ ] WordPress XMLバックアップを Google Drive に移動

### 移管手順

| 手順 | 作業場所 | 操作 | 担当 |
|------|---------|------|------|
| 1 | ConoHa 管理画面 | `clientTransferProhibited` ロックを解除 | ヒロシ（手動） |
| 2 | ConoHa 管理画面 | Auth-Code（EPP コード）を取得・メモ | ヒロシ（手動） |
| 3 | Cloudflare 管理画面 | Domain Registration → Transfer → `freelife50.com` | ヒロシ（手動） |
| 4 | — | Auth-Code を入力、支払い（約$10.44/年） | ヒロシ（手動） |
| 5 | ConoHa 管理画面 or メール | 移管承認メールに承認 | ヒロシ（手動） |
| 6 | 自動 | Cloudflare がネームサーバーをそのまま引き継ぎ | 自動 |
| 7 | 確認 | `dig freelife50.com NS` が同じ結果を返すことを確認 | Claude Code |

---

## 8. 次のアクション提案（5個）

### アクション 1：移管スケジュールを6月末に変更する

- **理由**: 60日ロックにより5月中の移管は不可能
- **タイミング**: 2026-06-29（月）以降
- **ヒロシが手動でやること**: カレンダーに「ドメイン移管可能日」として登録
- **Claude Codeが代行できること**: launchd または Cron でリマインダー設定

### アクション 2：リモートリポジトリを最新化する（git push 9コミット）

- **理由**: 現在 origin/main より 9コミット先行しており、バックアップが不完全
- **優先度**: 高（今すぐやっておくべき）
- **ヒロシが手動でやること**: なし
- **Claude Codeが代行できること**: `git push origin main` の実行（許可があれば）

### アクション 3：`en.freelife50.com` の設計方針を決定する

- **理由**: 移管とサブドメイン追加は独立した作業だが、早めに方針を決めると実装が進む
- **Option A**（Cloudflare Workers）/ **Option B**（Astro 改修）/ **Option C**（別 Pages プロジェクト）の中から選択
- **ヒロシが手動でやること**: 方針の決定のみ
- **Claude Codeが代行できること**: 決定後の実装・デプロイ全般

### アクション 4：ConoHa 管理画面でドメイン設定を事前確認する（移管準備）

- **理由**: Auth-Code の取得方法・ロック解除の場所を事前に把握しておく
- **ヒロシが手動でやること**: ConoHa ログイン → ドメイン管理 → `freelife50.com` の設定画面を確認し、ロック解除ボタンの場所・Auth-Code 発行の場所をメモする
- **Claude Codeが代行できること**: なし（ログインが必要な操作のため）

### アクション 5：WordPress XMLバックアップを Google Drive へ移動する

- **理由**: `~/Downloads` はサンドボックスでアクセス制限あり、重要データは Google Drive に保管推奨
- **ヒロシが手動でやること**: `ramenbeerampblog.WordPress.2026-04-29.xml` を Google Drive の病院フォルダか適切な場所に移動
- **Claude Codeが代行できること**: 移動先パスを確認した上で `cp` コマンドを実行（許可があれば）

---

## まとめ

| 確認項目 | 結果 |
|----------|------|
| ネームサーバー | Cloudflare（✅ 正常） |
| DNS管理 | Cloudflare（✅ 正常） |
| カスタムドメイン | freelife50.com 設定済み（✅） |
| en.freelife50.com | 未設定（要追加） |
| 移管可能か | ❌ 60日ロック中（2026-06-29以降に延期） |
| ロック | clientTransferProhibited あり（解除必要） |
| 移管リスク | 低（CF→CF 移管でDNS・ブログ停止なし） |
| バックアップ | ✅ XML + git ブランチあり |
| 未 push コミット | ⚠️ 9コミット（要 push） |
