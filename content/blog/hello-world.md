---
title: "Hello, World — The Blog Is Back"
description: "Blog sống lại sau một thời gian nghỉ vì backend bị tắt. Bài này kể nhanh câu chuyện tại sao mình chọn Markdown + Git thay vì host lại API hay ôm một headless CMS."
publishedAt: 2026-04-19T09:00:00+07:00
updatedAt: 2026-04-19T13:00:00+07:00
category: meta
tags:
  - nuxt
  - markdown
  - workflow
  - vietnamese
draft: false
author: Nguyen Quoc Dai
---

> 🤖 *Heads up: bài này được AI generate ra để mình nghịch thử feature blog mới thôi nha.
> Đọc mà thấy hay hay thì vui, thấy sai sai thì bro cứ skip, đừng trách mình 😄*

Welcome back. Blog này trước đây chạy trên một backend REST riêng
(`api.qdjr.me/v1`) do chính mình viết và host. Nó ổn trong mấy năm đầu, cho tới
khi mình quyết định tắt server để tiết kiệm chi phí, và... quên mất là blog vẫn
đang phụ thuộc vào nó. Kết quả là ai vào `/blog` cũng thấy một câu buồn bã:
*"Will be back soon 🥲"*.

## Các lựa chọn đã cân nhắc

Khi ngồi xuống fix, mình có ba hướng:

1. **Host lại backend**: Viết lại API, deploy lên VPS nào đó. Giá rẻ nhưng lại
   phải maintain.
2. **Dùng headless CMS free tier**: Sanity, Strapi Cloud, Contentful, Tina...
   Nhìn xa xa thì free, nhưng hầu hết 2024–2025 đã siết lại. Supabase thì
   auto-pause sau 7 ngày không hoạt động. PlanetScale đã bỏ free tier từ tháng
   4/2024.
3. **Bỏ hẳn backend, lưu bài bằng Markdown trong Git**: [`@nuxt/content`](https://content.nuxt.com/)
   làm sẵn module này cho Nuxt.

## Vì sao chọn Markdown

Một câu hỏi đơn giản: *"Nếu dịch vụ mình chọn đóng cửa sau 2 năm, mình mất gì?"*

- Backend tự host: mất thời gian maintain, uptime, backup.
- Headless CMS: mất luôn dữ liệu nếu không export kịp, hoặc bị ép lên gói trả phí.
- Markdown + Git: **không mất gì cả**. File `.md` vẫn nằm đó, có thể deploy đi
  bất cứ đâu.

Ngoài ra:

- Bài viết được version hoá cùng code — `git log` ra lịch sử chỉnh sửa.
- Không cần auth, không cold start, không rate limit.
- Build ra static site, cache tốt, chạy nhanh.

Cái duy nhất hy sinh là **UI để viết bài**. Mình phải soạn trong editor
(VS Code, nvim, ...) rồi `git commit`. Với người làm dev solo thì không vấn đề,
thậm chí còn nhanh hơn.

## Code sample

Fetch danh sách bài viết giờ đơn giản thành một query tới local collection:

```ts
// Fetching posts is just a query against the local collection.
const { data: posts } = await useAsyncData('blog-list', () =>
  queryCollection('blog')
    .where('draft', '=', false)
    .order('publishedAt', 'DESC')
    .all()
)
```

Không có fetch network, không có try/catch cho API timeout, không có CORS —
build time đã resolve xong.

## Cấu trúc sau khi migrate

```
content/
  blog/
    hello-world.md
    claude-code-tro-ly-lap-trinh.md
pages/
  blog/
    index.vue          # list
    [slug].vue         # detail
    tag/[tag].vue
    category/[category].vue
  legacy-blogs/        # đóng băng code cũ, không động vào
```

Route `/legacy-blogs/*` vẫn còn đó để giữ link cũ, dù data đã chết — coi như
di tích.

## Kết

Nếu bạn đang cân nhắc làm blog cá nhân / portfolio và không có nhu cầu UI CMS
cho content team, thì markdown + `@nuxt/content` (hoặc Astro Content
Collections nếu dùng Astro) là lựa chọn gần như không có downside. Đừng phức
tạp hoá sớm.

More posts coming soon.
