import { TokenDocumentGURPS } from "@scene/token-document/document.ts"
import { ActorFlagsGURPS, ActorSystemData, PrototypeTokenGURPS } from "./data.ts"
import { ItemGURPS } from "@item"
import type { ActorSheetGURPS } from "./sheet.ts"
import type { ActorSourceGURPS } from "../data.ts"
import type { ActiveEffectGURPS } from "@module/active-effect/index.ts"

/**
 * Extend the base Actor class to implement additional logic specialized for GURPS.
 * @category Actor
 */
class ActorGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null> extends Actor<TParent> {
	/** The recorded schema version of this actor, updated after each data migration */
	get schemaVersion(): number | null {
		return Number(this.system._migration?.version) || null
	}
}

interface ActorGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null> extends Actor<TParent> {
	flags: ActorFlagsGURPS
	readonly _source: ActorSourceGURPS
	readonly effects: foundry.abstract.EmbeddedCollection<ActiveEffectGURPS<this>>
	readonly items: foundry.abstract.EmbeddedCollection<ItemGURPS<this>>
	system: ActorSystemData

	prototypeToken: PrototypeTokenGURPS<this>

	get sheet(): ActorSheetGURPS<ActorGURPS>
}

/** A `Proxy` to to get Foundry to construct `ActorGURPS` subclasses */
const ActorProxyGURPS = new Proxy(ActorGURPS, {
	construct(
		_target,
		args: [source: PreCreate<ActorSourceGURPS>, context?: DocumentConstructionContext<ActorGURPS["parent"]>],
	) {
		return new CONFIG.GURPS.Actor.documentClasses[args[0].type](...args)
	},
})

export { ActorGURPS, ActorProxyGURPS }
