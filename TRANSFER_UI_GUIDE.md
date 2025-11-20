# Transfer UI Implementation Guide

## ✅ Backend Complete

All backend code is ready:
- ✅ Database schema: `transfers-schema.sql`
- ✅ SQL function updated: `finance-stats.sql`
- ✅ TypeScript types: `Transfer` interface in `types.ts`
- ✅ Server Actions: `getTransfers`, `addTransfer`, `updateTransfer`, `deleteTransfer` in `actions/finance.ts`
- ✅ Zustand store: Full CRUD + real-time + offline support in `store.ts`

## 🎨 UI Integration Needed

The `IncomeModal.tsx` component needs updates to add transfer functionality. The modal has duplicate sections (desktop + mobile), so changes need to be applied to both.

### Approach 1: Update Existing Modal (Recommended)

**Step 1: Add Transfer Props**

```tsx
interface IncomeModalProps {
  // ... existing props
  currentMonthTransfers: Transfer[]
  onAddTransfer: (amount: number, fromPerson: 'GH' | 'TM', toPerson: 'GH' | 'TM', note?: string, date?: Date) => Promise<void>
  onUpdateTransfer?: (transferId: number, amount: number, fromPerson: 'GH' | 'TM', toPerson: 'GH' | 'TM', note?: string) => Promise<void>
  onDeleteTransfer?: (transferId: number) => Promise<void>
}
```

**Step 2: Add State**

```tsx
const [activeTab, setActiveTab] = useState<'income' | 'transfer'>('income')
const [fromPerson, setFromPerson] = useState<'GH' | 'TM'>('GH')
const [toPerson, setToPerson] = useState<'GH' | 'TM'>('TM')
const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0])
const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null)
```

**Step 3: Add Tab UI** (before the h3 title)

```tsx
{/* Tabs */}
<div className="flex gap-2 mb-6 p-1 bg-warm-linen rounded-lg">
  <button
    onClick={() => setActiveTab('income')}
    className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
      activeTab === 'income'
        ? 'bg-white text-dark-olive shadow-sm'
        : 'text-olive-grey hover:text-dark-olive'
    }`}
  >
    💰 Thu nhập
  </button>
  <button
    onClick={() => setActiveTab('transfer')}
    className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
      activeTab === 'transfer'
        ? 'bg-white text-dark-olive shadow-sm'
        : 'text-olive-grey hover:text-dark-olive'
    }`}
  >
    ↔️ Chuyển tiền
  </button>
</div>
```

**Step 4: Add Transfer Form** (after income form, before buttons)

```tsx
{/* Transfer Form */}
{activeTab === 'transfer' && (
  <>
    <div className="mb-5">
      <label className="block mb-2 text-olive-grey text-[13px] font-medium">
        Số tiền
      </label>
      <div className="relative">
        <Input
          ref={valueInputRef}
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          placeholder="Nhập số (tự + .000đ)"
          inputMode="numeric"
          className="pr-32 text-base"
        />
        {prettyInput && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-grey text-[13px] pointer-events-none">
            {prettyInput}
          </span>
        )}
      </div>
    </div>

    <div className="mb-5 grid grid-cols-2 gap-3">
      <div>
        <label className="block mb-2 text-olive-grey text-[13px] font-medium">
          Từ
        </label>
        <Select
          value={fromPerson}
          onChange={(e) => setFromPerson(e.target.value as 'GH' | 'TM')}
          className="w-full text-base"
        >
          <option value="GH">GH</option>
          <option value="TM">TM</option>
        </Select>
      </div>
      <div>
        <label className="block mb-2 text-olive-grey text-[13px] font-medium">
          Đến
        </label>
        <Select
          value={toPerson}
          onChange={(e) => setToPerson(e.target.value as 'GH' | 'TM')}
          className="w-full text-base"
        >
          <option value="GH">GH</option>
          <option value="TM">TM</option>
        </Select>
      </div>
    </div>

    <div className="mb-5">
      <label className="block mb-2 text-olive-grey text-[13px] font-medium">
        Ghi chú (tùy chọn)
      </label>
      <Input
        value={noteInput}
        onChange={(e) => setNoteInput(e.target.value)}
        placeholder="VD: Hoàn tiền đi chợ..."
        className="text-base"
      />
    </div>

    <div className="mb-5">
      <label className="block mb-2 text-olive-grey text-[13px] font-medium">
        Ngày
      </label>
      <Input
        type="date"
        value={transferDate}
        onChange={(e) => setTransferDate(e.target.value)}
        className="text-base"
      />
    </div>
  </>
)}
```

**Step 5: Update Save Button**

```tsx
<Button
  variant="default"
  onClick={activeTab === 'income' ? handleSave : handleSaveTransfer}
  className="flex-1 h-12"
  disabled={isLoading || !valueInput}
>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Đang lưu...
    </>
  ) : activeTab === 'income' ? (
    editingIncome ? 'Cập nhật' : <><Plus size={16} className="mr-2" />Thêm</>
  ) : (
    editingTransfer ? 'Cập nhật' : <><ArrowRightLeft size={16} className="mr-2" />Chuyển</>
  )}
</Button>
```

**Step 6: Update Parent Component** (`page.tsx`)

```tsx
<IncomeModal
  open={showIncomeModal}
  onClose={() => setShowIncomeModal(false)}
  currentMonthIncomes={getCurrentMonthIncomes()}
  currentMonthTransfers={getCurrentMonthTransfers()}
  onAdd={addIncome}
  onUpdate={updateIncome}
  onDelete={deleteIncome}
  onAddTransfer={async (amount, fromPerson, toPerson, note, date) => {
    await addTransfer({
      amount,
      from_person: fromPerson,
      to_person: toPerson,
      note,
      date: date || new Date()
    })
  }}
  onUpdateTransfer={async (id, amount, fromPerson, toPerson, note) => {
    await updateTransfer(id, {
      amount,
      from_person: fromPerson,
      to_person: toPerson,
      note
    })
  }}
  onDeleteTransfer={deleteTransfer}
/>
```

### Approach 2: Create Separate Transfer Modal (Simpler)

If updating the existing modal is too complex, create a new `TransferModal.tsx` component and add a separate button to open it.

## Next Steps

1. Run database migration:
   ```bash
   # Copy transfers-schema.sql to Supabase SQL Editor and run
   # Copy updated finance-stats.sql to Supabase SQL Editor and run
   ```

2. Update UI following Approach 1 or 2

3. Test the feature!

## Testing Checklist

- [ ] Create transfer GH → TM
- [ ] Create transfer TM → GH
- [ ] Edit transfer
- [ ] Delete transfer
- [ ] Check balance updates correctly
- [ ] Test offline mode
- [ ] Test real-time sync (open 2 tabs)
