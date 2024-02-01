import { CharacterGURPS } from "@actor"
import { ActorGURPS } from "@actor/base.ts"
import { CombatGURPS } from "@module/combat/index.ts"
import { UserGURPS } from "@module/user/document.ts"
import { TokenDocumentGURPS } from "@scene/token-document/document.ts"

class CombatantGURPS<
	TParent extends CombatGURPS = CombatGURPS,
	TTokenDocument extends TokenDocumentGURPS = TokenDocumentGURPS,
> extends Combatant<TParent, TTokenDocument> {
	override get actor(): ActorGURPS | null {
		return super.actor as ActorGURPS | null
	}

	override get isDefeated(): boolean {
		if (this.actor instanceof CharacterGURPS) return this.actor.isDefeated
		return super.isDefeated
	}

	protected override async _preDelete(
		options: DocumentModificationContext<CombatGURPS>,
		user: UserGURPS,
	): Promise<void> {
		await this.actor?.resetManeuvers()
		super._preDelete(options, user)
	}
}

export { CombatantGURPS }
