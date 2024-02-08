import { ItemType } from "@data"
import { FeatureObj } from "@feature"
import { BaseContainerSystemSource } from "@item/container/data.ts"
import { PrereqListObj } from "@prereq/data.ts"
import { SkillDefaultObj } from "@sytem/default/index.ts"
import { Study } from "@util"

export interface ItemGCSSystemSource extends BaseContainerSystemSource {
	type: ItemType
	prereqs?: PrereqListObj // used for compatibility
	features?: FeatureObj[] // used for compatibility
	defaults?: SkillDefaultObj[] // used for compatibility
	study?: Study[] // used for compatibility
}
