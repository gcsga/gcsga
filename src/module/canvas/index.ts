import { SceneGURPS, TokenDocumentGURPS } from "@scene/index.ts"
import { TokenHUDGURPS } from "./token/hud.ts"
import { TokenGURPS } from "./token/object.ts"

export type CanvasGURPS = Canvas<
	SceneGURPS,
	AmbientLight<AmbientLightDocument<SceneGURPS>>,
	MeasuredTemplate<MeasuredTemplateDocument<SceneGURPS>>,
	TokenGURPS<TokenDocumentGURPS<SceneGURPS>>,
	EffectsCanvasGroup
>

export { TokenGURPS, TokenHUDGURPS }
