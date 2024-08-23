import { ActorDataModel } from "@module/data/abstract.ts"
import fields = foundry.data.fields

class PointsRecord extends foundry.abstract.DataModel<ActorDataModel, PointsRecordSchema> {
	static override defineSchema(): PointsRecordSchema {
		const fields = foundry.data.fields
		return {
			when: new fields.StringField({ required: true, nullable: false, initial: "" }),
			points: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			reason: new fields.StringField({ required: true, nullable: false, initial: "" }),
		}
	}
}

interface PointsRecord
	extends foundry.abstract.DataModel<ActorDataModel, PointsRecordSchema>,
		ModelPropsFromSchema<PointsRecordSchema> {}

type PointsRecordSchema = {
	when: fields.StringField<string, string, true, false, true>
	points: fields.NumberField<number, number, true, false, true>
	reason: fields.StringField<string, string, true, false, true>
}

export { PointsRecord, type PointsRecordSchema }
