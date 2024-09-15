import { ItemType } from "@module/data/constants.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { SuccessRoll, SuccessRollOptions } from "./success-roll.ts"

class BlockRoll extends SuccessRoll {
	protected override _getTargetFromItem(options: SuccessRollOptions): number {
		if (!options.item) return 0
		const item = fromUuid(options.item.uuid)
		if (!(item instanceof ItemGURPS2)) return 0
		if (!item.isOfType(ItemType.WeaponMelee)) return 0

		return item.system.parry.resolve(item.system, null).modifier
	}
}

export { BlockRoll }
