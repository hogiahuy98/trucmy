import React from 'react'
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native'
import { COLORS } from './theme'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Huỷ',
  variant = 'default',
}: Props) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.box} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.desc}>{description}</Text> : null}
          <View style={styles.btns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, variant === 'danger' && styles.dangerBtn]}
              onPress={() => { onConfirm(); onClose() }}
            >
              <Text style={[styles.confirmText, variant === 'danger' && styles.dangerText]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  box: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  desc: { fontSize: 14, color: COLORS.muted, lineHeight: 20, marginBottom: 20 },
  btns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.cardAlt, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600', color: COLORS.muted },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center' },
  confirmText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  dangerBtn: { backgroundColor: COLORS.danger },
  dangerText: { color: '#FFF' },
})
