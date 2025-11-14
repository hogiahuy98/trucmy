"use client"

import * as React from "react"
import ReactDatePicker, { registerLocale } from "react-datepicker"
import { vi } from "date-fns/locale/vi"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import "react-datepicker/dist/react-datepicker.css"

// Register Vietnamese locale
registerLocale("vi", vi)

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled,
  className,
}: DatePickerProps) {
  return (
    <div className={cn("relative", className)}>
      <ReactDatePicker
        selected={value}
        onChange={(date: Date | null) => onChange?.(date || undefined)}
        dateFormat="dd/MM/yyyy"
        locale="vi"
        disabled={disabled}
        placeholderText={placeholder}
        className={cn(
          "w-full h-10 pl-10 pr-3 rounded-lg border transition-colors text-sm",
          "bg-warm-linen border-olive-grey/20 hover:bg-sage/50",
          "focus:outline-none focus:ring-2 focus:ring-avocado-green/20 focus:border-avocado-green",
          !value && "text-olive-grey",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        calendarClassName="date-picker-calendar"
        wrapperClassName="w-full"
      />
      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-olive-grey pointer-events-none" />
      
      <style jsx global>{`
        .date-picker-calendar {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
          border: 1px solid #D8E2D0 !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(111, 143, 95, 0.12) !important;
          background: #EFECE6 !important;
        }
        
        .react-datepicker__header {
          background-color: #D8E2D0 !important;
          border-bottom: none !important;
          border-radius: 12px 12px 0 0 !important;
          padding-top: 12px !important;
        }
        
        .react-datepicker__current-month {
          color: #4A4F3B !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          margin-bottom: 8px !important;
        }
        
        .react-datepicker__day-name {
          color: #8B8F7A !important;
          font-size: 12px !important;
          width: 32px !important;
          line-height: 32px !important;
        }
        
        .react-datepicker__day {
          color: #4A4F3B !important;
          font-size: 13px !important;
          width: 32px !important;
          line-height: 32px !important;
          border-radius: 8px !important;
          transition: all 0.2s !important;
        }
        
        .react-datepicker__day:hover {
          background-color: #D8E2D0 !important;
          border-radius: 8px !important;
        }
        
        .react-datepicker__day--selected {
          background-color: #A3C68C !important;
          color: white !important;
          font-weight: 600 !important;
        }
        
        .react-datepicker__day--keyboard-selected {
          background-color: #A3C68C !important;
          color: white !important;
        }
        
        .react-datepicker__day--today {
          background-color: #FAF8F4 !important;
          font-weight: 600 !important;
          border: 1px solid #A3C68C !important;
        }
        
        .react-datepicker__day--disabled {
          color: #8B8F7A !important;
          opacity: 0.5 !important;
        }
        
        .react-datepicker__day--outside-month {
          color: #8B8F7A !important;
          opacity: 0.4 !important;
        }
        
        .react-datepicker__navigation {
          top: 12px !important;
        }
        
        .react-datepicker__navigation-icon::before {
          border-color: #4A4F3B !important;
        }
        
        .react-datepicker__month {
          background-color: #EFECE6 !important;
          padding: 8px !important;
        }
        
        .react-datepicker__triangle {
          display: none !important;
        }
      `}</style>
    </div>
  )
}

