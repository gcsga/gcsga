import { ConditionID } from "@item/condition/data"
import { AttributeType, ThresholdOp } from "@module/attribute/data"
import { EFFECT_ACTION, SETTINGS, SYSTEM_NAME, gid } from "@module/data"


export const defaultSettings = {
	[SYSTEM_NAME]: {
		[`${SETTINGS.DEFAULT_ATTRIBUTES}.effects`]: [
			{
				attribute: gid.FatiguePoints,
				state: "Unconscious",
				enter: [{ id: ConditionID.Fatigued, action: EFFECT_ACTION.ADD }],
				leave: [{ id: ConditionID.Fatigued, action: EFFECT_ACTION.REMOVE }],
			},
			{
				attribute: gid.FatiguePoints,
				state: "Collapse",
				enter: [{ id: ConditionID.Fatigued, action: EFFECT_ACTION.ADD }],
				leave: [{ id: ConditionID.Fatigued, action: EFFECT_ACTION.REMOVE }],
			},
			{
				attribute: gid.FatiguePoints,
				state: "Tired",
				enter: [{ id: ConditionID.Fatigued, action: EFFECT_ACTION.ADD }],
				leave: [{ id: ConditionID.Fatigued, action: EFFECT_ACTION.REMOVE }],
			},
			{
				attribute: gid.HitPoints,
				state: "Dead",
				enter: [
					{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD },
					{ id: ConditionID.Dead, action: EFFECT_ACTION.ADD },
				],
				leave: [],
			},
			{
				attribute: gid.HitPoints,
				state: "Dying #4",
				enter: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD }],
				leave: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.REMOVE }],
			},
			{
				attribute: gid.HitPoints,
				state: "Dying #3",
				enter: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD }],
				leave: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.REMOVE }],
			},
			{
				attribute: gid.HitPoints,
				state: "Dying #2",
				enter: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD }],
				leave: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.REMOVE }],
			},
			{
				attribute: gid.HitPoints,
				state: "Dying #1",
				enter: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD }],
				leave: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.REMOVE }],
			},
			{
				attribute: gid.HitPoints,
				state: "Collapse",
				enter: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD }],
				leave: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.REMOVE }],
			},
			{
				attribute: gid.HitPoints,
				state: "Reeling",
				enter: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD }],
				leave: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.REMOVE }],
			},
		],
		[`${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`]: [
			{
				id: "st",
				type: AttributeType.Integer,
				name: "ST",
				full_name: "Strength",
				attribute_base: "10",
				cost_per_point: 10,
				cost_adj_percent_per_sm: 10,
			},
			{
				id: "dx",
				type: AttributeType.Integer,
				name: "DX",
				full_name: "Dexterity",
				attribute_base: "10",
				cost_per_point: 20,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "iq",
				type: AttributeType.Integer,
				name: "IQ",
				full_name: "Intelligence",
				attribute_base: "10",
				cost_per_point: 20,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "ht",
				type: AttributeType.Integer,
				name: "HT",
				full_name: "Health",
				attribute_base: "10",
				cost_per_point: 10,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "will",
				type: AttributeType.Integer,
				name: "Will",
				attribute_base: "$iq",
				cost_per_point: 5,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "fright_check",
				type: AttributeType.Integer,
				name: "Fright Check",
				attribute_base: "$will",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "per",
				type: AttributeType.Integer,
				name: "Per",
				full_name: "Perception",
				attribute_base: "$iq",
				cost_per_point: 5,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "vision",
				type: AttributeType.Integer,
				name: "Vision",
				attribute_base: "$per",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "hearing",
				type: AttributeType.Integer,
				name: "Hearing",
				attribute_base: "$per",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "taste_smell",
				type: AttributeType.Integer,
				name: "Taste \u0026 Smell",
				attribute_base: "$per",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "touch",
				type: AttributeType.Integer,
				name: "Touch",
				attribute_base: "$per",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "basic_speed",
				type: AttributeType.Decimal,
				name: "Basic Speed",
				attribute_base: "($dx+$ht)/4",
				cost_per_point: 20,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "basic_move",
				type: AttributeType.Integer,
				name: "Basic Move",
				attribute_base: "floor($basic_speed)",
				cost_per_point: 5,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: gid.FatiguePoints,
				type: AttributeType.Pool,
				name: gid.FatiguePoints,
				full_name: "Fatigue Points",
				attribute_base: "$ht",
				cost_per_point: 3,
				cost_adj_percent_per_sm: 0,
				thresholds: [
					{
						state: "Unconscious",
						expression: "-$fp",
						ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge, ThresholdOp.HalveST],
					},
					{
						state: "Collapse",
						explanation:
							"Roll vs. Will to do anything besides talk or rest; failure causes unconsciousness\nEach FP you lose below 0 also causes 1 HP of injury\nMove, Dodge and ST are halved (B426)",
						expression: "0",
						ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge, ThresholdOp.HalveST],
					},
					{
						state: "Tired",
						explanation: "Move, Dodge and ST are halved (B426)",
						expression: "round($fp/3)",
						ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge, ThresholdOp.HalveST],
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
				id: gid.HitPoints,
				type: AttributeType.Pool,
				name: gid.HitPoints,
				full_name: "Hit Points",
				attribute_base: "$st",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 10,
				thresholds: [
					{
						state: "Dead",
						expression: "round(-$hp*5)",
						ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
					},
					{
						state: "Dying #4",
						explanation:
							"Roll vs. HT to avoid death\nRoll vs. HT-4 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
						expression: "round(-$hp*4)",
						ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
					},
					{
						state: "Dying #3",
						explanation:
							"Roll vs. HT to avoid death\nRoll vs. HT-3 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
						expression: "round(-$hp*3)",
						ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
					},
					{
						state: "Dying #2",
						explanation:
							"Roll vs. HT to avoid death\nRoll vs. HT-2 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
						expression: "round(-$hp*2)",
						ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
					},
					{
						state: "Dying #1",
						explanation:
							"Roll vs. HT to avoid death\nRoll vs. HT-1 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
						expression: "-$hp",
						ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
					},
					{
						state: "Collapse",
						explanation:
							"Roll vs. HT every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
						expression: "round($hp/3)",
						ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
					},
					{
						state: "Reeling",
						explanation: "Move and Dodge are halved (B419)",
						expression: "round($hp/3)",
						ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
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
	}
}
