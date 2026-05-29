import { ViewStyle } from 'react-native'

export const COLORS = {
  bg: '#FAF8F4',
  card: '#FFFFFF',
  cardAlt: '#F2EFE9',
  text: '#2D2A24',
  muted: '#7A7060',
  border: '#E8E4DC',
  gh: '#A3C68C',
  ghDark: '#6F8F5F',
  tm: '#9B8FD4',
  tmDark: '#6B5FB0',
  both: '#E69D87',
  accent: '#A3C68C',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
}

export const CARD_STYLE: ViewStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 16,
  marginBottom: 0,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
}

export const PERSON_COLORS: Record<string, string> = {
  GH: COLORS.gh,
  TM: COLORS.tm,
  Both: COLORS.both,
}

export const PERSON_LABELS: Record<string, string> = {
  GH: 'GH',
  TM: 'TM',
  Both: 'Cả 2',
}
