"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Home,
  ShoppingCart,
  Clapperboard,
  Wifi,
  Utensils,
  Tag as TagIcon,
  Loader2,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import type { Category, Expense } from "../types";
import { useFinanceStore } from "../store";

const iconMap: Record<
  string,
  React.ComponentType<{ size: number; strokeWidth: number }>
> = {
  coffee: Coffee,
  home: Home,
  "shopping-cart": ShoppingCart,
  clapperboard: Clapperboard,
  wifi: Wifi,
  utensils: Utensils,
  tag: TagIcon,
};

interface QuickAddExpenseProps {
  open: boolean;
  onClose: () => void;
  onOpenFullModal: () => void;
}

// Calculate top categories from expense history
function getTopCategories(
  expenses: Expense[],
  allCategories: Category[],
  limit: number = 6
): Category[] {
  // Count category usage
  const categoryCount: Record<string, number> = {};
  expenses.forEach((expense) => {
    categoryCount[expense.category] = (categoryCount[expense.category] || 0) + 1;
  });

  // Sort by count and get top categories
  const sortedCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([key]) => key);

  // Get category objects, preserving order
  const topCategories: Category[] = [];
  for (const key of sortedCategories) {
    const category = allCategories.find((c) => c.key === key && !c.disabled);
    if (category) {
      topCategories.push(category);
    }
  }

  // If we don't have enough, fill with default categories
  if (topCategories.length < limit) {
    const remaining = allCategories
      .filter((c) => !c.disabled && !topCategories.some((tc) => tc.key === c.key))
      .slice(0, limit - topCategories.length);
    topCategories.push(...remaining);
  }

  return topCategories.slice(0, limit);
}

// Get person preference from localStorage or default to "TM"
function getPersonPreference(): "GH" | "TM" | "Both" {
  if (typeof window === "undefined") return "TM";
  const saved = localStorage.getItem("quickAddPersonPreference");
  if (saved === "GH" || saved === "TM" || saved === "Both") {
    return saved;
  }
  return "TM";
}

// Save person preference
function savePersonPreference(person: "GH" | "TM" | "Both") {
  if (typeof window !== "undefined") {
    localStorage.setItem("quickAddPersonPreference", person);
  }
}

export default function QuickAddExpense({
  open,
  onClose,
  onOpenFullModal,
}: QuickAddExpenseProps) {
  const expenses = useFinanceStore((s) => s.expenses);
  const categories = useFinanceStore((s) => s.categories);
  const addExpense = useFinanceStore((s) => s.addExpense);

  const [amountInput, setAmountInput] = useState("");
  const [category, setCategory] = useState<string>("");
  const [person, setPerson] = useState<"GH" | "TM" | "Both">(getPersonPreference());
  const [isLoading, setIsLoading] = useState(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Calculate top categories
  const topCategories = useMemo(
    () => getTopCategories(expenses, categories, 6),
    [expenses, categories]
  );

  // Set default category when categories are loaded
  useEffect(() => {
    if (topCategories.length > 0 && !category) {
      setCategory(topCategories[0].key);
    }
  }, [topCategories, category]);

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setAmountInput("");
      setCategory(topCategories[0]?.key || "");
      setPerson(getPersonPreference());
      // Auto-focus after a short delay to ensure modal is rendered
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [open, topCategories]);

  // Handle person change and save preference
  const handlePersonChange = (p: "GH" | "TM" | "Both") => {
    setPerson(p);
    savePersonPreference(p);
  };

  // Format amount display
  const prettyInput = amountInput
    ? `${parseInt(amountInput.replace(/\D/g, ""), 10).toLocaleString("vi-VN")}.000đ`
    : "";

  // Handle submit
  const handleSubmit = async () => {
    const num = parseInt((amountInput || "0").replace(/\D/g, ""), 10);
    if (!num || num <= 0) {
      toast.warning("Nhập số tiền hợp lệ nhé!");
      amountInputRef.current?.focus();
      return;
    }

    if (!category) {
      toast.warning("Chọn danh mục nhé!");
      return;
    }

    setIsLoading(true);

    try {
      const amount = num * 1000;
      await addExpense({
        id: Date.now(),
        amount,
        person,
        category,
        note: null,
        date: new Date(),
      });

      // Haptic feedback (if supported)
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(50);
      }

      toast.success("Đã ghi chi tiêu", {
        description: "Cảm ơn vì sự chia sẻ 💛",
        duration: 2000,
      });

      onClose();
      setAmountInput("");
    } catch (error) {
      toast.error("Lỗi", {
        description: "Có lỗi xảy ra, vui lòng thử lại",
        duration: 2500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard submit (Enter key)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && amountInput && category) {
      handleSubmit();
    }
  };

  const isValid = amountInput && category && parseInt(amountInput.replace(/\D/g, ""), 10) > 0;

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
            className="md:hidden fixed inset-0 bg-black/30 z-[1000]"
          />

          {/* Mobile Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-cream rounded-t-3xl shadow-[0_-4px_24px_rgba(111,143,95,0.12)] z-[1001] max-h-[85vh] overflow-y-auto"
            style={{
              paddingBottom: "max(24px, env(safe-area-inset-bottom))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-10 h-1 bg-olive-grey rounded-sm mx-auto mt-4 mb-6 opacity-40" />

            <div className="px-6 pb-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-dark-olive">
                  Thêm nhanh
                </h3>
                <button
                  onClick={onOpenFullModal}
                  className="text-sm text-olive-grey flex items-center gap-1.5 hover:text-dark-olive transition-colors"
                >
                  <Edit3 size={14} />
                  <span>Chi tiết</span>
                </button>
              </div>

              {/* Amount Input - Large */}
              <div className="mb-6">
                <div className="relative">
                  <Input
                    ref={amountInputRef}
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập số tiền"
                    inputMode="numeric"
                    className="text-2xl font-semibold h-16 pr-32 text-center"
                    style={{ fontSize: "28px" }}
                  />
                  {prettyInput && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-olive-grey text-sm pointer-events-none">
                      {prettyInput}
                    </span>
                  )}
                </div>
                <p className="text-xs text-olive-grey mt-2 text-center">
                  Tự động thêm .000đ
                </p>
              </div>

              {/* Category Chips - Grid 2 columns, large */}
              <div className="mb-6">
                <label className="block mb-3 text-olive-grey text-sm font-medium">
                  Danh mục
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {topCategories.map((c) => {
                    const Icon = iconMap[c.icon];
                    const active = category === c.key;
                    return (
                      <motion.button
                        key={c.key}
                        type="button"
                        onClick={() => setCategory(c.key)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-base transition-all"
                        style={{
                          border: `2px solid ${active ? c.color : "#D8E2D0"}`,
                          backgroundColor: active ? `${c.color}20` : "#EFECE6",
                          color: active ? c.color : "#8B8F7A",
                          fontWeight: active ? 600 : 500,
                        }}
                      >
                        <Icon size={20} strokeWidth={1.5} />
                        <span>{c.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Person Selector - Large buttons */}
              <div className="mb-6">
                <label className="block mb-3 text-olive-grey text-sm font-medium">
                  Ai chi trả?
                </label>
                <div className="flex gap-3">
                  {(["GH", "Both", "TM"] as const).map((p) => (
                    <motion.button
                      key={p}
                      type="button"
                      onClick={() => handlePersonChange(p)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3.5 rounded-xl border-2 text-base font-medium transition-all"
                      style={{
                        borderColor: person === p ? "#A3C68C" : "#D8E2D0",
                        backgroundColor: person === p ? "#A3C68C" : "#EFECE6",
                        color: person === p ? "white" : "#8B8F7A",
                        fontWeight: person === p ? 600 : 500,
                      }}
                    >
                      {p === "Both" ? "Cả hai" : p}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Date info (read-only) */}
              <div className="mb-6 text-center">
                <p className="text-xs text-olive-grey">
                  Ngày: {new Date().toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>

              {/* Submit Button - Large */}
              <Button
                onClick={handleSubmit}
                disabled={!isValid || isLoading}
                className="w-full h-14 text-base font-semibold rounded-xl"
                style={{
                  backgroundColor: isValid ? "#A3C68C" : "#D8E2D0",
                  color: isValid ? "white" : "#8B8F7A",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  "Thêm chi tiêu"
                )}
              </Button>

              {/* Cancel button */}
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="w-full mt-3 h-12 text-olive-grey hover:text-dark-olive"
              >
                Huỷ
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

