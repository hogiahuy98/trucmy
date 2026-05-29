# Chi tiêu Huy My — Mobile (Expo React Native)

App quản lý chi tiêu cho hai người, build bằng Expo React Native.
Dùng chung Supabase database với bản web, realtime sync giữa 2 điện thoại.

## Cài đặt & chạy

```bash
cd chi-tieu-mobile
npm install
npx expo start
```

Sau đó scan QR bằng app **Expo Go** trên iPhone.

## Cấu trúc

```
app/
  _layout.tsx      # Root layout, SafeAreaProvider, NetInfo listener
  index.tsx        # Màn hình chính
  thong-ke.tsx     # Màn hình thống kê
store/
  finance.ts       # Zustand store (business logic)
components/        # UI components
lib/
  supabase.ts      # Supabase client
types/
  index.ts         # TypeScript types
utils/
  index.ts         # formatVND, formatDate
```

## Build không cần App Store

- **Test nhanh (UI/logic)**: `npx expo start` → scan QR bằng Expo Go
- **Build native**: cần Apple Developer account ($99/năm) + `eas build --profile preview`

## Quick Action (long-press icon) & Thông báo

Quick Action cần **dev build** (không chạy trong Expo Go vì sửa native Info.plist).
Trên máy Mac có Xcode, chạy dev build cục bộ:

```bash
# Tạo native project + build vào simulator/iPhone
npx expo run:ios
```

Sau khi build xong, long-press icon app sẽ hiện:
- "Thêm chi tiêu nhanh" → mở thẳng form thêm nhanh
- "Xem thống kê" → mở màn hình thống kê

Thông báo nhắc 9h tối: bật bằng nút chuông ở góc trên màn hình chính.

## Env

Tạo file `.env` với:
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```
