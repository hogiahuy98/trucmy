"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  variant = "danger",
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Reset loading when modal closes
  useEffect(() => {
    if (!open) {
      setIsLoading(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error in confirm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const variantStyles = {
    danger: {
      iconColor: "#EF4444",
      iconBg: "#FEE2E2",
      confirmBg: "#EF4444",
      confirmHoverBg: "#DC2626",
    },
    warning: {
      iconColor: "#F59E0B",
      iconBg: "#FEF3C7",
      confirmBg: "#F59E0B",
      confirmHoverBg: "#D97706",
    },
    info: {
      iconColor: "#3B82F6",
      iconBg: "#DBEAFE",
      confirmBg: "#3B82F6",
      confirmHoverBg: "#2563EB",
    },
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm"
          />

          {/* Modal - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-cream rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[1001] p-6"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: styles.iconBg,
                }}
              >
                <AlertTriangle
                  size={28}
                  strokeWidth={2}
                  style={{ color: styles.iconColor }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-dark-olive mb-2">
                {title}
              </h3>
              <p className="text-olive-grey text-[15px] leading-relaxed">
                {description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11"
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 h-11 text-white"
                disabled={isLoading}
                style={{
                  backgroundColor: styles.confirmBg,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = styles.confirmHoverBg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = styles.confirmBg;
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

