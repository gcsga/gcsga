import { ConditionID, EFFECT_ACTION, SETTINGS, SYSTEM_NAME, gid } from "@data"
import { ThresholdOp } from "@sytem/attribute/data.ts"
import { MookData } from "@sytem/mook/data.ts"
import { attribute } from "@util/enum/attribute.ts"
import { progression } from "@util/enum/progression.ts"

export class MockGame {
	settings: MockSettings

	constructor() {
		this.settings = new MockSettings()
	}
}

class MockSettings {
	get<N extends string, K extends string>(namespace: N, key: K): unknown {
		return this.getDefault(namespace, key)
	}

	private getDefault<N extends string, K extends string>(namespace: N, key: K): (typeof this.defaultSettings)[N][K] {
		return this.defaultSettings[namespace]?.[key] ?? null
	}

	private defaultSettings: Record<string, Record<string, unknown>> = {
		[SYSTEM_NAME]: {
			[`${SETTINGS.DEFAULT_ATTRIBUTES}.settings`]: [
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
					type: attribute.Type.Integer,
					name: "ST",
					full_name: "Strength",
					attribute_base: "10",
					cost_per_point: 10,
					cost_adj_percent_per_sm: 10,
				},
				{
					id: "dx",
					type: attribute.Type.Integer,
					name: "DX",
					full_name: "Dexterity",
					attribute_base: "10",
					cost_per_point: 20,
					cost_adj_percent_per_sm: 0,
				},
				{
					id: "iq",
					type: attribute.Type.Integer,
					name: "IQ",
					full_name: "Intelligence",
					attribute_base: "10",
					cost_per_point: 20,
					cost_adj_percent_per_sm: 0,
				},
				{
					id: "ht",
					type: attribute.Type.Integer,
					name: "HT",
					full_name: "Health",
					attribute_base: "10",
					cost_per_point: 10,
					cost_adj_percent_per_sm: 0,
				},
				{
					id: "will",
					type: attribute.Type.Integer,
					name: "Will",
					attribute_base: "$iq",
					cost_per_point: 5,
					cost_adj_percent_per_sm: 0,
				},
				{
					id: "fright_check",
					type: attribute.Type.Integer,
					name: "Fright Check",
					attribute_base: "$will",
					cost_per_point: 2,
					cost_adj_percent_per_sm: 0,
				},
				{
					id: "per",
					type: attribute.Type.Integer,
					name: "Per",
					full_name: "Perception",
					attribute_base: "$iq",
					cost_per_point: 5,
					cost_adj_percent_per_sm: 0,
				},
				{
					id: "vision",
					type: attribute.Type.Integer,
					name: "Vision",
					attribute_base: "$per",
					cost_per_point: 2,
					cost_adj_percent_per_sm: 0,
				},
				{
					id: "hearing",
					type: attribute.Type.Integer,
					name: "Hearing",
					attribute_base: "$per",
					cost_per_point: 2,
					cost_adj_percent_per_sm: 0,
				},
				{
					id: "taste_smell",
					type: attribute.Type.Integer,
					name: "Taste \u0026 Smell",
					attribute_base: "$per",
					cost_per_point: 2,
					cost_adj_percent_per_sm: 0,
				},
				{
					id: "touch",
					type: attribute.Type.Integer,
					name: "Touch",
					attribute_base: "$per",
					cost_per_point: 2,
					cost_adj_percent_per_sm: 0,
				},
				{
					id: "basic_speed",
					type: attribute.Type.Decimal,
					name: "Basic Speed",
					attribute_base: "($dx+$ht)/4",
					cost_per_point: 20,
					cost_adj_percent_per_sm: 0,
				},
				{
					id: "basic_move",
					type: attribute.Type.Integer,
					name: "Basic Move",
					attribute_base: "floor($basic_speed)",
					cost_per_point: 5,
					cost_adj_percent_per_sm: 0,
				},
				{
					id: gid.FatiguePoints,
					type: attribute.Type.Pool,
					name: "FP",
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
					type: attribute.Type.Pool,
					name: "HP",
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
			],
		},
	}
}

export const _defaultMookData: Partial<MookData> = {
	settings: {
		attributes: [
			{
				id: "st",
				type: attribute.Type.Integer,
				name: "ST",
				full_name: "Strength",
				attribute_base: "10",
				cost_per_point: 10,
				cost_adj_percent_per_sm: 10,
			},
			{
				id: "dx",
				type: attribute.Type.Integer,
				name: "DX",
				full_name: "Dexterity",
				attribute_base: "10",
				cost_per_point: 20,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "iq",
				type: attribute.Type.Integer,
				name: "IQ",
				full_name: "Intelligence",
				attribute_base: "10",
				cost_per_point: 20,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "ht",
				type: attribute.Type.Integer,
				name: "HT",
				full_name: "Health",
				attribute_base: "10",
				cost_per_point: 10,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "will",
				type: attribute.Type.Integer,
				name: "Will",
				attribute_base: "$iq",
				cost_per_point: 5,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "fright_check",
				type: attribute.Type.Integer,
				name: "Fright Check",
				attribute_base: "$will",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "per",
				type: attribute.Type.Integer,
				name: "Per",
				full_name: "Perception",
				attribute_base: "$iq",
				cost_per_point: 5,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "vision",
				type: attribute.Type.Integer,
				name: "Vision",
				attribute_base: "$per",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "hearing",
				type: attribute.Type.Integer,
				name: "Hearing",
				attribute_base: "$per",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "taste_smell",
				type: attribute.Type.Integer,
				name: "Taste \u0026 Smell",
				attribute_base: "$per",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "touch",
				type: attribute.Type.Integer,
				name: "Touch",
				attribute_base: "$per",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "basic_speed",
				type: attribute.Type.Decimal,
				name: "Basic Speed",
				attribute_base: "($dx+$ht)/4",
				cost_per_point: 20,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "basic_move",
				type: attribute.Type.Integer,
				name: "Basic Move",
				attribute_base: "floor($basic_speed)",
				cost_per_point: 5,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "fp",
				type: attribute.Type.Pool,
				name: "FP",
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
				id: "hp",
				type: attribute.Type.Pool,
				name: "HP",
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
		],
		damage_progression: progression.Option.BasicSet,
		move_types: [],
	},
	profile: {
		name: "Bad Guy",
		description: "",
		title: "",
		height: "",
		weight: "",
		SM: 0,
		portrait: "icons/svg/mystery-man.svg",
		userdesc: "",
	},
}
