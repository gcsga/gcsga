import { AttributeDefSchema } from "@module/data/attribute/attribute-definition.ts"
import { gid, ConditionID } from "@module/data/constants.ts"
import { BodySchema } from "@module/data/hit-location.ts"
import { MoveTypeDefSchema } from "@module/data/move-type/move-type-definition.ts"
import { MoveTypeOverrideConditionType } from "@module/data/move-type/move-type-override.ts"
import { ResourceTrackerDefSchema } from "@module/data/resource-tracker/index.ts"
import { attribute, threshold } from "@util"

const DEFAULT_ATTRIBUTE_SETTINGS: Partial<SourceFromSchema<AttributeDefSchema>>[] = [
	{
		id: "st",
		type: attribute.Type.Integer,
		name: "ST",
		full_name: "Strength",
		base: "10",
		cost_per_point: 10,
		cost_adj_percent_per_sm: 10,
	},
	{
		id: "dx",
		type: attribute.Type.Integer,
		name: "DX",
		full_name: "Dexterity",
		base: "10",
		cost_per_point: 20,
	},
	{
		id: "iq",
		type: attribute.Type.Integer,
		name: "IQ",
		full_name: "Intelligence",
		base: "10",
		cost_per_point: 20,
	},
	{
		id: "ht",
		type: attribute.Type.Integer,
		name: "HT",
		full_name: "Health",
		base: "10",
		cost_per_point: 10,
	},
	{
		id: "will",
		type: attribute.Type.Integer,
		name: "Will",
		base: "$iq",
		cost_per_point: 5,
	},
	{
		id: "fright_check",
		type: attribute.Type.Integer,
		name: "Fright Check",
		base: "$will",
		cost_per_point: 2,
	},
	{
		id: "per",
		type: attribute.Type.Integer,
		name: "Per",
		full_name: "Perception",
		base: "$iq",
		cost_per_point: 5,
	},
	{
		id: "vision",
		type: attribute.Type.Integer,
		name: "Vision",
		base: "$per",
		cost_per_point: 2,
	},
	{
		id: "hearing",
		type: attribute.Type.Integer,
		name: "Hearing",
		base: "$per",
		cost_per_point: 2,
	},
	{
		id: "taste_smell",
		type: attribute.Type.Integer,
		name: "Taste & Smell",
		base: "$per",
		cost_per_point: 2,
	},
	{
		id: "touch",
		type: attribute.Type.Integer,
		name: "Touch",
		base: "$per",
		cost_per_point: 2,
	},
	{
		id: "basic_speed",
		type: attribute.Type.Decimal,
		name: "Basic Speed",
		base: "($dx+$ht)/4",
		cost_per_point: 20,
	},
	{
		id: "basic_move",
		type: attribute.Type.Integer,
		name: "Basic Move",
		base: "floor($basic_speed)",
		cost_per_point: 5,
	},
	{
		id: "fp",
		type: attribute.Type.Pool,
		name: "FP",
		full_name: "Fatigue Points",
		base: "$ht",
		cost_per_point: 3,
		thresholds: [
			{
				state: "Unconscious",
				expression: "-$fp",
				ops: [threshold.Op.HalveMove, threshold.Op.HalveDodge, threshold.Op.HalveST],
			},
			{
				state: "Collapse",
				expression: "0",
				explanation:
					"Roll vs. Will to do anything besides talk or rest; failure causes unconsciousness\nEach FP you lose below 0 also causes 1 HP of injury\nMove, Dodge and ST are halved (B426)",
				ops: [threshold.Op.HalveMove, threshold.Op.HalveDodge, threshold.Op.HalveST],
			},
			{
				state: "Tired",
				expression: "ceil($fp/3)-1",
				explanation: "Move, Dodge and ST are halved (B426)",
				ops: [threshold.Op.HalveMove, threshold.Op.HalveDodge, threshold.Op.HalveST],
			},
			{
				state: "Tiring",
				expression: "$fp-1",
			},
			{
				state: "Rested",
				expression: "$fp",
			},
		],
	},
	{
		id: "hp",
		type: attribute.Type.Pool,
		name: "HP",
		full_name: "Hit Points",
		base: "$st",
		cost_per_point: 2,
		cost_adj_percent_per_sm: 10,
		thresholds: [
			{
				state: "Dead",
				expression: "round(-$hp*5)",
				ops: [threshold.Op.HalveMove, threshold.Op.HalveDodge],
			},
			{
				state: "Dying #4",
				expression: "round(-$hp*4)",
				explanation:
					"Roll vs. HT to avoid death\nRoll vs. HT-4 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
				ops: [threshold.Op.HalveMove, threshold.Op.HalveDodge],
			},
			{
				state: "Dying #3",
				expression: "round(-$hp*3)",
				explanation:
					"Roll vs. HT to avoid death\nRoll vs. HT-3 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
				ops: [threshold.Op.HalveMove, threshold.Op.HalveDodge],
			},
			{
				state: "Dying #2",
				expression: "round(-$hp*2)",
				explanation:
					"Roll vs. HT to avoid death\nRoll vs. HT-2 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
				ops: [threshold.Op.HalveMove, threshold.Op.HalveDodge],
			},
			{
				state: "Dying #1",
				expression: "-$hp",
				explanation:
					"Roll vs. HT to avoid death\nRoll vs. HT-1 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
				ops: [threshold.Op.HalveMove, threshold.Op.HalveDodge],
			},
			{
				state: "Collapse",
				expression: "0",
				explanation: "Roll vs. HT every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
				ops: [threshold.Op.HalveMove, threshold.Op.HalveDodge],
			},
			{
				state: "Reeling",
				expression: "ceil($hp/3)-1",
				explanation: "Move and Dodge are halved (B419)",
				ops: [threshold.Op.HalveMove, threshold.Op.HalveDodge],
			},
			{
				state: "Wounded",
				expression: "$hp-1",
			},
			{
				state: "Healthy",
				expression: "$hp",
			},
		],
	},
]

const DEFAULT_RESOURCE_TRACKER_SETTINGS: Partial<SourceFromSchema<ResourceTrackerDefSchema>>[] = []

const DEFAULT_MOVE_TYPE_SETTINGS: Partial<SourceFromSchema<MoveTypeDefSchema>>[] = [
	{
		id: gid.Ground,
		name: "Ground Move",
		base: "$basic_move",
		cost_per_point: 5,
		overrides: [
			{
				condition: {
					type: MoveTypeOverrideConditionType.Condition,
					qualifier: ConditionID.PostureCrawl,
				},
				base: "floor($basic_move/3)",
			},
			{
				condition: {
					type: MoveTypeOverrideConditionType.Condition,
					qualifier: ConditionID.PostureKneel,
				},
				base: "floor($basic_move/3)",
			},
			{
				condition: {
					type: MoveTypeOverrideConditionType.Condition,
					qualifier: ConditionID.PostureCrouch,
				},
				base: "floor($basic_move*2/3)",
			},
			{
				condition: {
					type: MoveTypeOverrideConditionType.Condition,
					qualifier: ConditionID.PostureProne,
				},
				base: "1",
			},
			{
				condition: {
					type: MoveTypeOverrideConditionType.Condition,
					qualifier: ConditionID.PostureSit,
				},
				base: "0",
			},
		],
	},
	{
		id: gid.Water,
		name: "Water Move",
		base: "$basic_move/5",
		cost_per_point: 5,
		overrides: [
			{
				condition: {
					type: MoveTypeOverrideConditionType.Trait,
					// TODO: replace with variable for better language support
					qualifier: "Amphibious",
				},
				base: "$basic_move",
			},
			{
				condition: {
					type: MoveTypeOverrideConditionType.Trait,
					// TODO: replace with variable for better language support
					qualifier: "Aquatic",
				},
				base: "$basic_move",
			},
		],
	},
	{
		id: gid.Air,
		name: "Air Move",
		base: "0",
		cost_per_point: 5,
		overrides: [
			{
				condition: {
					type: MoveTypeOverrideConditionType.Trait,
					// TODO: replace with variable for better language support
					qualifier: "Flight",
				},
				base: "$basic_speed*2",
			},
			{
				condition: {
					type: MoveTypeOverrideConditionType.Trait,
					// TODO: replace with variable for better language support
					qualifier: "Walk on Air",
				},
				base: `$${gid.Ground}`,
			},
		],
	},
	{
		id: gid.Space,
		name: "Space Move",
		base: "0",
		cost_per_point: 5,
		overrides: [],
	},
]

const DEFAULT_BODY_TYPE: SourceFromSchema<BodySchema> = {
	name: "Humanoid",
	roll: "3d6",
	locations: [
		{
			id: "eye",
			choice_name: "Eyes",
			table_name: "Eyes",
			slots: 0,
			hit_penalty: -9,
			dr_bonus: 0,
			description:
				"An attack that misses by 1 hits the torso instead. Only impaling (imp), piercing (pi-, pi, pi+, pi++), and tight-beam burning (burn) attacks can target the eye – and only from the front or sides. Injury over HP÷10 blinds the eye. Otherwise, treat as skull, but without the extra DR!",
		},
		{
			id: "skull",
			choice_name: "Skull",
			table_name: "Skull",
			slots: 2,
			hit_penalty: -7,
			dr_bonus: 2,
			description:
				"An attack that misses by 1 hits the torso instead. Wounding modifier is x4. Knockdown rolls are at -10. Critical hits use the Critical Head Blow Table (B556). Exception: These special effects do not apply to toxic (tox) damage.",
		},
		{
			id: "face",
			choice_name: "Face",
			table_name: "Face",
			slots: 1,
			hit_penalty: -5,
			dr_bonus: 0,
			description:
				"An attack that misses by 1 hits the torso instead. Jaw, cheeks, nose, ears, etc. If the target has an open-faced helmet, ignore its DR. Knockdown rolls are at -5. Critical hits use the Critical Head Blow Table (B556). Corrosion (cor) damage gets a x1½ wounding modifier, and if it inflicts a major wound, it also blinds one eye (both eyes on damage over full HP). Random attacks from behind hit the skull instead.",
		},
		{
			id: "leg",
			choice_name: "Leg",
			table_name: "Right Leg",
			slots: 2,
			hit_penalty: -2,
			dr_bonus: 0,
			description:
				"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ½ HP from one blow) cripples the limb. Damage beyond that threshold is lost.",
		},
		{
			id: "arm",
			choice_name: "Arm",
			table_name: "Right Arm",
			slots: 1,
			hit_penalty: -2,
			dr_bonus: 0,
			description:
				"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ½ HP from one blow) cripples the limb. Damage beyond that threshold is lost. If holding a shield, double the penalty to hit: -4 for shield arm instead of -2.",
		},
		{
			id: "torso",
			choice_name: "Torso",
			table_name: "Torso",
			slots: 2,
			hit_penalty: 0,
			dr_bonus: 0,
			description: "",
		},
		{
			id: "groin",
			choice_name: "Groin",
			table_name: "Groin",
			slots: 1,
			hit_penalty: -3,
			dr_bonus: 0,
			description:
				"An attack that misses by 1 hits the torso instead. Human males and the males of similar species suffer double shock from crushing (cr) damage, and get -5 to knockdown rolls. Otherwise, treat as a torso hit.",
		},
		{
			id: "arm",
			choice_name: "Arm",
			table_name: "Left Arm",
			slots: 1,
			hit_penalty: -2,
			dr_bonus: 0,
			description:
				"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ½ HP from one blow) cripples the limb. Damage beyond that threshold is lost. If holding a shield, double the penalty to hit: -4 for shield arm instead of -2.",
		},
		{
			id: "leg",
			choice_name: "Leg",
			table_name: "Left Leg",
			slots: 2,
			hit_penalty: -2,
			dr_bonus: 0,
			description:
				"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ½ HP from one blow) cripples the limb. Damage beyond that threshold is lost.",
		},
		{
			id: "hand",
			choice_name: "Hand",
			table_name: "Hand",
			slots: 1,
			hit_penalty: -4,
			dr_bonus: 0,
			description:
				"If holding a shield, double the penalty to hit: -8 for shield hand instead of -4. Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ⅓ HP from one blow) cripples the extremity. Damage beyond that threshold is lost.",
		},
		{
			id: "foot",
			choice_name: "Foot",
			table_name: "Foot",
			slots: 1,
			hit_penalty: -4,
			dr_bonus: 0,
			description:
				"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ⅓ HP from one blow) cripples the extremity. Damage beyond that threshold is lost.",
		},
		{
			id: "neck",
			choice_name: "Neck",
			table_name: "Neck",
			slots: 2,
			hit_penalty: -5,
			dr_bonus: 0,
			description:
				"An attack that misses by 1 hits the torso instead. Neck and throat. Increase the wounding multiplier of crushing (cr) and corrosion (cor) attacks to x1½, and that of cutting (cut) damage to x2. At the GM’s option, anyone killed by a cutting (cut) blow to the neck is decapitated!",
		},
		{
			id: "vitals",
			choice_name: "Vitals",
			table_name: "Vitals",
			slots: 0,
			hit_penalty: -3,
			dr_bonus: 0,
			description:
				"An attack that misses by 1 hits the torso instead. Heart, lungs, kidneys, etc. Increase the wounding modifier for an impaling (imp) or any piercing (pi-, pi, pi+, pi++) attack to x3. Increase the wounding modifier for a tight-beam burning (burn) attack to x2. Other attacks cannot target the vitals.",
		},
	],
}

export { DEFAULT_ATTRIBUTE_SETTINGS, DEFAULT_RESOURCE_TRACKER_SETTINGS, DEFAULT_MOVE_TYPE_SETTINGS, DEFAULT_BODY_TYPE }
