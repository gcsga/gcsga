import { ActorGURPS } from "@actor"
import type { SceneGURPS } from "../document.ts"
import { TokenFlagsGURPS } from "./data.ts"
import type { CombatGURPS, CombatantGURPS } from "@module/combat/index.ts"
import type { TokenGURPS } from "@module/canvas/index.ts"

class TokenDocumentGURPS<TParent extends SceneGURPS | null = SceneGURPS | null> extends TokenDocument<TParent> {
	/** Has this document completed `DataModel` initialization? */
	declare initialized: boolean

	/** This should be in Foundry core, but ... */
	get scene(): this["parent"] {
		return this.parent
	}

	protected override _initialize(options?: Record<string, unknown>): void {
		this.initialized = false
		super._initialize(options)
	}

	/** If embedded, don't prepare data if the parent's data model hasn't initialized all its properties */
	override prepareData(): void {
		if (this.initialized) return
		if (!this.parent || this.parent.initialized) {
			this.initialized = true
			super.prepareData()
		}
	}
}

interface TokenDocumentGURPS<TParent extends SceneGURPS | null = SceneGURPS | null> extends TokenDocument<TParent> {
	flags: TokenFlagsGURPS

	get actor(): ActorGURPS<this | null> | null
	get combatant(): CombatantGURPS<CombatGURPS, this> | null
	get object(): TokenGURPS<this> | null
	// get sheet(): TokenConfigGURPS<this>
}

export { TokenDocumentGURPS }
