import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import NetInfo from '@react-native-community/netinfo'
import * as QuickActions from 'expo-quick-actions'
import { useFinanceStore } from '../store/finance'
import { useUIStore } from '../store/ui'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const setOnlineStatus = useFinanceStore((s) => s.setOnlineStatus)
  const requestQuickAdd = useUIStore((s) => s.requestQuickAdd)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnlineStatus(state.isConnected ?? true)
    })
    return () => unsubscribe()
  }, [setOnlineStatus])

  // Xử lý khi mở app bằng quick action (long-press icon)
  useEffect(() => {
    const handle = (action: QuickActions.Action | null | undefined) => {
      if (!action) return
      if (action.id === 'quick-add') {
        router.navigate('/')
        requestQuickAdd()
      } else if (action.id === 'stats') {
        router.navigate('/thong-ke')
      }
    }

    // Action đã mở app khi còn tắt hẳn
    handle(QuickActions.initial)

    // Action khi app đang chạy nền
    const sub = QuickActions.addListener(handle)
    return () => sub.remove()
  }, [requestQuickAdd])

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="thong-ke"
          options={{
            title: 'Thống kê chi tiêu',
            headerBackTitle: 'Quay lại',
            headerStyle: { backgroundColor: '#FAF8F4' },
            headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  )
}
