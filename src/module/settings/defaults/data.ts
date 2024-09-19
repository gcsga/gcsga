import { AttributeDefSchema } from "@module/data/attribute/attribute-definition.ts"
import { gid, ConditionID } from "@module/data/constants.ts"
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

export { DEFAULT_ATTRIBUTE_SETTINGS, DEFAULT_RESOURCE_TRACKER_SETTINGS, DEFAULT_MOVE_TYPE_SETTINGS }
