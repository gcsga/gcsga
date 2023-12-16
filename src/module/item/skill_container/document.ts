import { ItemGCS } from "@item/gcs"
import { SkillGURPS } from "@item/skill"
import { TechniqueGURPS } from "@item/technique"
import { SkillContainerSource } from "./data"

export class SkillContainerGURPS extends ItemGCS<SkillContainerSource> {
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
