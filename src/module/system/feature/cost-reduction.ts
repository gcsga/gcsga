import { feature } from "@util/enum/feature.ts"
import { BaseFeature } from "./bonus-owner.ts"
import { gid } from "@data"
import { CostReductionSchema } from "./data.ts"

export class CostReduction extends BaseFeature<feature.Type.CostReduction> {
	attribute: string

	percentage: number | null

	constructor(attrID: string = gid.Strength) {
		super(feature.Type.CostReduction)
		this.attribute = attrID
		this.percentage = 40
	}

	// @ts-expect-error TODO: fix type later
	override toObject(): SourceFromSchema<CostReductionSchema> {
		return {
			type: feature.Type.CostReduction,
			attribute: this.attribute,
			percentage: this.percentage ?? null,
		}
	}

	static fromObject(data: SourceFromSchema<CostReductionSchema>): CostReduction {
		const bonus = new CostReduction(data.attribute)
		bonus.attribute = data.attribute ?? gid.Strength
		bonus.percentage = data.percentage
		return bonus
	}
}
