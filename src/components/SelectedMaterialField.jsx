import { SLAB_PRICES } from '../data/slabPrices'

const MATERIAL_NAMES = SLAB_PRICES.map((s) => s.name)

export default function SelectedMaterialField({ value, onChange, editing }) {
  const isKnown = MATERIAL_NAMES.includes(value)
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
        {MATERIAL_NAMES.map((name) => (
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
