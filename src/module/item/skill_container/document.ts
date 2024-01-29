import { ActorGURPS } from "@actor/document.ts"
import { SkillContainerSystemData } from "./data.ts"
import { ItemGCS, SkillGURPS, TechniqueGURPS } from "@item/index.ts"
import { ItemType } from "@item/types.ts"

export interface SkillContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	system: SkillContainerSystemData
	type: ItemType.SkillContainer
}
export class SkillContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	// Embedded Items
	override get children(): Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS> {
		return super.children as Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS>
	}

	adjustedPoints(): number {
		return this.points
	}

	get points(): number {
		let points = 0
		for (const child of this.children) points += child.adjustedPoints()
		return points
	}
}
