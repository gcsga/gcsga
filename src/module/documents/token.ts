import { type ActorGURPS2 } from "./actor.ts"

class TokenDocumentGURPS<TParent extends Scene | null = Scene | null> extends TokenDocument<TParent> {}

interface TokenDocumentGURPS<TParent extends Scene | null> extends TokenDocument<TParent> {
	get actor(): ActorGURPS2<this> | null
}

export { TokenDocumentGURPS }
