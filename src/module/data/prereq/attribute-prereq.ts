import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import fields = foundry.data.fields
import { prereq } from "@util/enum/prereq.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { ActorType, NumericCompareType, gid } from "@data"
import { TooltipGURPS } from "@util"
import { NumericCriteria } from "@module/util/index.ts"
import { ActorInst } from "../actor/helpers.ts"

class AttributePrereq extends BasePrereq<AttributePrereqSchema> {
	static override TYPE = prereq.Type.Attribute

	static override defineSchema(): AttributePrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			which: new fields.StringField({ initial: gid.Strength }),
			has: new fields.BooleanField({ initial: true }),
			combined_with: new fields.StringField({ initial: "" }),
			qualifier: new fields.EmbeddedDataField(NumericCriteria, {
				required: true,
				nullable: false,
				initial: {
					compare: NumericCompareType.AtLeastNumber,
					qualifier: 10,
				},
			}),
		}
	}

	satisfied(actor: ActorInst<ActorType.Character>, _exclude: unknown, tooltip: TooltipGURPS | null): boolean {
		let value = actor.system.resolveAttributeCurrent(this.which)
		if (this.combined_with !== "") value += actor.system.resolveAttributeCurrent(this.combined_with)

		let satisfied = this.qualifier.matches(value)
		if (!this.has) satisfied = !satisfied

		if (!satisfied && tooltip !== null) {
			tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.Prefix)
			if (this.combined_with !== "") {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Attribute.CombinedWith, {
						has: this.hasText,
						att1: this.which,
						att2: this.combined_with,
						qualifier: this.qualifier.toString(),
					}),
				)
			} else {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Attribute.NotCombinedWith, {
						has: this.hasText,
						att1: this.which,
						qualifier: this.qualifier.toString(),
					}),
				)
			}
		}
		return satisfied
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface AttributePrereq extends BasePrereq<AttributePrereqSchema>, ModelPropsFromSchema<AttributePrereqSchema> {}

type AttributePrereqSchema = BasePrereqSchema & {
	has: fields.BooleanField<boolean, boolean, true, false, true>
	which: fields.StringField<string, string, true, false, true>
	combined_with: fields.StringField<string, string, true, false, true>
	qualifier: fields.EmbeddedDataField<NumericCriteria, true, false, true>
}
export { AttributePrereq }
