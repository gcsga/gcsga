import { RollModifier, RollModifierStack, SYSTEM_NAME } from "@module/data/index.ts"

type UserSourceGURPS = Omit<foundry.documents.UserSource, "flags"> & {
	flags: DeepPartial<UserFlagsGURPS>
}

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

export { UserFlags }
export type { UserSourceGURPS, UserFlagsGURPS }
