import { ActorGURPS } from "@actor"
import { TokenGURPS } from "@module/canvas/index.ts"
import { HOOKS, RollModifierTags, SYSTEM_NAME } from "@module/data/constants.ts"
import { RollModifier } from "@module/data/types.ts"
import { SceneGURPS, TokenDocumentGURPS } from "@scene"
import * as R from "remeda"
import { UserFlags, UserFlagsGURPS, UserSourceGURPS } from "./data.ts"

class UserGURPS extends User<ActorGURPS<null>> {
	override prepareData(): void {
		super.prepareData()
		if (canvas?.ready && canvas.tokens?.controlled && canvas.tokens?.controlled.length > 0) {
			game.gurps.effectPanel.refresh()
		}
	}

	override prepareBaseData(): void {
		super.prepareBaseData()
		this.flags = fu.mergeObject(
			{
				[SYSTEM_NAME]: {
					[UserFlags.Init]: true,
					[UserFlags.LastStack]: [],
					[UserFlags.ModifierStack]: [],
					[UserFlags.ModifierSticky]: false,
					[UserFlags.LastActor]: null,
					[UserFlags.LastToken]: null,
				},
			},
			this.flags,
		)
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

	get activeTokens(): TokenDocumentGURPS[] {
		if (!canvas.ready || canvas.tokens.controlled.length === 0) {
			return R.compact([game.user.character?.getActiveTokens(true, true).shift()]) as TokenDocumentGURPS[]
		}
		return canvas.tokens.controlled.filter(t => t.isOwner).map(t => t.document)
	}

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

interface UserGURPS extends User<ActorGURPS<null>> {
	targets: Set<TokenGURPS<TokenDocumentGURPS<SceneGURPS>>>
	flags: UserFlagsGURPS
	readonly _source: UserSourceGURPS
}

export { UserGURPS }
