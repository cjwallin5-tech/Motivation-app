import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import type { PetSpecies } from '../petSpecies'
import { DEFAULT_VARIANT_ID, SPECIES_BY_ID, STARTER_SPECIES, VARIANTS } from '../petSpecies'

interface Props {
  onChoose: (id: string, name: string, variantId: string) => void
}

function SpeciesThumb({
  species,
  variantId,
  big,
}: {
  species: PetSpecies
  variantId: string
  big?: boolean
}) {
  return (
    <span
      className={`species-thumb${big ? ' big' : ''}`}
      style={{
        backgroundImage: `url(/pet/${species.id}-${variantId}-dragon.png)`,
        backgroundSize: '500% 100%',
      }}
    />
  )
}

export function StarterPicker({ onChoose }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [variantId, setVariantId] = useState(DEFAULT_VARIANT_ID)
  const [name, setName] = useState('')

  if (selectedId) {
    const species = SPECIES_BY_ID[selectedId]

    function handleSubmit(e: FormEvent) {
      e.preventDefault()
      onChoose(selectedId as string, name.trim() || species.name, variantId)
    }

    return (
      <div className="starter-picker">
        <form className="starter-name-step" onSubmit={handleSubmit}>
          <SpeciesThumb species={species} variantId={variantId} big />

          <div className="variant-swatches">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`variant-swatch${v.id === variantId ? ' selected' : ''}`}
                onClick={() => setVariantId(v.id)}
                aria-label={v.name}
                title={v.name}
                style={{
                  backgroundImage: `url(/pet/${species.id}-${v.id}-dragon.png)`,
                  backgroundSize: '500% 100%',
                }}
              />
            ))}
          </div>

          <div className="starter-picker-copy">
            <h1>Name your {species.animal.toLowerCase()}</h1>
            <p>You can always change it later.</p>
          </div>
          <input
            className="starter-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={species.name}
            maxLength={24}
            autoFocus
          />
          <div className="starter-name-actions">
            <button type="button" className="starter-back" onClick={() => setSelectedId(null)}>
              Back
            </button>
            <button type="submit" className="starter-confirm">
              Let's go
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="starter-picker">
      <div className="starter-picker-copy">
        <h1>Choose your companion</h1>
        <p>They’ll grow alongside you as you check things off. You’ll meet more along the way.</p>
      </div>
      <div className="species-grid">
        {STARTER_SPECIES.map((species) => (
          <button
            key={species.id}
            type="button"
            className="species-card"
            style={{ '--species-accent': species.accent } as CSSProperties}
            onClick={() => {
              setVariantId(DEFAULT_VARIANT_ID)
              setSelectedId(species.id)
            }}
          >
            <SpeciesThumb species={species} variantId={DEFAULT_VARIANT_ID} />
            <span className="species-name">{species.name}</span>
            <span className="species-animal">{species.animal}</span>
            <span className="species-tagline">{species.tagline}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
