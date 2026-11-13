import { usePricing } from '../hooks/usePricing'

export default function SelectedMaterialField({ value, onChange, editing }) {
  const { pricing } = usePricing()
  const materialNames = pricing ? pricing.slabs.map((s) => s.name) : []
  const isKnown = materialNames.includes(value)
  const isOther = value === '' || !isKnown

  const handleSelectChange = (e) => {
    const next = e.target.value
    onChange({ target: { name: 'selectedMaterial', value: next === 'Other' ? '' : next } })
  }

  const handleTextChange = (e) => {
    onChange({ target: { name: 'selectedMaterial', value: e.target.value } })
  }

  return (
    <>
      <select value={isOther ? 'Other' : value} onChange={handleSelectChange}>
        <option value="Other">Other</option>
        {materialNames.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      {isOther && (
        <input
          type="text"
          className="material-other-input"
          value={value}
          onChange={handleTextChange}
          placeholder="Enter material name"
          disabled={editing === false}
        />
      )}
    </>
  )
}
