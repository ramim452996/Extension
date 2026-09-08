interface GoalInputProps {
  value: string
  onChange: (value: string) => void
}

export default function GoalInput({ value, onChange }: GoalInputProps) {
  return (
    <div className="px-4 pb-3">
      <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
        What matters to you? — Optional
      </label>
      <textarea
        id="goal-input"
        className="goal-input"
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='e.g. "Best for programming under Tk 80,000"'
        maxLength={300}
      />
    </div>
  )
}
