import { WeaponBonus } from "@system"
import { Int, TooltipGURPS } from "@util"

function addWeaponBonusToMap(
	bonus: WeaponBonus,
	dieCount: number,
	tooltip: TooltipGURPS | null = null,
	m: Map<WeaponBonus, boolean> = new Map(),
): void {
	const savedLevel = bonus.leveledAmount.level
	const savedDieCount = bonus.leveledAmount.dieCount
	bonus.leveledAmount.dieCount = Int.from(dieCount)
	bonus.leveledAmount.level = bonus.derivedLevel
	bonus.addToTooltip(tooltip)
	bonus.leveledAmount.level = savedLevel
	bonus.leveledAmount.dieCount = savedDieCount
	m.set(bonus, true)
}

export { addWeaponBonusToMap }
