import "../build/lib/foundry-utils.ts"
import { MockActor } from "./mocks/actor.ts"
import { MockItem } from "./mocks/item.ts"
import { MockToken } from "./mocks/token.ts"
import { MockUser } from "./mocks/user.ts"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.game = Object.freeze({
	settings: Object.freeze({
		get: (_module: string, _settingKey: string) => {
			// switch (
			// 	settingKey
			// 	/* Proficiency Modifiers */
			// 	// case "proficiencyUntrainedModifier":
			// 	// 	return -2
			// 	// case "proficiencyTrainedModifier":
			// 	// 	return 2
			// 	// case "proficiencyExpertModifier":
			// 	// 	return 4
			// 	// case "proficiencyMasterModifier":
			// 	// 	return 6
			// 	// case "proficiencyLegendaryModifier":
			// 	// 	return 8
			// 	//
			// 	// /* Variant rules */
			// 	// case "proficiencyVariant":
			// 	// 	return false
			// 	// case "automaticBonusVariant":
			// 	// 	return "noABP"
			// 	// default:
			// 	// 	throw new Error("Undefined setting.")
			// ) {
			// }
		},
	}),
	gurps: { settings: { variants: { pwol: false } } },
	user: {},
	i18n: {
		localize: (path: string) => path,
		format: (stringId: string, _data?: { [key: string]: string | number | boolean | null }) => stringId,
	},
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).User = MockUser
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Actor = MockActor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Item = MockItem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Token = MockToken
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).FormApplication = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Roll = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Application = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Dialog = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).ChatMessage = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Ruler = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).FilePicker = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).JournalEntryPage = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).JournalPageSheet = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).JournalPDFPageSheet = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).CombatTracker = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).ItemDirectory = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Combat = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Combatant = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Hooks = class {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static on(..._args: any) {}
}

Math.clamped = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
