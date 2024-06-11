import { CharacterGURPS } from "@actor"
import { ActorType, ConditionID } from "@data"
import { ConditionGURPS } from "@item/condition/document.ts"
import { CombatantGURPS } from "@module/combat/combatant.ts"
import { CombatGURPS } from "@module/combat/document.ts"

export class CombatTrackerGURPS<TCombat extends CombatGURPS | null> extends CombatTracker<TCombat> {
	override async _onToggleDefeatedStatus(combatant: CombatantGURPS<TCombat>): Promise<void> {
		if (!(combatant.actor?.type === ActorType.Character)) return super._onToggleDefeatedStatus(combatant)

		const isDefeated = !combatant.isDefeated
		await combatant.update({ defeated: isDefeated })
		const actor = combatant.actor as CharacterGURPS
		if (!actor) return

		// @ts-expect-error awaiting implementation
		if (isDefeated) await actor.addConditions([ConditionID.Dead])
		// @ts-expect-error awaiting implementation
		else await actor.removeConditions([ConditionID.Dead])
	}

	override getData(options: CombatTrackerOptions): CombatTrackerData {
		const data = super.getData(options)
		const turns = data.turns
		turns?.forEach(t => {
			// @ts-expect-error awaiting implementation
			t.effects = t.effects.filter((e: string) => e !== ConditionGURPS.getData(ConditionID.Dead).img)
		})
		data.turns = turns
		return data
	}
}
