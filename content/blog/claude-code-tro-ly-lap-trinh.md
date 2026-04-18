---
title: "Claude Code — Trợ lý lập trình trong terminal mà mình đang dùng"
description: "Giới thiệu nhanh về Claude Code của Anthropic, cách mình dùng nó hằng ngày, và vài mẹo để đỡ tốn token."
publishedAt: 2026-04-19T15:30:00+07:00
updatedAt: 2026-04-19T15:30:00+07:00
category: tools
tags:
  - claude-code
  - ai
  - workflow
  - vietnamese
draft: false
author: Nguyen Quoc Dai
---

> 🤖 *Heads up: bài này được AI generate ra để mình nghịch thử feature blog mới thôi nha.
> Đọc mà thấy hay hay thì vui, thấy sai sai thì bro cứ skip, đừng trách mình 😄*

Trong mấy tháng gần đây, công cụ AI mình dùng nhiều nhất khi code không phải là một IDE nào cả,
mà là **Claude Code** — một CLI do Anthropic phát triển, chạy thẳng trong terminal. Bài này
mình viết lại nhanh những gì mình thấy hữu ích để ai chưa dùng có thể hình dung.

## Claude Code là gì?

Claude Code là một **AI agent chạy trong terminal**, có quyền đọc/ghi file, chạy lệnh shell,
dùng git, gọi API và tự tổ chức công việc qua todo list. Khác với mấy plugin IDE kiểu Copilot
— cái đó chủ yếu gợi ý từng dòng — Claude Code thực sự *thực hiện task* giúp mình:

- "Đọc thư mục `pages/`, tìm chỗ nào còn gọi API cũ và viết lại bằng `@nuxt/content`" → nó làm.
- "Chạy `npm run build`, nếu lỗi thì đọc log và tự fix" → nó làm.
- "Tạo PR với commit message rõ ràng" → cũng làm luôn.

Model mặc định là **Claude Sonnet / Opus** (Anthropic). Bạn có thể bật/tắt extended thinking,
đổi model giữa phiên, và chạy song song nhiều subagent độc lập cho các task lớn.

## Mình dùng vào việc gì?

Ba nhóm chính:

**1. Refactor codebase lớn.** Ví dụ vụ mình vừa làm: gỡ blog cũ phụ thuộc API đã tắt,
chuyển sang markdown với `@nuxt/content`, mà vẫn giữ lại code cũ ở `/legacy-blogs`. Claude Code
đọc toàn bộ repo, lên kế hoạch, di chuyển file bằng `git mv` (để giữ history), viết page mới,
chạy dev server verify, rồi báo cáo lại. Mình chỉ review.

**2. Debug production.** Paste log lỗi vào, nó sẽ grep codebase, đọc các file liên quan,
đoán root cause và đề xuất fix. Không cần mình bật 5 tab StackOverflow.

**3. Viết tài liệu / commit message.** Đặc biệt hợp với repo cá nhân bị "no-commit-message"
chronic như của mình.

## Vài mẹo tiết kiệm

Claude Code tính tiền theo token, nên xài bừa dễ hết budget nhanh. Mấy thứ mình thấy hiệu quả:

```bash
# Dùng subagent Explore để khảo sát code — nó gom context thay vì đổ hết vào main session
/agent Explore "tìm tất cả chỗ gọi API /posts trong repo"

# Dùng Plan mode cho task lớn — đọc trước, không sửa cho tới khi bạn duyệt plan
# (gõ /plan hoặc Shift+Tab để vào)

# Bật compaction khi session dài — tự nén context cũ
# Config ở ~/.claude/settings.json
```

## So với các tool khác?

Mình từng thử:

- **Cursor / Windsurf**: fork VS Code, UX đẹp, nhưng vẫn là editor-first — context window không
  linh hoạt bằng.
- **GitHub Copilot**: tốt cho autocomplete, kém cho task đa bước.
- **Aider**: cùng triết lý CLI agent nhưng ít công cụ tích hợp hơn và cộng đồng nhỏ hơn.

Claude Code thắng khi task cần **nhiều bước phụ thuộc nhau** và cần chạy lệnh thật sự (test,
build, git, curl...). Nếu chỉ gõ hàm ngắn thì Copilot vẫn nhanh hơn.

## Tổng kết

Mình đang dùng Claude Code làm trợ lý mặc định cho mọi task dev trên máy cá nhân. Nó không
thay thế kỹ năng code, nhưng cắt được kha khá công việc lặp lại và giúp mình giữ flow khi
chuyển ngữ cảnh.

Bài tiếp theo mình sẽ viết về cấu hình `~/.claude/settings.json` — hooks, permission, MCP
server — những thứ biến Claude Code từ "con bot phản hồi prompt" thành một phần thực sự của
workflow dev.
