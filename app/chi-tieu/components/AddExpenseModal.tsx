"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Home,
  ShoppingCart,
  Clapperboard,
  Wifi,
  Utensils,
  Tag as TagIcon,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import type { Category } from "../types";

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

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (expense: {
    id: number;
    amount: number;
    person: "GH" | "TM" | "Both";
    category: string;
    note: string;
    date: Date;
  }) => Promise<void>;
  onAddCategory: (label: string) => Promise<void>;
}

// Tách FormContent ra ngoài để tránh re-create và lost focus
interface FormContentProps {
  amountInput: string;
  setAmountInput: (value: string) => void;
  prettyInput: string;
  categories: Category[];
  category: string;
  setCategory: (value: string) => void;
  customCategory: string;
  setCustomCategory: (value: string) => void;
  person: "GH" | "TM" | "Both";
  setPerson: (value: "GH" | "TM" | "Both") => void;
  date: Date;
  setDate: (value: Date) => void;
  note: string;
  setNote: (value: string) => void;
  onClose: () => void;
  handleAdd: () => void;
}

function FormContent({
  amountInput,
  setAmountInput,
  prettyInput,
  categories,
  category,
  setCategory,
  customCategory,
  setCustomCategory,
  person,
  setPerson,
  date,
  setDate,
  note,
  setNote,
  onClose,
  handleAdd,
}: FormContentProps) {
  return (
    <>
      <h3 className="text-xl font-semibold text-dark-olive mb-6 text-center md:text-left">
        Thêm chi tiêu
      </h3>
      <div className="mb-5">
        <label className="block mb-2 text-olive-grey text-[13px] font-medium">
          Số tiền
        </label>
        <div className="relative">
          <Input
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="Nhập số (tự + .000đ)"
            inputMode="numeric"
            className="pr-32 text-base md:text-base"
            style={{ fontSize: '16px' }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-grey text-[13px] pointer-events-none">
            {prettyInput}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <label className="block mb-2 text-olive-grey text-[13px] font-medium">
          Danh mục
        </label>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 mt-2">
          {categories.map((c) => {
            const Icon = iconMap[c.icon];
            const active = category === c.key;
            return (
              <motion.button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] transition-all truncate"
                style={{
                  border: `1.5px solid ${active ? c.color : "#D8E2D0"}`,
                  backgroundColor: active ? `${c.color}25` : "#EFECE6",
                  color: active ? c.color : "#8B8F7A",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={16} strokeWidth={1.5} /> {c.label}
              </motion.button>
            );
          })}
          <motion.button
            type="button"
            onClick={() => setCategory("custom")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px]"
            style={{
              border: `1.5px solid ${
                category === "custom" ? "#A3C68C" : "#D8E2D0"
              }`,
              backgroundColor:
                category === "custom" ? "#A3C68C25" : "#EFECE6",
              color: category === "custom" ? "#A3C68C" : "#8B8F7A",
              fontWeight: category === "custom" ? 600 : 500,
            }}
          >
            <Plus size={16} strokeWidth={1.5} /> Thêm
          </motion.button>
        </div>
        {category === "custom" && (
          <Input
            className="mt-3"
            placeholder="Tên danh mục mới"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            style={{ fontSize: '16px' }}
          />
        )}
      </div>

      <div className="mt-5">
        <label className="block mb-2 text-olive-grey text-[13px] font-medium">
          Ai chi trả?
        </label>
        <div className="flex gap-2">
          {(["GH", "Both", "TM"] as const).map((p) => (
            <motion.button
              key={p}
              type="button"
              onClick={() => setPerson(p)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-2.5 rounded-lg border border-sage text-sm cursor-pointer transition-all"
              style={{
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

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <label className="block mb-2 text-olive-grey text-[13px] font-medium">
            Ngày
          </label>
          <DatePicker
            value={date}
            onChange={(d) => setDate(d || new Date())}
            placeholder="Chọn ngày"
          />
        </div>
        <div>
          <label className="block mb-2 text-olive-grey text-[13px] font-medium">
            Ghi chú
          </label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tuỳ chọn"
            style={{ fontSize: '16px' }}
          />
        </div>
      </div>

      <div className="mt-7 flex gap-3 pb-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 h-12"
        >
          Huỷ
        </Button>
        <Button
          variant="default"
          onClick={handleAdd}
          className="flex-1 h-12"
        >
          Thêm
        </Button>
      </div>
    </>
  );
}

export default function AddExpenseModal({
  open,
  onClose,
  categories,
  onAdd,
  onAddCategory,
}: AddExpenseModalProps) {
  const [amountInput, setAmountInput] = useState("");
  const [category, setCategory] = useState(categories[0]?.key || "cafe");
  const [person, setPerson] = useState<"GH" | "TM" | "Both">("TM");
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const prettyInput = amountInput
    ? `${parseInt(amountInput.replace(/\D/g, ""), 10).toLocaleString(
        "vi-VN"
      )}.000đ`
    : "";

  const handleAdd = async () => {
    const num = parseInt((amountInput || "0").replace(/\D/g, ""), 10);
    if (!num || num <= 0) {
      toast.warning("Nhập số tiền hợp lệ nhé!");
      return;
    }

    let usedCategory = category;
    if (category === "custom") {
      const label = customCategory.trim();
      if (!label) {
        toast.warning("Nhập tên danh mục");
        return;
      }
      await onAddCategory(label);
      usedCategory = label.trim().toLowerCase().replace(/\s+/g, "-");
    }

    const amount = num * 1000;
    const payload = {
      id: Date.now(),
      amount,
      person,
      category: usedCategory,
      note: note.trim(),
      date,
    };

    await onAdd(payload);
    onClose();
    setAmountInput("");
    setNote("");
    setCustomCategory("");

    toast.success("Đã ghi chi tiêu", {
      description: "Cảm ơn vì sự chia sẻ 💛",
      duration: 2500,
    });
  };

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
            className="fixed inset-0 bg-black/30 z-[1000]"
          />
          
          {/* Desktop Modal - Centered Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-cream rounded-2xl shadow-[0_8px_32px_rgba(111,143,95,0.16)] z-[1001] max-h-[85vh] overflow-y-auto p-6"
          >
            <FormContent
              amountInput={amountInput}
              setAmountInput={setAmountInput}
              prettyInput={prettyInput}
              categories={categories}
              category={category}
              setCategory={setCategory}
              customCategory={customCategory}
              setCustomCategory={setCustomCategory}
              person={person}
              setPerson={setPerson}
              date={date}
              setDate={setDate}
              note={note}
              setNote={setNote}
              onClose={onClose}
              handleAdd={handleAdd}
            />
          </motion.div>

          {/* Mobile Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-cream rounded-t-3xl shadow-[0_-4px_24px_rgba(111,143,95,0.12)] z-[1001] max-h-[90vh] overflow-y-auto p-6"
            style={{
              paddingBottom: "max(24px, env(safe-area-inset-bottom))",
            }}
          >
            {/* Handle bar - only on mobile */}
            <div className="w-10 h-1 bg-olive-grey rounded-sm mx-auto mb-5 opacity-40" />
            <FormContent
              amountInput={amountInput}
              setAmountInput={setAmountInput}
              prettyInput={prettyInput}
              categories={categories}
              category={category}
              setCategory={setCategory}
              customCategory={customCategory}
              setCustomCategory={setCustomCategory}
              person={person}
              setPerson={setPerson}
              date={date}
              setDate={setDate}
              note={note}
              setNote={setNote}
              onClose={onClose}
              handleAdd={handleAdd}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
