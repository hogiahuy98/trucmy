import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, Pressable } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from './theme'
import { formatDate } from '../utils'

interface Props {
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  placeholder?: string
  style?: object
}

function toYMD(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function DatePicker({ value, onChange, placeholder = 'Chọn ngày', style }: Props) {
  const [show, setShow] = useState(false)
  const [temp, setTemp] = useState<Date>(value ? new Date(value) : new Date())

  const open = () => {
    setTemp(value ? new Date(value) : new Date())
    setShow(true)
  }

  const handleAndroidChange = (event: any, selected?: Date) => {
    setShow(false)
    if (event.type === 'set' && selected) onChange(toYMD(selected))
  }

  return (
    <>
      <TouchableOpacity style={[styles.field, style]} onPress={open} activeOpacity={0.7}>
        <Text style={[styles.fieldText, !value && styles.placeholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={16} color={COLORS.muted} />
      </TouchableOpacity>

      {/* Android: native dialog */}
      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={temp}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
        />
      )}

      {/* iOS: bottom sheet with spinner + confirm */}
      {Platform.OS === 'ios' && (
        <Modal visible={show} transparent animationType="slide" onRequestClose={() => setShow(false)}>
          <Pressable style={styles.overlay} onPress={() => setShow(false)}>
            <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.cancelText}>Huỷ</Text>
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>Chọn ngày</Text>
                <TouchableOpacity onPress={() => { onChange(toYMD(temp)); setShow(false) }}>
                  <Text style={styles.doneText}>Xong</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={temp}
                mode="date"
                display="spinner"
                themeVariant="light"
                onChange={(_, selected) => { if (selected) setTemp(selected) }}
                style={styles.iosPicker}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardAlt,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldText: { fontSize: 15, color: COLORS.text },
  placeholder: { color: COLORS.muted },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: COLORS.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 20 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cancelText: { fontSize: 15, color: COLORS.muted },
  doneText: { fontSize: 15, fontWeight: '700', color: COLORS.ghDark },
  iosPicker: { height: 200 },
})
