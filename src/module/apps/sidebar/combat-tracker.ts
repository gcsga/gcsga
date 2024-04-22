import { ActorType, ConditionID } from "@data"
import { CombatantGURPS } from "@module/combat/combatant.ts"
import { CombatGURPS } from "@module/combat/document.ts"

export class CombatTrackerGURPS<TCombat extends CombatGURPS | null> extends CombatTracker<TCombat> {
	override async _onToggleDefeatedStatus(combatant: CombatantGURPS<TCombat>): Promise<void> {
		if (!(combatant.actor?.type === ActorType.Character)) return super._onToggleDefeatedStatus(combatant)

		const isDefeated = !combatant.isDefeated
		await combatant.update({ defeated: isDefeated })
		const actor = combatant.actor
		if (!actor) return

		if (isDefeated) await actor.increaseCondition(ConditionID.Dead)
		else await actor.decreaseCondition(ConditionID.Dead)
	}

	override getData(options: CombatTrackerOptions): CombatTrackerData {
		const data = super.getData(options)
		const turns = data.turns
		data.turns = turns
		return data
	}
}
