import { feature } from "@util/enum/feature.ts"
import { stlimit } from "@util/enum/stlimit.ts"
import { ConditionID, ManeuverID, SYSTEM_NAME, gid } from "@data"
import { LocalizeGURPS } from "@util/localize.ts"
import { ConditionSystemSource } from "./data.ts"
import { DurationType } from "@item/abstract-effect/data.ts"

export function getConditionList(): Record<ConditionID, Partial<ConditionSystemSource>> {
	const ConditionList: Record<ConditionID, Partial<ConditionSystemSource>> = {
		[ConditionID.PostureCrouch]: {
			id: ConditionID.PostureCrouch,
			slug: ConditionID.PostureCrouch,
			modifiers: [
				{ id: LocalizeGURPS.translations.gurps.modifier.cover.crouching_no_cover, modifier: -2 },
				{ id: LocalizeGURPS.translations.gurps.modifier.cover.melee_crouching, modifier: -2 },
				{ id: LocalizeGURPS.translations.gurps.modifier.cover.ranged_crouching, modifier: -2 },
				{ id: LocalizeGURPS.translations.gurps.modifier.cover.hit_ranged_crouching, modifier: -2 },
			],
		},
		[ConditionID.PostureKneel]: {
			id: ConditionID.PostureKneel,
			slug: ConditionID.PostureKneel,
			modifiers: [
				{ id: LocalizeGURPS.translations.gurps.modifier.cover.melee_kneeling, modifier: -2 },
				{ id: LocalizeGURPS.translations.gurps.modifier.cover.defense_kneeling, modifier: -2 },
			],
		},
		[ConditionID.PostureSit]: {
			id: ConditionID.PostureSit,
			slug: ConditionID.PostureSit,
			modifiers: [{ id: LocalizeGURPS.translations.gurps.modifier.cover.ranged_sitting, modifier: -2 }],
		},
		[ConditionID.PostureCrawl]: {
			id: ConditionID.PostureCrawl,
			slug: ConditionID.PostureCrawl,
			modifiers: [
				{ id: LocalizeGURPS.translations.gurps.modifier.cover.melee_crawling, modifier: -4 },
				{ id: LocalizeGURPS.translations.gurps.modifier.cover.defense_crawling, modifier: -3 },
			],
		},
		[ConditionID.PostureProne]: {
			id: ConditionID.PostureProne,
			slug: ConditionID.PostureProne,
			modifiers: [
				{ id: LocalizeGURPS.translations.gurps.modifier.cover.prone_no_cover, modifier: -4 },
				{ id: LocalizeGURPS.translations.gurps.modifier.cover.prone_head_up, modifier: -5 },
				{ id: LocalizeGURPS.translations.gurps.modifier.cover.prone_head_down, modifier: -7 },
			],
		},
		[ConditionID.Reeling]: {
			id: ConditionID.Reeling,
			slug: ConditionID.Reeling,
			reference: "B419",
			features: [
				// {
				// 	type: feature.Type.ThresholdBonus,
				// 	ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge],
				// },
			],
		},
		[ConditionID.Fatigued]: {
			id: ConditionID.Fatigued,
			slug: ConditionID.Fatigued,
			reference: "B426",
			features: [
				// {
				// 	type: feature.Type.ThresholdBonus,
				// 	ops: [ThresholdOp.HalveMove, ThresholdOp.HalveDodge, ThresholdOp.HalveST],
				// },
			],
		},
		[ConditionID.Crippled]: { id: ConditionID.Crippled, slug: ConditionID.Crippled, reference: "B420" },
		[ConditionID.Bleeding]: { id: ConditionID.Bleeding, slug: ConditionID.Bleeding, reference: "B420" },
		[ConditionID.Dead]: {
			id: ConditionID.Dead,
			slug: ConditionID.Dead,
			reference: "B423",
		},
		[ConditionID.Shock]: {
			id: ConditionID.Shock,
			slug: ConditionID.Shock,
			reference: "B419",
			can_level: true,
			levels: {
				current: 0,
				max: 8,
			},
			modifiers: [{ id: "shock test", modifier: -1 }],
			duration: {
				type: DurationType.Rounds,
				rounds: 1,
			},
			features: [
				{
					type: feature.Type.AttributeBonus,
					attribute: gid.Dexterity,
					limitation: stlimit.Option.None,
					effective: true,
					per_level: true,
					amount: -1,
				},
				{
					type: feature.Type.AttributeBonus,
					attribute: gid.Intelligence,
					limitation: stlimit.Option.None,
					effective: true,
					per_level: true,
					amount: -1,
				},
			],
		},
		[ConditionID.Pain]: {
			id: ConditionID.Pain,
			slug: ConditionID.Pain,
			reference: "B428",
			can_level: true,
			levels: {
				current: 0,
				max: 12,
			},
		},
		[ConditionID.Unconscious]: { id: ConditionID.Unconscious, slug: ConditionID.Unconscious },
		[ConditionID.Sleeping]: { id: ConditionID.Sleeping, slug: ConditionID.Sleeping },
		[ConditionID.Comatose]: { id: ConditionID.Comatose, slug: ConditionID.Comatose, reference: "B429" },
		[ConditionID.Stun]: { id: ConditionID.Stun, slug: ConditionID.Stun, reference: "B420" },
		[ConditionID.MentalStun]: { id: ConditionID.MentalStun, slug: ConditionID.MentalStun, reference: "B420" },
		[ConditionID.Poisoned]: { id: ConditionID.Poisoned, slug: ConditionID.Poisoned },
		[ConditionID.Burning]: { id: ConditionID.Burning, slug: ConditionID.Burning, reference: "B434" },
		[ConditionID.Cold]: { id: ConditionID.Cold, slug: ConditionID.Cold, reference: "B430" },
		[ConditionID.Disarmed]: { id: ConditionID.Disarmed, slug: ConditionID.Disarmed },
		[ConditionID.Falling]: { id: ConditionID.Falling, slug: ConditionID.Falling, reference: "B431" },
		[ConditionID.Grappled]: {
			id: ConditionID.Grappled,
			slug: ConditionID.Grappled,
			reference: "B371",
			features: [
				{
					type: feature.Type.AttributeBonus,
					amount: -4,
					attribute: "dx",
					limitation: stlimit.Option.None,
					per_level: false,
				},
			],
		},
		[ConditionID.Restrained]: { id: ConditionID.Restrained, slug: ConditionID.Restrained },
		[ConditionID.Pinned]: { id: ConditionID.Pinned, slug: ConditionID.Pinned },
		[ConditionID.Sprinting]: { id: ConditionID.Sprinting, slug: ConditionID.Sprinting, reference: "B354" },
		[ConditionID.Flying]: { id: ConditionID.Flying, slug: ConditionID.Flying },
		[ConditionID.Stealthy]: { id: ConditionID.Stealthy, slug: ConditionID.Stealthy, reference: "B222" },
		[ConditionID.Waiting]: { id: ConditionID.Waiting, slug: ConditionID.Waiting },
		[ConditionID.Invisible]: { id: ConditionID.Invisible, slug: ConditionID.Invisible },
		[ConditionID.Coughing]: { id: ConditionID.Coughing, slug: ConditionID.Coughing, reference: "B428" },
		[ConditionID.Retching]: { id: ConditionID.Retching, slug: ConditionID.Retching, reference: "B429" },
		[ConditionID.Nausea]: {
			id: ConditionID.Nausea,
			slug: ConditionID.Nausea,
			reference: "B428",
			modifiers: [
				{ id: LocalizeGURPS.translations.gurps.modifier.attribute.all, modifier: -2 },
				{ id: LocalizeGURPS.translations.gurps.modifier.skill.all, modifier: -2 },
				{ id: LocalizeGURPS.translations.gurps.modifier.active_defense.all, modifier: -1 },
			],
		},
		[ConditionID.Agony]: { id: ConditionID.Agony, slug: ConditionID.Agony, reference: "B428" },
		[ConditionID.Seizure]: { id: ConditionID.Seizure, slug: ConditionID.Seizure, reference: "B429" },
		[ConditionID.Blind]: { id: ConditionID.Blind, slug: ConditionID.Blind },
		[ConditionID.Deafened]: { id: ConditionID.Deafened, slug: ConditionID.Deafened },
		[ConditionID.Silenced]: { id: ConditionID.Silenced, slug: ConditionID.Silenced },
		[ConditionID.Choking]: { id: ConditionID.Choking, slug: ConditionID.Choking, reference: "B428" },
		[ConditionID.HeartAttack]: { id: ConditionID.HeartAttack, slug: ConditionID.HeartAttack, reference: "B429" },
		[ConditionID.Euphoric]: { id: ConditionID.Euphoric, slug: ConditionID.Euphoric, reference: "B428" },
		[ConditionID.Hallucinating]: {
			id: ConditionID.Hallucinating,
			slug: ConditionID.Hallucinating,
			reference: "B429",
		},
		[ConditionID.Drunk]: {
			id: ConditionID.Drunk,
			slug: ConditionID.Drunk,
			reference: "B428",
			can_level: true,
			levels: {
				current: 0,
				max: 2,
			},
		},
		[ConditionID.Drowsy]: { id: ConditionID.Drowsy, slug: ConditionID.Drowsy, reference: "B428" },
		[ConditionID.Dazed]: { id: ConditionID.Dazed, slug: ConditionID.Dazed, reference: "B428" },
		[ConditionID.Trigger]: {
			id: ConditionID.Trigger,
			slug: ConditionID.Trigger,
			checks: [],
			consequences: [],
		},
	}

	return ConditionList
}

export const StatusEffectsGURPS: StatusEffect[] = [
	...[...Object.values(ConditionID)].map(e => {
		const effect: StatusEffect = {
			id: e,
			icon: `systems/${SYSTEM_NAME}/assets/status/${e}.webp`,
			label: `gurps.status.${e}`,
		}
		return effect
	}),
	...[...Object.values(ManeuverID)].map(e => {
		const effect: StatusEffect = {
			id: e,
			icon: `systems/${SYSTEM_NAME}/assets/maneuver/${e}.webp`,
			label: `gurps.maneuver.${e}`,
		}
		return effect
	}),
]
