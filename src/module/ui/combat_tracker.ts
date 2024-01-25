import { CharacterGURPS } from "@actor/document.ts"
import { ConditionID } from "@item/condition/data.ts"
import { ConditionGURPS } from "@item/condition/document.ts"
import { CombatGURPS } from "@module/combat/document.ts"
import { CombatantGURPS } from "@module/combatant/document.ts"
import { ActorType } from "@module/data/misc.ts"

export class CombatTrackerGURPS<TCombat extends CombatGURPS | null> extends CombatTracker<TCombat> {
	override async _onToggleDefeatedStatus(combatant: CombatantGURPS) {
		if (!(combatant.actor?.type === ActorType.Character)) return super._onToggleDefeatedStatus(combatant)

		const isDefeated = !combatant.isDefeated
		await combatant.update({ defeated: isDefeated })
		const actor = combatant.actor as CharacterGURPS
		if (!actor) return

		if (isDefeated) await actor.addConditions([ConditionID.Dead])
		else await actor.removeConditions([ConditionID.Dead])
	}

	override getData(options: CombatTrackerOptions): CombatTrackerData {
		const data = super.getData(options)
		const turns = data.turns
		turns?.forEach((t: any) => {
			t.effects = t.effects.filter((e: string) => e !== ConditionGURPS.getData(ConditionID.Dead).img)
		})
		data.turns = turns
		return data
	}
}
