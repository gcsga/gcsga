import { ConditionID, EFFECT_ACTION, SETTINGS, SYSTEM_NAME, gid } from "@data"
import { MoveTypeOverrideConditionType, ThresholdOp } from "@system"
import { attribute } from "@util/enum/attribute.ts"

export const defaultSettings = {
	[SYSTEM_NAME]: {
		[`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`]: [],
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
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "iq",
				type: attribute.Type.Integer,
				name: "IQ",
				full_name: "Intelligence",
				base: "10",
				cost_per_point: 20,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "ht",
				type: attribute.Type.Integer,
				name: "HT",
				full_name: "Health",
				base: "10",
				cost_per_point: 10,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "will",
				type: attribute.Type.Integer,
				name: "Will",
				base: "$iq",
				cost_per_point: 5,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "fright_check",
				type: attribute.Type.Integer,
				name: "Fright Check",
				base: "$will",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "per",
				type: attribute.Type.Integer,
				name: "Per",
				full_name: "Perception",
				base: "$iq",
				cost_per_point: 5,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "vision",
				type: attribute.Type.Integer,
				name: "Vision",
				base: "$per",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "hearing",
				type: attribute.Type.Integer,
				name: "Hearing",
				base: "$per",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "taste_smell",
				type: attribute.Type.Integer,
				name: "Taste \u0026 Smell",
				base: "$per",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "touch",
				type: attribute.Type.Integer,
				name: "Touch",
				base: "$per",
				cost_per_point: 2,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "basic_speed",
				type: attribute.Type.Decimal,
				name: "Basic Speed",
				base: "($dx+$ht)/4",
				cost_per_point: 20,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: "basic_move",
				type: attribute.Type.Integer,
				name: "Basic Move",
				base: "floor($basic_speed)",
				cost_per_point: 5,
				cost_adj_percent_per_sm: 0,
			},
			{
				id: gid.FatiguePoints,
				type: attribute.Type.Pool,
				name: "FP",
				full_name: "Fatigue Points",
				base: "$ht",
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
				base: "$st",
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
		[`${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`]: [
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
		],
		[`${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`]: [
			{
				id: "eye",
				choice_name: "Eyes",
				table_name: "Eyes",
				slots: 0,
				hit_penalty: -9,
				dr_bonus: 0,
				description:
					"An attack that misses by 1 hits the torso instead. Only impaling (imp), piercing (pi-, pi, pi+, pi++), and tight-beam burning (burn) attacks can target the eye – and only from the front or sides. Injury over HP÷10 blinds the eye. Otherwise, treat as skull, but without the extra DR!",
				calc: {
					roll_range: "-",
					dr: {
						all: 0,
					},
				},
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
				calc: {
					roll_range: "3-4",
					dr: {
						all: 2,
					},
				},
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
				calc: {
					roll_range: "5",
					dr: {
						all: 0,
					},
				},
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
				calc: {
					roll_range: "6-7",
					dr: {
						all: 0,
					},
				},
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
				calc: {
					roll_range: "8",
					dr: {
						all: 0,
					},
				},
			},
			{
				id: "torso",
				choice_name: "Torso",
				table_name: "Torso",
				slots: 2,
				hit_penalty: 0,
				dr_bonus: 0,
				description: "",
				calc: {
					roll_range: "9-10",
					dr: {
						all: 0,
					},
				},
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
				calc: {
					roll_range: "11",
					dr: {
						all: 0,
					},
				},
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
				calc: {
					roll_range: "12",
					dr: {
						all: 0,
					},
				},
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
				calc: {
					roll_range: "13-14",
					dr: {
						all: 0,
					},
				},
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
				calc: {
					roll_range: "15",
					dr: {
						all: 0,
					},
				},
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
				calc: {
					roll_range: "16",
					dr: {
						all: 0,
					},
				},
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
				calc: {
					roll_range: "17-18",
					dr: {
						all: 0,
					},
				},
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
				calc: {
					roll_range: "-",
					dr: {
						all: 0,
					},
				},
			},
		],
	},
}
