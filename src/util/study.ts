import { Study, StudyHoursNeeded, StudyType } from "@module/data"
import { LocalizeGURPS } from "./localize"

function getMultiplier(type: StudyType): number {
	switch (type) {
		case StudyType.Self:
			return 1 / 2
		case StudyType.Job:
			return 1 / 4
		case StudyType.Teacher:
			return 1
		case StudyType.Intensive:
			return 2
		default:
			console.error(`Unknown Study type ${type}`)
			return 1
	}
}

export function resolveStudyHours(study: Study[]): number {
	let total = 0
	for (const entry of study) {
		total += entry.hours * getMultiplier(entry.type)
	}
	return total
}

export function studyHoursProgressText(hours: number, needed: StudyHoursNeeded, force: boolean): string {
	if (hours <= 0) {
		hours = 0
		if (!force) return ""
	}
	let studyNeeded = "200"
	if (needed !== studyNeeded) studyNeeded = needed
	return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.study.studied_alt, {
		hours: hours,
		total: studyNeeded,
	})
}
