import { ItemGCS } from "@item/gcs"
import { SkillGURPS } from "@item/skill"
import { TechniqueGURPS } from "@item/technique"
import { SkillContainerData } from "./data"

export class SkillContainerGURPS extends ItemGCS {
	readonly system!: SkillContainerData

	// Embedded Items
	get children(): Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS> {
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
