import { ActorGURPS } from "@actor"
import { SceneGURPS, TokenDocumentGURPS } from "@scene"
import { UserFlagsGURPS, UserSourceGURPS } from "./data.ts"
import { TokenGURPS } from "@module/canvas/index.ts"

class UserGURPS extends User<ActorGURPS<null>> {}

interface UserGURPS extends User<ActorGURPS<null>> {
	targets: Set<TokenGURPS<TokenDocumentGURPS<SceneGURPS>>>
	flags: UserFlagsGURPS
	readonly _source: UserSourceGURPS
}

export { UserGURPS }
