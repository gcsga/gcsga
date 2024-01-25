import { ActorGURPS } from "@actor/base.ts"
import { CombatGURPS } from "@module/combat/index.ts"
import { ActorType } from "@module/data/misc.ts"
import { TokenDocumentGURPS } from "@module/token/document.ts"
import { UserGURPS } from "@module/user/document.ts"

class CombatantGURPS<
	TParent extends CombatGURPS = CombatGURPS,
	TTokenDocument extends TokenDocumentGURPS = TokenDocumentGURPS,
> extends Combatant<TParent, TTokenDocument> {
	override get actor(): ActorGURPS | null {
		return super.actor as ActorGURPS | null
	}

	override get isDefeated(): boolean {
		if (this.actor?.type === ActorType.Character) return (this.actor as any).isDefeated
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
