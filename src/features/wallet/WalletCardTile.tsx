import { Pencil, Trash2 } from 'lucide-react'
import type { WalletCard } from '../../types/card'
import { CreditCardVisual } from '../dashboard/CreditCardVisual'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { GlassCard } from '../../components/ui/GlassCard'
import { walletToVisual } from '../../store/WalletContext'

export function WalletCardTile({
  card,
  index,
  onEdit,
  onRemove,
}: {
  card: WalletCard
  index: number
  onEdit: () => void
  onRemove: () => void
}) {
  const visual = walletToVisual(card)

  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex justify-center">
        <CreditCardVisual card={visual} index={index} />
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-sm font-semibold text-text-primary">
            {card.issuer} {card.name}
            {card.variant ? ` · ${card.variant}` : ''}
          </h3>
          {card.isCustom ? (
            <Badge tone="accent">✎ Custom</Badge>
          ) : (
            <Badge tone="muted">Catalog</Badge>
          )}
          <Badge
            tone={
              card.verification.status === 'user_provided'
                ? 'accent'
                : card.verification.status === 'verified'
                  ? 'positive'
                  : 'warning'
            }
          >
            {card.verification.status === 'user_provided'
              ? '✎ USER PROVIDED'
              : card.verification.status === 'verified'
                ? '✓ VERIFIED'
                : '≈ REQUIRES VERIFICATION'}
          </Badge>
        </div>
        <p className="text-xs text-text-secondary">
          Nickname: <span className="text-text-primary">{card.nickname}</span>
          {' · '}
          {card.network}
          {' · '}
          {card.rewardCurrency}
        </p>
        {card.annualFee != null && (
          <p className="text-xs text-text-muted">
            Annual fee (user/catalog): {card.currency} {card.annualFee}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" variant="secondary" size="sm" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}
