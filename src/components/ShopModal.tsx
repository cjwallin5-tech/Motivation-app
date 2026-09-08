import { COINS_PER_TASK, DECOR_ITEMS } from '../decor'
import { CheckIcon, CloseIcon, CoinIcon } from './icons'

interface Props {
  open: boolean
  onClose: () => void
  coins: number
  unlockedDecor: string[]
  placedDecorIds: string[]
  onPurchase: (id: string) => void
  onAddToRoom: (id: string) => void
  onRemoveFromRoom: (id: string) => void
}

export function ShopModal({
  open,
  onClose,
  coins,
  unlockedDecor,
  placedDecorIds,
  onPurchase,
  onAddToRoom,
  onRemoveFromRoom,
}: Props) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h1>Shop</h1>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <p className="progress shop-balance">
            <CoinIcon /> {coins} coins — earned {COINS_PER_TASK} per completed task
          </p>
          <p className="reminders-sub shop-hint">
            Owned items can be placed in the room, then dragged anywhere you like.
          </p>

          <ul className="companion-list">
            {DECOR_ITEMS.map((item) => {
              const owned = unlockedDecor.includes(item.id)
              const placed = placedDecorIds.includes(item.id)
              const affordable = coins >= item.cost
              return (
                <li key={item.id} className={`companion-item${owned ? ' unlocked' : ''}`}>
                  <div className="companion-row">
                    <span
                      className="decor-thumb"
                      style={{ backgroundImage: `url(/pet/decor-${item.id}.png)` }}
                    />
                    <span className="companion-copy">
                      <span className="achievement-title">{item.name}</span>
                      <span className="achievement-desc">
                        {owned ? item.description : `${item.cost} coins`}
                      </span>
                    </span>
                    {owned ? (
                      placed ? (
                        <button
                          type="button"
                          className="companion-select"
                          onClick={() => onRemoveFromRoom(item.id)}
                        >
                          <CheckIcon /> In Room
                        </button>
                      ) : (
                        <button type="button" className="companion-select" onClick={() => onAddToRoom(item.id)}>
                          Add to Room
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        className="companion-select"
                        disabled={!affordable}
                        onClick={() => onPurchase(item.id)}
                      >
                        Buy
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
