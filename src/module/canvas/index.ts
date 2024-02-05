import { TokenDocumentGURPS } from "@scene/token-document/index.ts"
import { TokenHUDGURPS } from "./token/hud.ts"
import { TokenGURPS } from "./token/object.ts"
import { SceneGURPS } from "@scene"

export type CanvasGURPS = Canvas<
	SceneGURPS,
	AmbientLight<AmbientLightDocument<SceneGURPS>>,
	MeasuredTemplate<MeasuredTemplateDocument<SceneGURPS>>,
	TokenGURPS<TokenDocumentGURPS<SceneGURPS>>,
	EffectsCanvasGroup
>

export { TokenGURPS, TokenHUDGURPS }
