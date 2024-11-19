import { ActionType } from "@module/data/constants.ts"
import { SuccessRoll, SuccessRollOptions } from "./success-roll.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ItemTemplateType } from "@module/data/item/types.ts"

class BlockRoll extends SuccessRoll {
	protected override _getTargetFromItem(options: SuccessRollOptions): number {
		if (!options.item || !options.action) return 0
		if (!options.action) return 0
		const item = fromUuid(options.item.uuid)
		if (!(item instanceof ItemGURPS2)) return 0
		if (!item.hasTemplate(ItemTemplateType.Action)) return 0

		const action = item.system.actions.get(options.action.id) ?? null
		if (action === null) return 0
		if (!action.isOfType(ActionType.AttackMelee)) return 0

		return action.block.resolve(action, null).modifier
	}
}

export { BlockRoll }
