import { TokenDocumentGURPS } from "./token-document/document.ts"

class SceneGURPS extends Scene {}

interface SceneGURPS extends Scene {
	readonly tokens: foundry.abstract.EmbeddedCollection<TokenDocumentGURPS<this>>
}

export { SceneGURPS }
