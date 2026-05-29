import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const DAILY_REMINDER_ID = 'daily-expense-reminder'
const REMINDER_HOUR = 21 // 9h tối
const REMINDER_MINUTE = 0

// Hiển thị notification ngay cả khi app đang mở
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  let status = existing
  if (existing !== 'granted') {
    const res = await Notifications.requestPermissionsAsync()
    status = res.status
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Nhắc nhập chi tiêu',
      importance: Notifications.AndroidImportance.DEFAULT,
    })
  }

  return status === 'granted'
}

/** Lên lịch thông báo nhắc nhập chi tiêu mỗi ngày lúc 21:00 */
export async function scheduleDailyReminder(): Promise<boolean> {
  const granted = await requestNotificationPermission()
  if (!granted) return false

  // Xoá lịch cũ trước khi tạo mới để tránh trùng
  await cancelDailyReminder()

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: 'Chi tiêu Huy My 🥑',
      body: 'Đừng quên ghi lại chi tiêu hôm nay nhé!',
      sound: true,
    },
    trigger: {
      hour: REMINDER_HOUR,
      minute: REMINDER_MINUTE,
      repeats: true,
    },
  })

  return true
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID)
  } catch {
    // ignore nếu chưa có lịch nào
  }
}

export async function isDailyReminderScheduled(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  return scheduled.some((n) => n.identifier === DAILY_REMINDER_ID)
}
