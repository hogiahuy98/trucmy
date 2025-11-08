# Supabase Setup Guide

Hướng dẫn setup Supabase để đồng bộ dữ liệu chi tiêu giữa các thiết bị.

## Bước 1: Tạo Supabase Project

1. Truy cập [supabase.com](https://supabase.com) và đăng ký/đăng nhập
2. Click "New Project"
3. Điền thông tin:
   - **Name**: `gh-tm-finance` (hoặc tên bạn muốn)
   - **Database Password**: Tạo password mạnh (lưu lại để dùng sau)
   - **Region**: Chọn gần nhất (Singapore cho VN)
4. Click "Create new project" và đợi ~2 phút

## Bước 2: Lấy API Credentials

1. Vào project vừa tạo
2. Click vào **Settings** (icon bánh răng) ở sidebar trái
3. Click **API** trong menu
4. Copy 2 giá trị:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Bước 3: Setup Database Schema

1. Trong Supabase dashboard, click **SQL Editor** ở sidebar trái
2. Click **New query**
3. Copy toàn bộ nội dung file `supabase-schema.sql`
4. Paste vào editor và click **Run** (hoặc Ctrl+Enter)
5. Kiểm tra kết quả: nên thấy "Success. No rows returned"

## Bước 4: Cấu hình Environment Variables

1. Tạo file `.env.local` trong root project (nếu chưa có)
2. Thêm 2 dòng:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Thay `your-project-url-here` và `your-anon-key-here` bằng giá trị đã copy ở Bước 2

## Bước 5: Test

1. Restart dev server: `yarn dev`
2. Mở `http://localhost:3000/chi-tieu`
3. Thử thêm một expense mới
4. Kiểm tra trong Supabase dashboard → **Table Editor** → `expenses` table để thấy dữ liệu

## Tính năng

- ✅ **Real-time sync**: Thay đổi từ thiết bị này tự động hiện trên thiết bị khác
- ✅ **Offline support**: Làm việc offline, tự động sync khi online lại
- ✅ **Error handling**: Tự động retry khi sync fail
- ✅ **Optimistic updates**: UI update ngay, sync ở background

## Troubleshooting

### Lỗi "Supabase not configured"
- Kiểm tra file `.env.local` có đúng format không
- Restart dev server sau khi thêm env variables
- Kiểm tra credentials có đúng không

### Real-time không hoạt động
- Kiểm tra trong Supabase dashboard → **Database** → **Replication**
- Đảm bảo `categories` và `expenses` tables đã enable replication

### Data không sync
- Kiểm tra browser console có lỗi không
- Kiểm tra network tab xem có request đến Supabase không
- Kiểm tra RLS policies trong Supabase dashboard

## Free Tier Limits

Supabase free tier cung cấp:
- 500MB database storage
- 2GB bandwidth/month
- Unlimited API requests
- Đủ cho personal use!

## Security Note

File `.env.local` đã được gitignore, không commit lên GitHub.
Nếu deploy lên Vercel/Netlify, nhớ thêm env variables trong dashboard của hosting platform.

