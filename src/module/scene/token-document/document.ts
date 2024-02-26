import { ActorGURPS } from "@actor"
import { SceneGURPS } from "../document.ts"
import { TokenFlagsGURPS } from "./data.ts"
import { CombatGURPS, CombatantGURPS } from "@module/combat/index.ts"
import { TokenGURPS } from "@module/canvas/index.ts"

class TokenDocumentGURPS<TParent extends SceneGURPS | null = SceneGURPS | null> extends TokenDocument<TParent> {
	/** This should be in Foundry core, but ... */
	get scene(): this["parent"] {
		return this.parent
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
