import { SceneGURPS } from "./document.ts"

class SceneConfigGURPS<TDocument extends SceneGURPS> extends SceneConfig<TDocument> {
	get scene(): TDocument {
		return this.document
	}
}

export { SceneConfigGURPS }
