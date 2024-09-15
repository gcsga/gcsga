import {
	RollModifier,
	RollModifierSchema,
	RollModifierStack,
	RollModifierStackSchema,
} from "@module/data/roll-modifier.ts"
import fields = foundry.data.fields
import { ActorGURPS2 } from "@module/document/actor.ts"
import { UserGURPS } from "@module/document/user.ts"

class UserSystemFlags<TParent extends UserGURPS = UserGURPS> extends foundry.abstract.DataModel<
	TParent,
	UserSystemFlagsSchema
> {
	static override defineSchema(): UserSystemFlagsSchema {
		const fields = foundry.data.fields
		return {
			[UserFlags.LastStack]: new fields.ArrayField(new fields.SchemaField(RollModifier.defineSchema())),
			[UserFlags.ModifierStack]: new fields.ArrayField(new fields.SchemaField(RollModifier.defineSchema())),
			[UserFlags.ModifierSticky]: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			[UserFlags.SavedStacks]: new fields.ArrayField(new fields.SchemaField(RollModifierStack.defineSchema())),
			[UserFlags.LastActor]: new fields.ForeignDocumentField(ActorGURPS2, {
				required: true,
				nullable: true,
				idOnly: true,
			}),
			[UserFlags.LastToken]: new fields.ForeignDocumentField(TokenDocument, {
				required: true,
				nullable: true,
				idOnly: true,
			}),
			[UserFlags.SearchPackContents]: new fields.BooleanField(),
		}
	}
}

interface UserSystemFlags extends ModelPropsFromSchema<UserSystemFlagsSchema> {}

enum UserFlags {
	LastStack = "lastStack",
	ModifierStack = "modifierStack",
	ModifierSticky = "modifierSticky",
	SavedStacks = "savedStacks",
	LastActor = "lastActor",
	LastToken = "lastToken",
	SearchPackContents = "searchPackContents",
}

type UserSystemFlagsSchema = {
	[UserFlags.LastStack]: fields.ArrayField<
		fields.SchemaField<RollModifierSchema, SourceFromSchema<RollModifierSchema>, RollModifier>
	>
	[UserFlags.ModifierStack]: fields.ArrayField<
		fields.SchemaField<RollModifierSchema, SourceFromSchema<RollModifierSchema>, RollModifier>
	>
	[UserFlags.ModifierSticky]: fields.BooleanField<boolean, boolean, true, false, true>
	[UserFlags.SavedStacks]: fields.ArrayField<
		fields.SchemaField<RollModifierStackSchema, SourceFromSchema<RollModifierStackSchema>, RollModifierStack>
	>
	[UserFlags.LastActor]: fields.ForeignDocumentField<string, true, true, true>
	[UserFlags.LastToken]: fields.ForeignDocumentField<string, true, true, true>
	[UserFlags.SearchPackContents]: fields.BooleanField<boolean, boolean, true, false, true>
}

export { UserSystemFlags, type UserSystemFlagsSchema, UserFlags }
