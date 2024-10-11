// import "../build/lib/foundry-utils.ts"
// import { MockActor } from "./mocks/actor.ts"
// import { mockFoundry } from "./mocks/foundry.ts"
// import { MockItem } from "./mocks/item.ts"
// import { MockToken } from "./mocks/token.ts"
// import { MockUser } from "./mocks/user.ts"
//
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
// global.foundry = mockFoundry
// global.User = MockUser
// global.Actor = MockActor
// global.Item = MockItem
// global.Token = MockToken
// global.FormApplication = class {}
// global.Roll = class {}
// global.Application = class {}
// global.Dialog = class {}
// global.ChatMessage = class {}
// global.Ruler = class {}
// global.FilePicker = class {}
// global.JournalEntryPage = class {}
// global.JournalPageSheet = class {}
// global.JournalPDFPageSheet = class {}
// global.CombatTracker = class {}
// global.ItemDirectory = class {}
// global.Combat = class {}
// global.Combatant = class {}
// global.DocumentSheet = class {}
// global.Hooks = class {
// 	static on(..._args: unknown[]) {}
// }
