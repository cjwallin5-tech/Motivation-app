import type { PetStage } from './usePet'
import { DEFAULT_VARIANT_ID } from './petSpecies'
import { NONE_OUTFIT_ID } from './outfits'

/** Builds the sprite-sheet path for a companion at a given stage/color/outfit. */
export function spriteSrc(stage: PetStage, speciesId: string, variantId: string, outfitId: string): string {
  if (stage === 'egg' || !speciesId) return '/pet/egg.png'
  const suffix = outfitId && outfitId !== NONE_OUTFIT_ID ? `-${outfitId}` : ''
  return `/pet/${speciesId}-${variantId || DEFAULT_VARIANT_ID}-${stage}${suffix}.png`
}
