import { BaseActorGURPS } from "@actor"
import { ActorType } from "@module/data"
import { DocumentModificationOptions } from "types/foundry/common/abstract/document.mjs"
import { BaseUser } from "types/foundry/common/documents.mjs"

class CombatantGURPS extends Combatant {
	get actor(): BaseActorGURPS | null {
		return super.actor as BaseActorGURPS | null
	}

	override get isDefeated(): boolean {
		if (this.actor?.type === ActorType.Character) return (this.actor as any).isDefeated
		return super.isDefeated
	}

	protected async _preDelete(options: DocumentModificationOptions, user: BaseUser): Promise<void> {
		await this.actor?.resetManeuvers()
		return super._preDelete(options, user)
	}
}

export { CombatantGURPS }
