import { useEffect, useState } from 'react'
import type { WalletCard } from '../../types/card'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useWallet } from '../../store/WalletContext'

export function EditCardModal({
  card,
  open,
  onClose,
}: {
  card: WalletCard | null
  open: boolean
  onClose: () => void
}) {
  const { updateCard } = useWallet()
  const [form, setForm] = useState({
    nickname: '',
    issuer: '',
    name: '',
    variant: '',
    network: '',
    annualFee: '',
    rewardCurrency: '',
    rewardType: '',
    rewardRate: '',
    eligibleCategories: '',
    exclusions: '',
    merchantRules: '',
    redemptionValues: '',
    capsNotes: '',
    milestonesNotes: '',
    benefitsNotes: '',
  })

  useEffect(() => {
    if (!card) return
    setForm({
      nickname: card.nickname,
      issuer: card.issuer,
      name: card.name,
      variant: card.variant,
      network: card.network,
      annualFee: card.annualFee != null ? String(card.annualFee) : '',
      rewardCurrency: card.rewardCurrency,
      rewardType: card.rewardType,
      rewardRate: card.rewardRate != null ? String(card.rewardRate) : '',
      eligibleCategories: card.eligibleCategories,
      exclusions: card.exclusions,
      merchantRules: card.merchantRules,
      redemptionValues: card.redemptionValues,
      capsNotes: card.capsNotes,
      milestonesNotes: card.milestonesNotes,
      benefitsNotes: card.benefitsNotes,
    })
  }, [card])

  if (!card) return null

  function save() {
    updateCard(card!.walletId, {
      nickname: form.nickname,
      issuer: form.issuer,
      name: form.name,
      variant: form.variant,
      network: form.network,
      annualFee: form.annualFee ? Number(form.annualFee) : null,
      rewardCurrency: form.rewardCurrency,
      rewardType: form.rewardType,
      rewardRate: form.rewardRate ? Number(form.rewardRate) : null,
      eligibleCategories: form.eligibleCategories,
      exclusions: form.exclusions,
      merchantRules: form.merchantRules,
      redemptionValues: form.redemptionValues,
      capsNotes: form.capsNotes,
      milestonesNotes: form.milestonesNotes,
      benefitsNotes: form.benefitsNotes,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit card"
      description="Update nickname and user-provided reward fields used by the Phase 3 engine. Caps format: monthly:5000:3850"
      wide
    >
      <p className="mb-3 text-[11px] leading-relaxed text-text-muted">
        Rate: cashback = percent (e.g. 5). Points/miles = units per ₹100 (e.g. 2).
        Exclusions: comma categories, or merchant:Name. Redemption: travel:1,hotels:0.9,cashback:0.25
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ['nickname', 'Nickname'],
            ['issuer', 'Issuer'],
            ['name', 'Card name'],
            ['variant', 'Variant'],
            ['network', 'Network'],
            ['annualFee', 'Annual fee'],
            ['rewardCurrency', 'Reward currency'],
            ['rewardType', 'Reward type'],
            ['rewardRate', 'Reward rate'],
            ['eligibleCategories', 'Eligible categories'],
            ['exclusions', 'Exclusions'],
            ['merchantRules', 'Merchant rules'],
            ['capsNotes', 'Caps'],
            ['redemptionValues', 'Redemption values'],
            ['milestonesNotes', 'Milestones'],
            ['benefitsNotes', 'Benefits'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-xs font-medium text-text-secondary">
            {label}
            <Input
              className="mt-1.5"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={save}>
          Save changes
        </Button>
      </div>
    </Modal>
  )
}
