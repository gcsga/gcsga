// import { ConditionID, EFFECT_ACTION, SETTINGS, SYSTEM_NAME, gid } from "@data"
// import { MookSchema, ThresholdOp } from "@system"
// import { LocalizeGURPS } from "@util"
// import { attribute } from "@util/enum/attribute.ts"
// import { progression } from "@util/enum/progression.ts"
//
// export class MockGame {
// 	settings: MockSettings
//
// 	constructor() {
// 		this.settings = new MockSettings()
// 		LocalizeGURPS.ready = true
// 	}
// }
//
// class MockSettings {
// 	get<N extends string, K extends string>(namespace: N, key: K): unknown {
// 		return this.getDefault(namespace, key)
// 	}
//
// 	private getDefault<N extends string, K extends string>(namespace: N, key: K): (typeof this.defaultSettings)[N][K] {
// 		return this.defaultSettings[namespace]?.[key] ?? null
// 	}
//
// 	private defaultSettings: Record<string, Record<string, unknown>> = {
// 		[SYSTEM_NAME]: {
// 			[`${SETTINGS.DEFAULT_ATTRIBUTES}.settings`]: [
// 				{
// 					attribute: gid.FatiguePoints,
// 					state: "Unconscious",
// 					enter: [{ id: ConditionID.Fatigued, action: EFFECT_ACTION.ADD }],
// 					leave: [{ id: ConditionID.Fatigued, action: EFFECT_ACTION.REMOVE }],
// 				},
// 				{
// 					attribute: gid.FatiguePoints,
// 					state: "Collapse",
// 					enter: [{ id: ConditionID.Fatigued, action: EFFECT_ACTION.ADD }],
// 					leave: [{ id: ConditionID.Fatigued, action: EFFECT_ACTION.REMOVE }],
// 				},
// 				{
// 					attribute: gid.FatiguePoints,
// 					state: "Tired",
// 					enter: [{ id: ConditionID.Fatigued, action: EFFECT_ACTION.ADD }],
// 					leave: [{ id: ConditionID.Fatigued, action: EFFECT_ACTION.REMOVE }],
// 				},
// 				{
// 					attribute: gid.HitPoints,
// 					state: "Dead",
// 					enter: [
// 						{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD },
// 						{ id: ConditionID.Dead, action: EFFECT_ACTION.ADD },
// 					],
// 					leave: [],
// 				},
// 				{
// 					attribute: gid.HitPoints,
// 					state: "Dying #4",
// 					enter: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD }],
// 					leave: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.REMOVE }],
// 				},
// 				{
// 					attribute: gid.HitPoints,
// 					state: "Dying #3",
// 					enter: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD }],
// 					leave: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.REMOVE }],
// 				},
// 				{
// 					attribute: gid.HitPoints,
// 					state: "Dying #2",
// 					enter: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD }],
// 					leave: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.REMOVE }],
// 				},
// 				{
// 					attribute: gid.HitPoints,
// 					state: "Dying #1",
// 					enter: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD }],
// 					leave: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.REMOVE }],
// 				},
// 				{
// 					attribute: gid.HitPoints,
// 					state: "Collapse",
// 					enter: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD }],
// 					leave: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.REMOVE }],
// 				},
// 				{
// 					attribute: gid.HitPoints,
// 					state: "Reeling",
// 					enter: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.ADD }],
// 					leave: [{ id: ConditionID.Reeling, action: EFFECT_ACTION.REMOVE }],
// 				},
// 			],
// 			[`${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`]: [
// 				{
// 					id: "st",
// 					type: attribute.Type.Integer,
// 					name: "ST",
// 					full_name: "Strength",
// 					base: "10",
// 					cost_per_point: 10,
// 					cost_adj_percent_per_sm: 10,
// 				},
// 				{
// 					id: "dx",
// 					type: attribute.Type.Integer,
// 					name: "DX",
// 					full_name: "Dexterity",
// 					base: "10",
// 					cost_per_point: 20,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "iq",
// 					type: attribute.Type.Integer,
// 					name: "IQ",
// 					full_name: "Intelligence",
// 					base: "10",
// 					cost_per_point: 20,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "ht",
// 					type: attribute.Type.Integer,
// 					name: "HT",
// 					full_name: "Health",
// 					base: "10",
// 					cost_per_point: 10,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "will",
// 					type: attribute.Type.Integer,
// 					name: "Will",
// 					base: "$iq",
// 					cost_per_point: 5,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "fright_check",
// 					type: attribute.Type.Integer,
// 					name: "Fright Check",
// 					base: "$will",
// 					cost_per_point: 2,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "per",
// 					type: attribute.Type.Integer,
// 					name: "Per",
// 					full_name: "Perception",
// 					base: "$iq",
// 					cost_per_point: 5,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "vision",
// 					type: attribute.Type.Integer,
// 					name: "Vision",
// 					base: "$per",
// 					cost_per_point: 2,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "hearing",
// 					type: attribute.Type.Integer,
// 					name: "Hearing",
// 					base: "$per",
// 					cost_per_point: 2,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "taste_smell",
// 					type: attribute.Type.Integer,
// 					name: "Taste \u0026 Smell",
// 					base: "$per",
// 					cost_per_point: 2,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "touch",
// 					type: attribute.Type.Integer,
// 					name: "Touch",
// 					base: "$per",
// 					cost_per_point: 2,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "basic_speed",
// 					type: attribute.Type.Decimal,
// 					name: "Basic Speed",
// 					base: "($dx+$ht)/4",
// 					cost_per_point: 20,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "basic_move",
// 					type: attribute.Type.Integer,
// 					name: "Basic Move",
// 					base: "floor($basic_speed)",
// 					cost_per_point: 5,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: gid.FatiguePoints,
// 					type: attribute.Type.Pool,
// 					name: "FP",
// 					full_name: "Fatigue Points",
// 					base: "$ht",
// 					cost_per_point: 3,
// 					cost_adj_percent_per_sm: 0,
// 					thresholds: [
// 						{
// 							state: "Unconscious",
// 							expression: "-$fp",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge, ThresholdOp.HalveST],
// 						},
// 						{
// 							state: "Collapse",
// 							explanation:
// 								"Roll vs. Will to do anything besides talk or rest; failure causes unconsciousness\nEach FP you lose below 0 also causes 1 HP of injury\nMove, Dodge and ST are halved (B426)",
// 							expression: "0",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge, ThresholdOp.HalveST],
// 						},
// 						{
// 							state: "Tired",
// 							explanation: "Move, Dodge and ST are halved (B426)",
// 							expression: "round($fp/3)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge, ThresholdOp.HalveST],
// 						},
// 						{
// 							state: "Tiring",
// 							expression: "$fp-1",
// 						},
// 						{
// 							state: "Rested",
// 							expression: "$fp",
// 						},
// 					],
// 				},
// 				{
// 					id: gid.HitPoints,
// 					type: attribute.Type.Pool,
// 					name: "HP",
// 					full_name: "Hit Points",
// 					base: "$st",
// 					cost_per_point: 2,
// 					cost_adj_percent_per_sm: 10,
// 					thresholds: [
// 						{
// 							state: "Dead",
// 							expression: "round(-$hp*5)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Dying #4",
// 							explanation:
// 								"Roll vs. HT to avoid death\nRoll vs. HT-4 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
// 							expression: "round(-$hp*4)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Dying #3",
// 							explanation:
// 								"Roll vs. HT to avoid death\nRoll vs. HT-3 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
// 							expression: "round(-$hp*3)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Dying #2",
// 							explanation:
// 								"Roll vs. HT to avoid death\nRoll vs. HT-2 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
// 							expression: "round(-$hp*2)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Dying #1",
// 							explanation:
// 								"Roll vs. HT to avoid death\nRoll vs. HT-1 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
// 							expression: "-$hp",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Collapse",
// 							explanation:
// 								"Roll vs. HT every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
// 							expression: "round($hp/3)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Reeling",
// 							explanation: "Move and Dodge are halved (B419)",
// 							expression: "round($hp/3)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Wounded",
// 							expression: "$hp-1",
// 						},
// 						{
// 							state: "Healthy",
// 							expression: "$hp",
// 						},
// 					],
// 				},
// 			],
// 		},
// 	}
// }
//
// export const _defaultMookData: DeepPartial<SourceFromSchema<MookSchema>> = {
// 	system: {
// 		attributes: [
// 			{
// 				id: "st",
// 				adj: 0,
// 			},
// 			{
// 				id: "dx",
// 				adj: 0,
// 			},
// 			{
// 				id: "iq",
// 				adj: 0,
// 			},
// 			{
// 				id: "ht",
// 				adj: 0,
// 			},
// 			{
// 				id: "will",
// 				adj: 0,
// 			},
// 			{
// 				id: "fright_check",
// 				adj: 0,
// 			},
// 			{
// 				id: "per",
// 				adj: 0,
// 			},
// 			{
// 				id: "vision",
// 				adj: 0,
// 			},
// 			{
// 				id: "hearing",
// 				adj: 0,
// 			},
// 			{
// 				id: "taste_smell",
// 				adj: 0,
// 			},
// 			{
// 				id: "touch",
// 				adj: 0,
// 			},
// 			{
// 				id: "basic_speed",
// 				adj: 0,
// 			},
// 			{
// 				id: "basic_move",
// 				adj: 0,
// 			},
// 			{
// 				id: "fp",
// 				adj: 0,
// 			},
// 			{
// 				id: "hp",
// 				adj: 0,
// 			},
// 		],
// 		settings: {
// 			attributes: [
// 				{
// 					id: "st",
// 					type: attribute.Type.Integer,
// 					name: "ST",
// 					full_name: "Strength",
// 					base: "10",
// 					cost_per_point: 10,
// 					cost_adj_percent_per_sm: 10,
// 				},
// 				{
// 					id: "dx",
// 					type: attribute.Type.Integer,
// 					name: "DX",
// 					full_name: "Dexterity",
// 					base: "10",
// 					cost_per_point: 20,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "iq",
// 					type: attribute.Type.Integer,
// 					name: "IQ",
// 					full_name: "Intelligence",
// 					base: "10",
// 					cost_per_point: 20,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "ht",
// 					type: attribute.Type.Integer,
// 					name: "HT",
// 					full_name: "Health",
// 					base: "10",
// 					cost_per_point: 10,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "will",
// 					type: attribute.Type.Integer,
// 					name: "Will",
// 					base: "$iq",
// 					cost_per_point: 5,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "fright_check",
// 					type: attribute.Type.Integer,
// 					name: "Fright Check",
// 					base: "$will",
// 					cost_per_point: 2,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "per",
// 					type: attribute.Type.Integer,
// 					name: "Per",
// 					full_name: "Perception",
// 					base: "$iq",
// 					cost_per_point: 5,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "vision",
// 					type: attribute.Type.Integer,
// 					name: "Vision",
// 					base: "$per",
// 					cost_per_point: 2,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "hearing",
// 					type: attribute.Type.Integer,
// 					name: "Hearing",
// 					base: "$per",
// 					cost_per_point: 2,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "taste_smell",
// 					type: attribute.Type.Integer,
// 					name: "Taste \u0026 Smell",
// 					base: "$per",
// 					cost_per_point: 2,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "touch",
// 					type: attribute.Type.Integer,
// 					name: "Touch",
// 					base: "$per",
// 					cost_per_point: 2,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "basic_speed",
// 					type: attribute.Type.Decimal,
// 					name: "Basic Speed",
// 					base: "($dx+$ht)/4",
// 					cost_per_point: 20,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "basic_move",
// 					type: attribute.Type.Integer,
// 					name: "Basic Move",
// 					base: "floor($basic_speed)",
// 					cost_per_point: 5,
// 					cost_adj_percent_per_sm: 0,
// 				},
// 				{
// 					id: "fp",
// 					type: attribute.Type.Pool,
// 					name: "FP",
// 					full_name: "Fatigue Points",
// 					base: "$ht",
// 					cost_per_point: 3,
// 					cost_adj_percent_per_sm: 0,
// 					thresholds: [
// 						{
// 							state: "Unconscious",
// 							expression: "-$fp",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge, ThresholdOp.HalveST],
// 						},
// 						{
// 							state: "Collapse",
// 							explanation:
// 								"Roll vs. Will to do anything besides talk or rest; failure causes unconsciousness\nEach FP you lose below 0 also causes 1 HP of injury\nMove, Dodge and ST are halved (B426)",
// 							expression: "0",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge, ThresholdOp.HalveST],
// 						},
// 						{
// 							state: "Tired",
// 							explanation: "Move, Dodge and ST are halved (B426)",
// 							expression: "round($fp/3)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge, ThresholdOp.HalveST],
// 						},
// 						{
// 							state: "Tiring",
// 							expression: "$fp-1",
// 							ops: [],
// 						},
// 						{
// 							state: "Rested",
// 							expression: "$fp",
// 							ops: [],
// 						},
// 					],
// 				},
// 				{
// 					id: "hp",
// 					type: attribute.Type.Pool,
// 					name: "HP",
// 					full_name: "Hit Points",
// 					base: "$st",
// 					cost_per_point: 2,
// 					cost_adj_percent_per_sm: 10,
// 					thresholds: [
// 						{
// 							state: "Dead",
// 							expression: "round(-$hp*5)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Dying #4",
// 							explanation:
// 								"Roll vs. HT to avoid death\nRoll vs. HT-4 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
// 							expression: "round(-$hp*4)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Dying #3",
// 							explanation:
// 								"Roll vs. HT to avoid death\nRoll vs. HT-3 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
// 							expression: "round(-$hp*3)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Dying #2",
// 							explanation:
// 								"Roll vs. HT to avoid death\nRoll vs. HT-2 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
// 							expression: "round(-$hp*2)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Dying #1",
// 							explanation:
// 								"Roll vs. HT to avoid death\nRoll vs. HT-1 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
// 							expression: "-$hp",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Collapse",
// 							explanation:
// 								"Roll vs. HT every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
// 							expression: "round($hp/3)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Reeling",
// 							explanation: "Move and Dodge are halved (B419)",
// 							expression: "round($hp/3)",
// 							ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
// 						},
// 						{
// 							state: "Wounded",
// 							expression: "$hp-1",
// 							ops: [],
// 						},
// 						{
// 							state: "Healthy",
// 							expression: "$hp",
// 							ops: [],
// 						},
// 					],
// 				},
// 			],
// 			move_types: [],
// 		},
// 	},
// 	damage_progression: progression.Option.BasicSet,
// 	profile: {
// 		name: "Bad Guy",
// 		description: "",
// 		title: "",
// 		height: "",
// 		weight: "",
// 		SM: 0,
// 		portrait: "icons/svg/mystery-man.svg",
// 		userdesc: "",
// 	},
// }
