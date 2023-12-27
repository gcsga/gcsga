import { Attribute, AttributeDefObj, AttributeObj, AttributeType } from "@module/attribute"
import { ActorType, DamageProgression, gid, ItemType, SETTINGS, SYSTEM_NAME } from "@module/data"
import { DiceGURPS } from "@module/dice"
import { damageProgression } from "@util"
import {
	MookData,
	MookEquipment,
	MookMelee,
	MookNote,
	MookProfile,
	MookRanged,
	MookSkill,
	MookSpell,
	MookTrait,
} from "./data"
import { MoveTypeDefObj } from "@module/move_type"
import { CharacterSource, Posture } from "@actor"
import { ManeuverID, MeleeWeaponSource, RangedWeaponSource, SkillGURPS, SkillSource, SpellSource, TraitSource } from "@item"
import { ItemSourceGURPS } from "@module/config"

export class Mook {
	protected variableResolverExclusions: Map<string, boolean> = new Map()

	settings: {
		attributes: AttributeDefObj[]
		damage_progression: DamageProgression
		move_types: MoveTypeDefObj[]
	}

	system: {
		attributes: AttributeObj[]
	}

	attributes: Map<string, Attribute>

	traits: MookTrait[]

	skills: MookSkill[]

	spells: MookSpell[]

	melee: MookMelee[]

	ranged: MookRanged[]

	equipment: MookEquipment[]

	other_equipment: MookEquipment[]

	notes: MookNote[]

	conditions = []

	profile: MookProfile

	thrust!: DiceGURPS

	swing!: DiceGURPS

	text: {
		traits: string,
		skills: string,
		spells: string,
		melee: string,
		ranged: string,
		equipment: string,
		catchall: string
	}

	update(data: any): void {
		Object.assign(this, mergeObject(this, data))
		this.attributes = this.getAttributes()
	}

	constructor(data?: Partial<MookData>) {
		this.settings = data?.settings ?? {
			attributes: game.settings.get(
				SYSTEM_NAME,
				`${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`
			) as AttributeDefObj[],
			damage_progression: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
				.damage_progression,
			move_types: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`) as MoveTypeDefObj[],
		}
		this.system = data?.system ?? {
			attributes: this.newAttributes(this.settings.attributes),
		}
		this.attributes = this.getAttributes()
		this.traits = data?.traits ?? []
		this.skills = data?.skills ?? []
		this.spells = data?.spells ?? []
		this.melee = data?.melee ?? []
		this.ranged = data?.ranged ?? []
		this.equipment = data?.equipment ?? []
		this.other_equipment = data?.other_equipment ?? []
		this.notes = data?.notes ?? []
		this.profile = data?.profile ?? {
			name: "",
			description: "",
			title: "",
			height: "",
			weight: "",
			SM: 0,
			portrait: foundry.CONST.DEFAULT_TOKEN,
			userdesc: ""
		}
		this.text = {
			traits: "",
			skills: "",
			spells: "",
			melee: "",
			ranged: "",
			equipment: "",
			catchall: "",
		}
		if (this.attributes.has(gid.Strength)) {
			this.thrust = damageProgression.thrustFor(this.settings.damage_progression, this.attributes.get("st")!.max)
			this.swing = damageProgression.swingFor(this.settings.damage_progression, this.attributes.get("st")!.max)
		}
	}

	private newAttributes(defs: AttributeDefObj[]): AttributeObj[] {
		const atts: AttributeObj[] = []
		let i = 0
		for (const def of defs) {
			const attr = new Attribute(this, def.id, i)
			if (
				[
					AttributeType.PrimarySeparator,
					AttributeType.SecondarySeparator,
					AttributeType.PoolSeparator,
				].includes(def.type)
			) {
				atts.push({
					attr_id: attr.id,
					adj: attr.adj,
				})
			} else {
				atts.push({
					attr_id: attr.id,
					adj: attr.adj,
				})
			}
			if (attr.damage) atts[i].damage = attr.damage
			i++
		}
		return atts
	}

	getAttributes(att_array = this.system.attributes): Map<string, Attribute> {
		const attributes: Map<string, Attribute> = new Map()
		if (!att_array.length) return attributes
		att_array.forEach((v, k) => {
			attributes.set(v.attr_id, new Attribute(this, v.attr_id, k, v))
		})
		return attributes
	}

	get adjustedSizeModifier(): number {
		return this.profile.SM
	}

	getFlag(..._args: any[]): unknown {
		return null
	}

	attributeBonusFor(..._args: any[]): number {
		return 0
	}

	moveBonusFor(..._args: any[]): number {
		return 0
	}

	costReductionFor(..._args: any[]): number {
		return 0
	}

	resolveVariable(variableName: string): string {
		if (this.variableResolverExclusions?.has(variableName)) {
			console.warn(`Attempt to resolve variable via itself: $${variableName}`)
			return ""
		}
		if (!this.variableResolverExclusions) this.variableResolverExclusions = new Map()
		this.variableResolverExclusions.set(variableName, true)
		if (gid.SizeModifier === variableName) return this.profile.SM.signedString()
		const parts = variableName.split(".") // TODO: check
		let attr: Attribute | undefined = this.attributes.get(parts[0])
		if (!attr) {
			console.warn(`No such variable: $${variableName}`)
			return ""
		}
		let def
		if (attr instanceof Attribute) {
			// Def = this.settings.attributes.find(e => e.id === (attr as Attribute).attr_id)
			def = attr.attribute_def
		}
		if (!def) {
			console.warn(`No such variable definition: $${variableName}`)
			return ""
		}
		this.variableResolverExclusions = new Map()
		return attr?.max.toString()
	}

	isSkillLevelResolutionExcluded(..._args: any[]) {
		return false
	}

	registerSkillLevelResolutionExclusion(..._args: any[]): void {
		// do nothing}
	}

	unregisterSkillLevelResolutionExclusion(..._args: any[]): void {
		// do nothing}
	}

	encumbranceLevel(_forSkills: boolean) {
		return {
			level: 0,
			maximum_carry: 0,
			penalty: 0,
			name: "",
		}
	}

	effectiveST(initialST: number): number {
		return initialST
	}

	private prepareItems(): DeepPartial<ItemSourceGURPS>[] {
		const items: DeepPartial<ItemSourceGURPS>[] = []

		this.traits.forEach(e => { items.push(this.getTraitData(e)) })
		this.skills.forEach(e => { items.push(this.getSkillData(e)) })
		this.spells.forEach(e => { items.push(this.getSpellData(e)) })
		this.melee.forEach(e => { items.push(this.getMeleeData(e)) })
		this.ranged.forEach(e => { items.push(this.getRangedData(e)) })

		return items
	}

	private getTraitData(e: MookTrait): DeepPartial<TraitSource> {
		return {
			name: e.name,
			type: ItemType.Trait,
			system: {
				levels: e.levels,
				cr: e.cr,
				reference: e.reference,
				base_points: e.points,
				name: e.name,
				notes: e.notes
			}

		}
	}

	private getSkillData(e: MookSkill): DeepPartial<SkillSource> {

		const data: DeepPartial<SkillSource> = {
			name: e.name,
			type: ItemType.Skill,
			system: {
				name: e.name,
				specialization: e.specialization,
				tech_level: e.tech_level,
				tech_level_required: e.tech_level !== "",
				difficulty: e.difficulty,
				points: e.points,
				calc: {
					level: e.level
				}
			}
		}
		if (e.points === 0 && e.level !== 0) {
			const skill = new SkillGURPS(data)
			skill.dummyActor = this
			skill.updateLevel()
			while (skill.level.level < e.level) {
				skill.incrementSkillLevel()
				skill.updateLevel()
				console.log(skill.level.level, e.level)
			}
			console.log(skill)
			data.system!.points = skill.points
		}

		return data
	}

	private getSpellData(e: MookSpell): DeepPartial<SpellSource> {
		return {
			name: e.name,
			type: ItemType.Spell,
			system: {
				name: e.name,
				difficulty: e.difficulty,
				points: e.points,
				college: e.college,
				tech_level: e.tech_level,
				tech_level_required: e.tech_level !== "",
			}
		}
	}

	private getMeleeData(e: MookMelee): DeepPartial<MeleeWeaponSource> {
		return {
			name: e.name,
			type: ItemType.MeleeWeapon,
			system: {
				usage: e.name,
				strength: e.strength,
				damage: e.damage,
				reach: e.reach,
				parry: e.parry,
				block: e.block,
				defaults: [{ type: gid.Ten, modifier: e.level - 10 }]
			}
		}
	}

	private getRangedData(e: MookRanged): DeepPartial<RangedWeaponSource> {
		return {
			name: e.name,
			type: ItemType.RangedWeapon,
			system: {
				usage: e.name,
				strength: e.strength,
				damage: e.damage,
				accuracy: e.accuracy,
				range: e.range,
				rate_of_fire: e.rate_of_fire,
				shots: e.shots,
				bulk: e.bulk,
				recoil: e.recoil,
				defaults: [{ type: gid.Ten, modifier: e.level - 10 }]
			}
		}
	}

	async createActor() {
		const actorData: Omit<CharacterSource, "_id" | "token" | "effects" | "data" | "folder" | "sort" | "permission"> = {
			type: ActorType.Character,
			flags: {},
			name: this.profile.name,
			img: this.profile.portrait,
			items: this.prepareItems() as any[],
			system: {
				version: 4,
				import: { name: "", path: "", last_import: "" },
				move: { maneuver: ManeuverID.DoNothing, posture: Posture.Standing, type: gid.Ground },
				created_date: new Date().toISOString(),
				modified_date: new Date().toISOString(),
				settings: {
					...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`),
					// @ts-expect-error overwritten settings field
					resource_trackers: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`),
					// @ts-expect-error overwritten settings field
					move_types: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`),
					...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`),
					...this.settings,
				},
				attributes: this.system.attributes,
				resource_trackers: [],
				move_types: [],
				total_points: 0,
				points_record: [],
				calc: {
					thrust: this.thrust.string,
					swing: this.swing.string,
					basic_lift: "",
					lifting_st_bonus: 0,
					striking_st_bonus: 0,
					throwing_st_bonus: 0,
					dodge: [],
					move: [],
					dodge_bonus: 0,
					parry_bonus: 0,
					block_bonus: 0
				},
				profile: {
					...this.profile,
					player_name: game.user.name ?? "",
					organization: "test",
					age: "",
					religion: "",
					birthday: "",
					eyes: "",
					hair: "",
					skin: "",
					handedness: "",
					gender: "",
					tech_level: ""
				},
				editing: false,
				pools: {},
				type: ActorType.Character,
				id: "",
			}
		}
		const actor = await Actor.create({ type: actorData.type, name: actorData.name, img: actorData.img })
		await actor?.update({
			...actorData, "system.import": { name: "", path: "", last_import: "" }
		})
		return actor
	}

	resolveAttributeCurrent(attr_id: string): number {
		const att = this.attributes?.get(attr_id)?.current
		if (att) return att
		return -Infinity
	}

	skillBonusFor(..._args: any[]): number {
		return 0
	}
}
