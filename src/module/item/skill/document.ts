import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { SkillSource, SkillSystemData } from "./data.ts"

class SkillGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractContainerGURPS<TParent> {}

interface SkillGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractContainerGURPS<TParent> {
	readonly _source: SkillSource
	system: SkillSystemData
}

export { SkillGURPS }
