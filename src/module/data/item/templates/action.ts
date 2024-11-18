// import fields = foundry.data.fields
import { ItemDataModel } from "../abstract.ts"
import { AttackMelee } from "@module/data/action/attack-melee.ts"
import { AttackRanged } from "@module/data/action/attack-ranged.ts"
import { ActionType } from "@module/data/constants.ts"
import { ActionCollection, ActionsField } from "@module/data/fields/actions-field.ts"

class ActionTemplate extends ItemDataModel<ActionTemplateSchema> {
	static override defineSchema(): ActionTemplateSchema {
		return {
			actions: new ActionsField(),
		}
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
