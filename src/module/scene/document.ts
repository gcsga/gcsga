import { SceneFlagsGURPS } from "./data.ts"
import { SceneConfigGURPS } from "./sheet.ts"
import { TokenDocumentGURPS } from "./token-document/index.ts"

class SceneGURPS extends Scene {}

interface SceneGURPS extends Scene {
	flags: SceneFlagsGURPS

	_sheet: SceneConfigGURPS<this> | null

	readonly lights: foundry.abstract.EmbeddedCollection<AmbientLightDocument<this>>
	readonly templates: foundry.abstract.EmbeddedCollection<MeasuredTemplateDocument<this>>
	readonly tokens: foundry.abstract.EmbeddedCollection<TokenDocumentGURPS<this>>
	readonly tiles: foundry.abstract.EmbeddedCollection<TileDocument<this>>

	get sheet(): SceneConfigGURPS<this>
}

export { SceneGURPS }
