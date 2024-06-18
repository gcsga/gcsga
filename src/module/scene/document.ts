import type { AmbientLightDocumentGURPS } from "./ambient-light-document.ts"
import { TokenDocumentGURPS } from "./token-document/document.ts"

class SceneGURPS extends Scene {
	/** Has this document completed `DataModel` initialization? */
	declare initialized: boolean

	protected override _initialize(options?: Record<string, unknown>): void {
		this.initialized = false
		super._initialize(options)
	}

	override prepareData(): void {
		if (this.initialized) return
		this.initialized = true
		super.prepareData()
	}

	/** Toggle Unrestricted Global Vision according to scene darkness level */
	override prepareBaseData(): void {
		super.prepareBaseData()
	}
}

interface SceneGURPS extends Scene {
	readonly lights: foundry.abstract.EmbeddedCollection<AmbientLightDocumentGURPS<this>>
	readonly tokens: foundry.abstract.EmbeddedCollection<TokenDocumentGURPS<this>>
}
export { SceneGURPS }
