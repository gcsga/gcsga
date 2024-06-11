import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { SkillContainerSource, SkillContainerSystemData } from "./data.ts"

class SkillContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {}

interface SkillContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: SkillContainerSource
	system: SkillContainerSystemData
}

export { SkillContainerGURPS }
