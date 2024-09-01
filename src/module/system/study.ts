import { LocalizeGURPS, study } from "@util"
import fields = foundry.data.fields
import { StudyTemplate } from "@module/data/item/templates/study.ts"

// export interface Study {
// 	type: study.Type
// 	hours: number
// 	note?: string
// }
//
export function studyHoursProgressText(hours: number, needed: study.Level | "", force: boolean): string {
	if (hours <= 0) {
		hours = 0
		if (!force) return ""
	}
	return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.study.studied_alt, {
		hours: hours,
		total: needed,
	})
}

export function resolveStudyHours(studyEntries: Study[]): number {
	let total = 0
	for (const entry of studyEntries) {
		total += entry.hours * study.Type.multiplier(entry.type)
	}
	return total
}

class Study<TParent extends StudyTemplate = StudyTemplate> extends foundry.abstract.DataModel<TParent, StudySchema> {
	static override defineSchema(): StudySchema {
		const fields = foundry.data.fields
		return {
			type: new fields.StringField({ required: true, nullable: false, choices: study.Types }),
			hours: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
			note: new fields.StringField({ required: true, nullable: false, initial: "" }),
		}
	}

	static progressText(hours: number, needed: study.Level, force: boolean): string {
		if (hours <= 0) {
			hours = 0
			if (!force) return ""
		}
		return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.study.studied_alt, {
			hours,
			total: needed,
		})
	}

	static resolveHours<TParent extends StudyTemplate>(parent: TParent): number {
		let total = 0
		for (const entry of parent.study) {
			total += entry.hours * study.Type.multiplier(entry.type)
		}
		return total
	}
}

interface Study<TParent extends StudyTemplate>
	extends foundry.abstract.DataModel<TParent, StudySchema>,
		ModelPropsFromSchema<StudySchema> {}

type StudySchema = {
	type: fields.StringField<study.Type, study.Type, true, false, true>
	hours: fields.NumberField<number, number, true, false, true>
	note: fields.StringField<string, string, true, false, true>
}

export { Study, type StudySchema }
