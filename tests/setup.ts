// import "../build/lib/foundry-utils.ts"
// import { MockActor } from "./mocks/actor.ts"
// import { mockFoundry } from "./mocks/foundry.ts"
// import { MockItem } from "./mocks/item.ts"
// import { MockToken } from "./mocks/token.ts"
// import { MockUser } from "./mocks/user.ts"
//
// // @ts-expect-error it's a mock dude
// global.game = Object.freeze({
// 	settings: Object.freeze({
// 		get: (_module: string, _settingKey: string) => {
// 			// switch (
// 			// 	settingKey
// 			// 	/* Proficiency Modifiers */
// 			// 	// case "proficiencyUntrainedModifier":
// 			// 	// 	return -2
// 			// 	// case "proficiencyTrainedModifier":
// 			// 	// 	return 2
// 			// 	// case "proficiencyExpertModifier":
// 			// 	// 	return 4
// 			// 	// case "proficiencyMasterModifier":
// 			// 	// 	return 6
// 			// 	// case "proficiencyLegendaryModifier":
// 			// 	// 	return 8
// 			// 	//
// 			// 	// /* Variant rules */
// 			// 	// case "proficiencyVariant":
// 			// 	// 	return false
// 			// 	// case "automaticBonusVariant":
// 			// 	// 	return "noABP"
// 			// 	// default:
// 			// 	// 	throw new Error("Undefined setting.")
// 			// ) {
// 			// }
// 		},
// 	}),
// 	gurps: { settings: { variants: { pwol: false } } },
// 	user: {},
// 	i18n: {
// 		localize: (path: string) => path,
// 		format: (stringId: string, _data?: { [key: string]: string | number | boolean | null }) => stringId,
// 	},
// })
//
// // // @ts-expect-error it's a mock dude
// // global.foundry = Object.freeze({
// // 	abstract: {
// // 		DataModel: class {},
// // 		TypeDataModel: class {},
// // 	},
// // 	data: {
// // 		fields: {
// // 			BooleanField: class {},
// // 			StringField: class {},
// // 			NumberField: class {},
// // 			ArrayField: class {},
// // 			SchemaField: class {},
// // 			ObjectField: class {},
// // 			DataField: class {},
// // 		},
// // 	},
// // })
//
// // @ts-expect-error it's a mock dude
// global.foundry = mockFoundry
// // @ts-expect-error it's a mock dude
// global.User = MockUser
// // @ts-expect-error it's a mock dude
// global.Actor = MockActor
// // @ts-expect-error it's a mock dude
// global.Item = MockItem
// // @ts-expect-error it's a mock dude
// global.Token = MockToken
// // @ts-expect-error it's a mock dude
// global.FormApplication = class {}
// // @ts-expect-error it's a mock dude
// global.Roll = class {}
// // @ts-expect-error it's a mock dude
// global.Application = class {}
// // @ts-expect-error it's a mock dude
// global.Dialog = class {}
// // @ts-expect-error it's a mock dude
// global.ChatMessage = class {}
// // @ts-expect-error it's a mock dude
// global.Ruler = class {}
// // @ts-expect-error it's a mock dude
// global.FilePicker = class {}
// // @ts-expect-error it's a mock dude
// global.JournalEntryPage = class {}
// // @ts-expect-error it's a mock dude
// global.JournalPageSheet = class {}
// // @ts-expect-error it's a mock dude
// global.JournalPDFPageSheet = class {}
// // @ts-expect-error it's a mock dude
// global.CombatTracker = class {}
// // @ts-expect-error it's a mock dude
// global.ItemDirectory = class {}
// // @ts-expect-error it's a mock dude
// global.Combat = class {}
// // @ts-expect-error it's a mock dude
// global.Combatant = class {}
// // @ts-expect-error it's a mock dude
// global.DocumentSheet = class {}
// // @ts-expect-error it's a mock dude
// global.Hooks = class {
// 	static on(..._args: unknown[]) {}
// }
