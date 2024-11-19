import { ItemDataModel } from "../abstract.ts"
import { AttackMelee } from "@module/data/action/attack-melee.ts"
import { AttackRanged } from "@module/data/action/attack-ranged.ts"
import { ActionInstances, ActionSchema } from "@module/data/action/types.ts"
import { ActionType } from "@module/data/constants.ts"
import { ActionCollection, ActionsField } from "@module/data/fields/actions-field.ts"
import { ErrorGURPS } from "@util"

class ActionTemplate extends ItemDataModel<ActionTemplateSchema> {
	static override defineSchema(): ActionTemplateSchema {
		return {
			actions: new ActionsField(),
		}
	}

	async createAction(
		type: ActionType,
		data: DeepPartial<SourceFromSchema<ActionSchema>>,
		{ renderSheet, ...options }: { renderSheet: boolean; [key: string]: unknown } = { renderSheet: true },
	): Promise<foundry.applications.api.ApplicationV2 | null> {
		const cls = ActionInstances[type]
		if (!cls) throw ErrorGURPS(`${type} is not a valid Action type`)

		const createData = foundry.utils.deepClone(data)
		const action = new cls({ type, ...data }, { parent: this })
		if (action._preCreate(createData) === false) return null

		await this.parent.update({
			[`system.actions.${action.id}`]: action.toObject(),
		})
		const created = this.actions.get(action.id)
		return renderSheet ? (created?.sheet?.render({ force: true }) ?? null) : null
	}

	get attacks(): (AttackMelee | AttackRanged)[] {
		return [...this.meleeAttacks, ...this.rangedAttacks]
	}

	get meleeAttacks(): AttackMelee[] {
		return this.actions.filter(e => e.isOfType(ActionType.AttackMelee)) as AttackMelee[]
	}

	get rangedAttacks(): AttackRanged[] {
		return this.actions.filter(e => e.isOfType(ActionType.AttackRanged)) as AttackRanged[]
	}
}

interface ActionTemplate {
	actions: ActionCollection
}

type ActionTemplateSchema = {
	actions: ActionsField
}

export { ActionTemplate, type ActionTemplateSchema }
