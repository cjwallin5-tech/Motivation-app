import type { CSSProperties } from 'react'
import { ALL_SPECIES, DEFAULT_VARIANT_ID, SPECIES_BY_ID, VARIANTS } from '../petSpecies'
import { NONE_OUTFIT_ID, OUTFITS } from '../outfits'
import { CLASSIC_TREAT_ID, TREATS } from '../treats'
import { CLASSIC_TOY_ID, TOYS } from '../toys'
import { CheckIcon, CloseIcon, LockIcon, SparkleIcon } from './icons'

interface Props {
  open: boolean
  onClose: () => void
  unlockedSpecies: string[]
  activeSpeciesId: string
  speciesVariant: Record<string, string>
  pendingChoice: { level: number; options: string[] } | null
  onSwitch: (id: string) => void
  onResolveChoice: (id: string) => void
  onSetVariant: (speciesId: string, variantId: string) => void
  unlockedOutfits: string[]
  outfitBySpecies: Record<string, string>
  onSetOutfit: (speciesId: string, outfitId: string) => void
  unlockedTreats: string[]
  equippedTreatId: string
  onSetTreat: (id: string) => void
  unlockedToys: string[]
  equippedToyId: string
  onSetToy: (id: string) => void
}

export function CompanionsModal({
  open,
  onClose,
  unlockedSpecies,
  activeSpeciesId,
  speciesVariant,
  pendingChoice,
  onSwitch,
  onResolveChoice,
  onSetVariant,
  unlockedOutfits,
  outfitBySpecies,
  onSetOutfit,
  unlockedTreats,
  equippedTreatId,
  onSetTreat,
  unlockedToys,
  equippedToyId,
  onSetToy,
}: Props) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h1>Companions</h1>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          {pendingChoice && (
            <div className="species-choice">
              <p className="species-choice-title">
                <SparkleIcon /> A new companion wants to join you
              </p>
              <div className="species-grid">
                {pendingChoice.options.map((id) => {
                  const species = SPECIES_BY_ID[id]
                  return (
                    <button
                      key={id}
                      type="button"
                      className="species-card"
                      style={{ '--species-accent': species.accent } as CSSProperties}
                      onClick={() => onResolveChoice(id)}
                    >
                      <span
                        className="species-thumb"
                        style={{
                          backgroundImage: `url(/pet/${id}-${DEFAULT_VARIANT_ID}-dragon.png)`,
                          backgroundSize: '500% 100%',
                        }}
                      />
                      <span className="species-name">{species.name}</span>
                      <span className="species-animal">{species.animal}</span>
                      <span className="species-tagline">{species.tagline}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <p className="progress">
            {unlockedSpecies.length} of {ALL_SPECIES.length} discovered
          </p>
          <ul className="companion-list">
            {ALL_SPECIES.map((species) => {
              const unlocked = unlockedSpecies.includes(species.id)
              const active = species.id === activeSpeciesId
              const variantId = speciesVariant[species.id] ?? DEFAULT_VARIANT_ID
              const outfitId = outfitBySpecies[species.id] ?? NONE_OUTFIT_ID
              return (
                <li key={species.id} className={`companion-item${unlocked ? ' unlocked' : ''}`}>
                  <div className="companion-row">
                    {unlocked ? (
                      <span
                        className="species-thumb small"
                        style={{
                          backgroundImage: `url(/pet/${species.id}-${variantId}-dragon.png)`,
                          backgroundSize: '500% 100%',
                        }}
                      />
                    ) : (
                      <span className="companion-lock">
                        <LockIcon />
                      </span>
                    )}
                    <span className="companion-copy">
                      <span className="achievement-title">
                        {unlocked ? `${species.name} · ${species.animal}` : '???'}
                      </span>
                      <span className="achievement-desc">
                        {unlocked ? species.tagline : 'Keep leveling up to meet this one.'}
                      </span>
                    </span>
                    {unlocked &&
                      (active ? (
                        <span className="companion-active">
                          <CheckIcon /> Active
                        </span>
                      ) : (
                        <button type="button" className="companion-select" onClick={() => onSwitch(species.id)}>
                          Select
                        </button>
                      ))}
                  </div>
                  {unlocked && (
                    <div className="variant-swatches small">
                      {VARIANTS.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          className={`variant-swatch${v.id === variantId ? ' selected' : ''}`}
                          onClick={() => onSetVariant(species.id, v.id)}
                          aria-label={v.name}
                          title={v.name}
                          style={{
                            backgroundImage: `url(/pet/${species.id}-${v.id}-dragon.png)`,
                            backgroundSize: '500% 100%',
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {unlocked && (
                    <div className="variant-swatches small">
                      <button
                        type="button"
                        className={`variant-swatch${outfitId === NONE_OUTFIT_ID ? ' selected' : ''}`}
                        onClick={() => onSetOutfit(species.id, NONE_OUTFIT_ID)}
                        aria-label="No outfit"
                        title="No outfit"
                        style={{
                          backgroundImage: `url(/pet/${species.id}-${variantId}-dragon.png)`,
                          backgroundSize: '500% 100%',
                        }}
                      />
                      {OUTFITS.map((o) => {
                        const outfitUnlocked = unlockedOutfits.includes(o.id)
                        return outfitUnlocked ? (
                          <button
                            key={o.id}
                            type="button"
                            className={`variant-swatch${o.id === outfitId ? ' selected' : ''}`}
                            onClick={() => onSetOutfit(species.id, o.id)}
                            aria-label={o.name}
                            title={o.name}
                            style={{
                              backgroundImage: `url(/pet/${species.id}-${variantId}-dragon-${o.id}.png)`,
                              backgroundSize: '500% 100%',
                            }}
                          />
                        ) : (
                          <span
                            key={o.id}
                            className="variant-swatch locked"
                            aria-label={`${o.name}, locked`}
                            title={`Unlocks at level ${o.unlockLevel}`}
                          >
                            <LockIcon />
                          </span>
                        )
                      })}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="treats-toys-section">
            <p className="section-heading">Treats</p>
            <div className="variant-swatches">
              <button
                type="button"
                className={`treat-toy-swatch${equippedTreatId === CLASSIC_TREAT_ID ? ' selected' : ''}`}
                onClick={() => onSetTreat(CLASSIC_TREAT_ID)}
                aria-label="Classic apple"
                title="Classic"
                style={{ backgroundImage: 'url(/pet/treat.png)' }}
              />
              {TREATS.map((t) => {
                const treatUnlocked = unlockedTreats.includes(t.id)
                return treatUnlocked ? (
                  <button
                    key={t.id}
                    type="button"
                    className={`treat-toy-swatch${t.id === equippedTreatId ? ' selected' : ''}`}
                    onClick={() => onSetTreat(t.id)}
                    aria-label={t.name}
                    title={t.name}
                    style={{ backgroundImage: `url(/pet/treat-${t.id}.png)` }}
                  />
                ) : (
                  <span
                    key={t.id}
                    className="treat-toy-swatch locked"
                    aria-label={`${t.name}, locked`}
                    title={`Unlocks at level ${t.unlockLevel}`}
                  >
                    <LockIcon />
                  </span>
                )
              })}
            </div>

            <p className="section-heading">Toys</p>
            <div className="variant-swatches">
              <button
                type="button"
                className={`treat-toy-swatch${equippedToyId === CLASSIC_TOY_ID ? ' selected' : ''}`}
                onClick={() => onSetToy(CLASSIC_TOY_ID)}
                aria-label="Classic ball"
                title="Classic"
                style={{ backgroundImage: 'url(/pet/toy.png)' }}
              />
              {TOYS.map((t) => {
                const toyUnlocked = unlockedToys.includes(t.id)
                return toyUnlocked ? (
                  <button
                    key={t.id}
                    type="button"
                    className={`treat-toy-swatch${t.id === equippedToyId ? ' selected' : ''}`}
                    onClick={() => onSetToy(t.id)}
                    aria-label={t.name}
                    title={t.name}
                    style={{ backgroundImage: `url(/pet/toy-${t.id}.png)` }}
                  />
                ) : (
                  <span
                    key={t.id}
                    className="treat-toy-swatch locked"
                    aria-label={`${t.name}, locked`}
                    title={`Unlocks at level ${t.unlockLevel}`}
                  >
                    <LockIcon />
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
