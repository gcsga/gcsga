import { ItemDataModel } from "../abstract.ts"
import { AttackMelee } from "@module/data/action/attack-melee.ts"
import { AttackRanged } from "@module/data/action/attack-ranged.ts"
import { ActionInstances, ActionSchema } from "@module/data/action/types.ts"
import { ActionType } from "@module/data/constants.ts"
import { ActionCollection, ActionsField } from "@module/data/fields/actions-field.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ErrorGURPS } from "@util"

class ActionTemplate extends ItemDataModel<ActionTemplateSchema> {
	static override defineSchema(): ActionTemplateSchema {
		return {
			actions: new ActionsField(),
		}
	}

	/* -------------------------------------------- */

	async createAction(
		type: ActionType,
		data: DeepPartial<SourceFromSchema<ActionSchema>>,
		{ renderSheet }: { renderSheet: true },
	): Promise<foundry.applications.api.ApplicationV2>
	async createAction(
		type: ActionType,
		data: DeepPartial<SourceFromSchema<ActionSchema>>,
		{ renderSheet }: { renderSheet: false },
	): Promise<null>
	async createAction(
		type: ActionType,
		data: DeepPartial<SourceFromSchema<ActionSchema>>,
		{ renderSheet }: { renderSheet: boolean; [key: string]: unknown } = { renderSheet: true },
	): Promise<foundry.applications.api.ApplicationV2 | null> {
		const cls = ActionInstances[type]
		if (!cls) throw ErrorGURPS(`${type} is not a valid Action type`)

		const createData = foundry.utils.deepClone(data)
		const action = new cls({ type, ...data }, { parent: this })
		if (action.preCreate(createData) === false) return null

		await this.parent.update({
			[`system.actions.${action.id}`]: action.toObject(),
		})
		const created = this.actions.get(action.id)
		return renderSheet ? (created?.sheet?.render({ force: true }) ?? null) : null
	}

	/* -------------------------------------------- */

	updateAction(id: string, updates: object): Promise<ItemGURPS2 | undefined> {
		if (!this.actions.has(id)) throw ErrorGURPS(`Action of ID ${id} could not be found to update`)
		console.log(updates)
		return this.parent.update({ [`system.actions.${id}`]: updates })
	}

	/* -------------------------------------------- */

	async deleteAction(id: string): Promise<ItemGURPS2 | undefined> {
		const action = this.actions.get(id)
		if (!action) return this.parent
		await Promise.allSettled([...action.constructor._sheets.values()].map(e => e.close()))
		return this.parent.update({ [`system.actions.-=${id}`]: null })
	}

	/* -------------------------------------------- */

	get attacks(): (AttackMelee | AttackRanged)[] {
		return [...this.meleeAttacks, ...this.rangedAttacks]
	}

	/* -------------------------------------------- */

	get meleeAttacks(): AttackMelee[] {
		return this.actions.filter(e => e.isOfType(ActionType.AttackMelee)) as AttackMelee[]
	}

	/* -------------------------------------------- */

	get rangedAttacks(): AttackRanged[] {
		return this.actions.filter(e => e.isOfType(ActionType.AttackRanged)) as AttackRanged[]
	}

	/* -------------------------------------------- */
}

interface ActionTemplate {
	actions: ActionCollection
}

type ActionTemplateSchema = {
	actions: ActionsField
}

export { ActionTemplate, type ActionTemplateSchema }
