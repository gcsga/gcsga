import { LocalizeGURPS, study } from "@util"

export interface Study {
	type: study.Type
	hours: number
	note?: string
}

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
