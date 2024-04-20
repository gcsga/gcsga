import { SYSTEM_NAME } from "@module/data/constants.ts"
import { RollModifier, RollModifierStack } from "@module/data/types.ts"

enum UserFlags {
	Init = "init",
	LastStack = "lastStack",
	ModifierStack = "modifierStack",
	ModifierSticky = "modifierSticky",
	SavedStacks = "savedStacks",
	LastActor = "lastActor",
	LastToken = "lastToken",
	SearchPackContents = "searchPackContents",
}

type UserSourceGURPS = Omit<foundry.documents.UserSource, "flags"> & {
	flags: DeepPartial<UserFlagsGURPS>
}

type UserFlagsGURPS = DocumentFlags & {
	[SYSTEM_NAME]: {
		[UserFlags.Init]: boolean
		[UserFlags.LastStack]: RollModifier[]
		[UserFlags.ModifierStack]: RollModifier[]
		[UserFlags.ModifierSticky]: boolean
		[UserFlags.SavedStacks]: RollModifierStack[]
		[UserFlags.LastActor]: string | null
		[UserFlags.LastToken]: string | null
		[UserFlags.SearchPackContents]: boolean
	}
}

const UserDefaultFlags: UserFlagsGURPS = {
	[SYSTEM_NAME]: {
		[UserFlags.Init]: true,
		[UserFlags.LastStack]: [],
		[UserFlags.ModifierStack]: [],
		[UserFlags.ModifierSticky]: false,
		[UserFlags.SavedStacks]: [],
		[UserFlags.LastActor]: null,
		[UserFlags.LastToken]: null,
		[UserFlags.SearchPackContents]: false,
	},
}

export { UserFlags, UserDefaultFlags }
export type { UserFlagsGURPS, UserSourceGURPS }
