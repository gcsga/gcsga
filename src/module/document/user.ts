import { HOOKS, RollModifierTags, SYSTEM_NAME, UserFlags, UserSystemFlags } from "@module/data/index.ts"
import { ActorGURPS2 } from "./actor.ts"
import { RollModifier } from "@module/data/roll-modifier.ts"
// import { TokenDocumentGURPS } from "./token.ts"

class UserGURPS<TActor extends ActorGURPS2<null> = ActorGURPS2<null>> extends User<TActor> {
	/**
	 * Get the data model that represents system flags.
	 */
	get _systemFlagsDataModel(): typeof UserSystemFlags | null {
		return UserSystemFlags
	}
	/* -------------------------------------------- */

	override prepareData() {
		super.prepareData()
		if (SYSTEM_NAME in this.flags && this._systemFlagsDataModel) {
			// @ts-expect-error abstract class overwritten
			this.flags[SYSTEM_NAME] = new this._systemFlagsDataModel(this._source.flags[SYSTEM_NAME], {
				parent: this,
			})
		}
	}

	/* -------------------------------------------- */

	override async setFlag(scope: string, key: string, value: unknown): Promise<this> {
		if (scope === SYSTEM_NAME && this._systemFlagsDataModel) {
			let diff
			const changes = foundry.utils.expandObject({ [key]: value })
			if (this.flags[SYSTEM_NAME]) diff = this.flags[SYSTEM_NAME].updateSource(changes, { dryRun: true })
			// @ts-expect-error abstract class overwritten
			else diff = new this._systemFlagsDataModel(changes, { parent: this }).toObject()
			return this.update({ flags: { [SYSTEM_NAME]: diff } }) as unknown as this
		}
		return super.setFlag(scope, key, value)
	}

	get modifierTotal(): number {
		let total = 0
		const modifierStack = this.flags[SYSTEM_NAME][UserFlags.ModifierStack]
		for (const m of modifierStack) {
			total += m.modifier
		}
		return total
	}

	get lastTotal(): number {
		let total = 0
		const modifierStack = this.flags[SYSTEM_NAME][UserFlags.LastStack]
		for (const m of modifierStack) {
			total += m.modifier
		}
		return total
	}

	// get activeTokens(): TokenDocumentGURPS[] {
	// 	if (!canvas.ready || canvas.tokens.controlled.length === 0) {
	// 		return this.character?.getActiveTokens(true, true) ?? []
	// 	}
	// 	return canvas.tokens.controlled.filter(t => t.isOwner).map(t => t.document)
	// }

	addModifier(mod: RollModifier): void {
		const modifierStack = this.flags[SYSTEM_NAME][UserFlags.ModifierStack]
		if (mod.tags?.includes(RollModifierTags.Range)) {
			const oldMod = modifierStack.find(e => e.tags?.includes(RollModifierTags.Range))
			if (oldMod) {
				oldMod.modifier = mod.modifier
				oldMod.id = mod.id
			} else modifierStack.push(mod)
		} else {
			const oldMod = modifierStack.find(e => e.id === mod.id)
			if (oldMod) oldMod.modifier += mod.modifier
			else modifierStack.push(mod)
		}
		this.setFlag(SYSTEM_NAME, UserFlags.ModifierStack, modifierStack)
		Hooks.call(HOOKS.AddModifier)
	}
}

interface UserGURPS<TActor extends ActorGURPS2<null>> {
	actor: TActor
	flags: DocumentFlags & {
		[SYSTEM_NAME]: UserSystemFlags
	}
}

export { UserGURPS }
