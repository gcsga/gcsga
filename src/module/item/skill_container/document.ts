import { ActorGURPS } from "@actor"
import { SkillContainerSource, SkillContainerSystemSource } from "./data.ts"
import { ItemGCS, SkillGURPS, TechniqueGURPS } from "@item/index.ts"
import { ItemType } from "@data"

export interface SkillContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	readonly _source: SkillContainerSource
	system: SkillContainerSystemSource

	type: ItemType.SkillContainer
	get children(): Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS>
}
export class SkillContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	// Embedded Items

	adjustedPoints(): number {
		return this.points
	}

	get points(): number {
		let points = 0
		for (const child of this.children) points += child.adjustedPoints()
		return points
	}
}
