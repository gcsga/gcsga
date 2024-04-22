import { SceneGURPS, TokenDocumentGURPS } from "@scene/index.ts"
import { TokenGURPS } from "./token/object.ts"
import { TokenHUDGURPS } from "./token/hud.ts"

export type CanvasGURPS = Canvas<
	SceneGURPS,
	AmbientLight<AmbientLightDocument<SceneGURPS>>,
	MeasuredTemplate<MeasuredTemplateDocument<SceneGURPS>>,
	TokenGURPS<TokenDocumentGURPS<SceneGURPS>>,
	EffectsCanvasGroup
>

export { TokenGURPS, TokenHUDGURPS }
