import { RollModifier, SYSTEM_NAME, gid } from "@module/data/misc.ts"
import * as R from "remeda"
import { TokenDocumentGURPS } from "@module/token/document.ts"
import { ActorFlags, ActorFlagsGURPS } from "./base/data.ts"
import { Attribute } from "@sytem/attribute/object.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { TraitGURPS } from "@item/trait/document.ts"
import { TraitContainerGURPS } from "@item/trait_container/document.ts"
import { duplicate, mergeObject, setProperty } from "types/foundry/common/utils/helpers.js"
import { HitLocation, HitLocationTable } from "./character/hit_location.ts"
import { CharacterGURPS } from "./document.ts"
import { EffectGURPS } from "@item/effect/document.ts"
import { ConditionGURPS } from "@item/condition/document.ts"
import {
	BaseWeaponGURPS,
	ConditionID,
	ContainerGURPS,
	EffectID,
	ManeuverID,
	Postures,
	TraitModifierGURPS,
} from "@item/index.ts"
import { ItemGURPS } from "@item/base/document.ts"
import { ItemFlags } from "@item/data.ts"
import { Document } from "types/foundry/common/abstract/module.js"
import { DamagePayload, DamageRoll } from "@module/apps/damage_calculator/damage_chat_message.ts"
import {
	DamageAttacker,
	DamageRollAdapter,
	DamageTarget,
	DamageWeapon,
	HitPointsCalc,
	TargetPool,
	TargetTrait,
	TargetTraitModifier,
} from "@module/apps/damage_calculator/index.ts"
import { ApplyDamageDialog } from "@module/apps/damage_calculator/apply_damage_dlg.ts"
import { ItemSourceGURPS } from "@item/data/index.ts"
import { ActorSourceGURPS } from "./data/index.ts"
import { MoveType } from "@sytem/move_type/object.ts"
import { ActorModificationContextGURPS, ActorType } from "./types.ts"
import { ItemType } from "@item/types.ts"

export interface ActorGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null>
	extends Actor<TParent> {
	noPrepare: boolean
	flags: ActorFlagsGURPS
	type: ActorType
	attributes: Map<string, Attribute>
	moveTypes: Map<string, MoveType>
}

export class ActorGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null> extends Actor<TParent> {
	declare attributes: Map<string, Attribute>
	declare moveTypes: Map<string, MoveType>

	/** Don't allow the user to create in development actor types. */
	static override createDialog<TDocument extends foundry.abstract.Document>(
		this: ConstructorOf<TDocument>,
		data?: Record<string, unknown>,
		context?: {
			parent?: TDocument["parent"]
			pack?: Collection<TDocument> | null
			types?: ActorType[]
		} & Partial<FormApplicationOptions>,
	): Promise<TDocument | null>
	static override async createDialog(
		data: { folder?: string | undefined } = {},
		context: {
			parent?: TokenDocumentGURPS | null
			pack?: Collection<ActorGURPS<null>> | null
			types?: (ActorType | "creature")[]
			[key: string]: unknown
		} = {},
	): Promise<Actor<TokenDocument<Scene | null> | null> | null> {
		const omittedTypes: ActorType[] = []
		omittedTypes.push(ActorType.LegacyEnemy)
		const original = game.system.documentTypes.Actor
		try {
			game.system.documentTypes.Actor = R.difference(original, omittedTypes)

			context.classes = [...((context.classes ?? []) as string[]), "dialog-actor-create"]

			return super.createDialog(data, context)
		} finally {
			game.system.documentTypes.Actor = original
		}
	}

	get strengthOrZero(): number {
		return 0
	}

	get dodgeAttribute(): DeepPartial<Attribute> {
		return {
			id: gid.Dodge as string,
			attribute_def: {
				combinedName: LocalizeGURPS.translations.gurps.attributes.dodge,
			},
			effective: 0,
			current: 0,
		}
	}

	get traits(): Collection<TraitGURPS | TraitContainerGURPS> {
		return new Collection()
	}

	poolAttributes(_includeSeparators?: boolean): Map<string, Attribute> {
		return new Map()
	}

	protected override async _preCreate(
		data: this["_source"],
		options: DocumentModificationContext<TParent>,
		user: User,
	): Promise<void> {
		if (this._source.img === foundry.CONST.DEFAULT_TOKEN)
			this._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${data.type}.svg` as `${string}.svg`
		await super._preCreate(data, options, user)
	}

	protected override async _preUpdate(
		changed: DeepPartial<this["_source"]>,
		options: DocumentModificationContext<TParent>,
		user: foundry.documents.BaseUser,
	): Promise<void> {
		const defaultToken = `systems/${SYSTEM_NAME}/assets/icons/${this.type}.svg`
		if (changed.img && !changed.prototypeToken?.texture?.src) {
			if (!this.prototypeToken.texture.src || this.prototypeToken.texture.src === defaultToken) {
				setProperty(changed, "prototypeToken.texture.src", changed.img)
			} else {
				setProperty(changed, "prototypeToken.texture.src", this.prototypeToken.texture.src)
			}
		}
		super._preUpdate(changed, options, user)
	}

	get hitLocationTable(): HitLocationTable {
		return new HitLocationTable("", "3d", [], this as unknown as CharacterGURPS, "")
	}

	get HitLocations(): HitLocation[] {
		const recurseLocations = function (table: HitLocationTable, locations: HitLocation[] = []): HitLocation[] {
			table.locations.forEach(e => {
				locations.push(e)
				if (e.subTable) locations = recurseLocations(e.subTable, locations)
			})
			return locations
		}

		return recurseLocations(this.hitLocationTable, [])
	}

	// static override createDialog<TDocument extends ActorGURPS>(
	// 	this: ConstructorOf<TDocument>,
	// 	data?: Record<string, unknown>,
	// 	context?: {
	// 		parent?: TDocument["parent"]
	// 		pack?: Collection<TDocument> | null
	// 	} & Partial<FormApplicationOptions>,
	// ): Promise<TDocument | null> {
	// 	super.createDialog()
	// 	const original = game.system.documentTypes.Actor
	// 	game.system.documentTypes.Actor = original.filter(
	// 		(actorType: string) => ![ActorType.LegacyEnemy].includes(actorType as ActorType),
	// 	)
	// 	context ??= {}
	// 	context.classes = [...(context.classes ?? []), "dialog-actor-create"]
	// 	const newActor = super.createDialog(data, context) as Promise<TDocument | null>
	// 	game.system.documentTypes.Actor = original
	// 	return newActor
	// }

	get gEffects(): Collection<EffectGURPS> {
		const effects: Collection<EffectGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof EffectGURPS) effects.set(item.id, item)
		}
		return effects
	}

	get conditions(): Collection<ConditionGURPS> {
		const conditions: Collection<ConditionGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof ConditionGURPS) conditions.set(item.id, item)
		}
		return conditions
	}

	get modifiers(): RollModifier[] {
		const modifiers: RollModifier[] = []
		this.gEffects.forEach(e => {
			modifiers.push(...(e.system.modifiers ?? []))
		})
		return modifiers
	}

	override get temporaryEffects(): TemporaryEffect[] {
		const effects = this.gEffects.map(e => {
			const overlay = e instanceof ConditionGURPS && e.cid === ConditionID.Dead
			const a = new ActiveEffect({ name: e.name, icon: e.img || "" })
			a.flags = { core: { overlay: overlay } }
			return a
		})
		return super.temporaryEffects.concat(effects)
	}

	override get inCombat(): boolean {
		return game.combat?.combatants.some(c => c.actor?.id === this.id) || false
	}

	async createNestedEmbeddedDocuments(
		items: ItemGURPS[],
		options: { id: string | null; other: boolean } = { id: null, other: false },
	): Promise<ItemGURPS[]> {
		const itemData = items.map(e => {
			if ([ItemType.Equipment, ItemType.EquipmentContainer].includes(e.type as ItemType))
				return mergeObject(e.toObject(), {
					[`flags.${SYSTEM_NAME}.${ItemFlags.Container}`]: options.id,
					[`flags.${SYSTEM_NAME}.${ItemFlags.Other}`]: options.other,
				})
			return mergeObject(e.toObject(), { [`flags.${SYSTEM_NAME}.${ItemFlags.Container}`]: options.id })
		})

		const newItems = await this.createEmbeddedDocuments("Item", itemData, {
			render: false,
			temporary: false,
		})

		let totalItems = newItems as ItemGURPS[]
		for (let i = 0; i < items.length; i++) {
			if (items[i] instanceof ContainerGURPS && (items[i] as ContainerGURPS).items.size) {
				const parent = items[i] as ContainerGURPS
				const childItems = await this.createNestedEmbeddedDocuments(parent.items.contents as ItemGURPS[], {
					id: newItems[i].id,
					other: options.other,
				})
				totalItems = totalItems.concat(childItems)
			}
		}
		return totalItems
	}

	override createEmbeddedDocuments(
		embeddedName: string,
		data: Record<string, unknown>[],
		context: ActorModificationContextGURPS<this>,
	): Promise<Document[]> {
		if (embeddedName === "Item")
			data = data.filter(
				(e: DeepPartial<ItemSourceGURPS>) =>
					e.flags?.[SYSTEM_NAME]?.[ItemFlags.Container] !== this.id ||
					CONFIG.GURPS.Actor.allowedContents[this.type].includes(e.type),
			)
		return super.createEmbeddedDocuments(embeddedName, data, context)
	}

	override updateEmbeddedDocuments(
		embeddedName: string,
		updateData: EmbeddedDocumentUpdateData[],
		context?: DocumentUpdateContext<this>,
	): Promise<Document[]> {
		return super.updateEmbeddedDocuments(embeddedName, updateData, context)
	}

	override deleteEmbeddedDocuments(
		embeddedName: string,
		dataId: string[],
		context?: DocumentModificationContext<this>,
	): Promise<Document<this>[]> {
		if (embeddedName !== "Item") return super.deleteEmbeddedDocuments(embeddedName, dataId, context)

		const newIds = dataId
		dataId.forEach(id => {
			const item = this.items.get(id)
			if (item instanceof ContainerGURPS)
				for (const i of item.deepItems) {
					if (!newIds.includes(i.id!)) newIds.push(i.id!)
				}
		})
		return super.deleteEmbeddedDocuments(embeddedName, newIds, context)
	}

	get sizeMod(): number {
		return 0
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData()
		setProperty(this.flags, `${SYSTEM_NAME}.${ActorFlags.SelfModifiers}`, [])
		setProperty(this.flags, `${SYSTEM_NAME}.${ActorFlags.TargetModifiers}`, [])

		const sizemod = this.sizeMod
		if (sizemod !== 0) {
			this.flags[SYSTEM_NAME][ActorFlags.TargetModifiers].push({
				name: "for Size Modifier",
				modifier: sizemod,
				tags: [],
			})
		}
	}

	handleDamageDrop(payload: DamagePayload): void {
		let attacker = undefined
		if (payload.attacker) {
			const actor = game.actors?.get(payload.attacker) as ActorGURPS | undefined
			if (actor) {
				attacker = new DamageAttackerAdapter(actor)
			}
		}

		let weapon = undefined
		if (payload.uuid) {
			const temp = fromUuidSync(payload.uuid) as BaseWeaponGURPS
			weapon = new DamageWeaponAdapter(temp)
		}

		const roll: DamageRollAdapter = new DamageRollAdapter(payload, attacker, weapon)
		const target: DamageTarget = new DamageTargetActor(this)
		ApplyDamageDialog.create(roll as unknown as DamageRoll, target).then(dialog => dialog.render(true))
	}

	createDamageTargetAdapter(): DamageTarget {
		return new DamageTargetActor(this)
	}

	hasCondition(id: ConditionID | ConditionID[]): boolean {
		if (!Array.isArray(id)) id = [id]
		return this.conditions.some(e => id.includes(e.cid as ConditionID))
	}

	async addConditions(ids: ConditionID[]): Promise<ConditionGURPS[] | null> {
		ids = ids.filter(id => !this.hasCondition(id))
		return this.createEmbeddedDocuments(
			"Item",
			ids.map(id => duplicate(ConditionGURPS.getData(id))),
			{},
		) as Promise<ConditionGURPS[] | null>
	}

	async removeConditions(ids: ConditionID[]): Promise<Document<this>[]> {
		const items: string[] = this.conditions.filter(e => ids.includes(e.cid as ConditionID)).map(e => e.id)
		return this.deleteEmbeddedDocuments("Item", items)
	}

	async increaseCondition(id: EffectID): Promise<ConditionGURPS | null> {
		if (Object.values(ManeuverID).includes(id as ManeuverID)) return this.changeManeuver(id as ManeuverID)
		const existing = this.conditions.find(e => e.cid === id)
		if (existing) {
			if (existing.canLevel) {
				const newLevel = existing.level + 1
				if (newLevel <= existing.maxLevel) {
					await existing.update({ "system.levels.current": newLevel })
				}
				return existing
			} else {
				await existing.delete()
				return null
			}
		}
		const newCondition = duplicate(ConditionGURPS.getData(id))
		if (newCondition.system?.can_level) newCondition.system.levels!.current += 1
		const items = (await this.createEmbeddedDocuments("Item", [newCondition], {})) as ConditionGURPS[]
		return items[0]
	}

	async decreaseCondition(id: EffectID, { forceRemove } = { forceRemove: false }): Promise<void> {
		const condition = this.conditions.find(e => e.cid === id)
		if (!condition) return

		const value = condition.canLevel ? Math.max(condition.level - 1, 0) : null
		if (value && !forceRemove) {
			await condition.update({ "system.levels.current": value })
		} else {
			await condition.delete()
		}
	}

	async changeManeuver(id: ManeuverID | "none"): Promise<ConditionGURPS | null> {
		const existing = this.conditions.find(e => e.cid === id)
		if (existing) return null
		if (id === "none") return this.resetManeuvers()
		if ([ManeuverID.BLANK_1, ManeuverID.BLANK_2].includes(id as ManeuverID)) return null
		const maneuvers = this.conditions.filter(e => Object.values(ManeuverID).includes(e.cid as ManeuverID))
		const newCondition = duplicate(ConditionGURPS.getData(id))
		if (maneuvers.length) {
			const items = (await this.updateEmbeddedDocuments("Item", [
				{ _id: maneuvers[0]._id, ...newCondition },
			])) as unknown as ConditionGURPS[]
			return items[0]
		}
		const items = (await this.createEmbeddedDocuments("Item", [newCondition], {})) as ConditionGURPS[]
		return items[0]
	}

	async resetManeuvers(): Promise<null> {
		const maneuvers = this.conditions.filter(e => Object.values(ManeuverID).includes(e.cid as ManeuverID))
		await this.deleteEmbeddedDocuments(
			"Item",
			maneuvers.map(e => e.id!),
		)
		return null
	}

	async changePosture(id: ConditionID | "standing"): Promise<ConditionGURPS | null> {
		const existing = this.conditions.find(e => e.cid === id)
		if (existing) return null
		if (id === "standing") return this.resetPosture()
		const postures = this.conditions.filter(e => Postures.includes(e.cid as ConditionID))
		const newCondition = duplicate(ConditionGURPS.getData(id))
		if (postures.length) {
			const items = this.updateEmbeddedDocuments("Item", [
				{ _id: postures[0]._id, ...newCondition },
			]) as unknown as ConditionGURPS[]
			return items[0]
		}
		const items = (await this.createEmbeddedDocuments("Item", [newCondition], {})) as ConditionGURPS[]
		return items[0]
	}

	async resetPosture(): Promise<null> {
		const maneuvers = this.conditions.filter(e => Object.values(Postures).includes(e.cid as ConditionID))
		await this.deleteEmbeddedDocuments(
			"Item",
			maneuvers.map(e => e.id!),
		)
		return null
	}

	embeddedEval(_s: string): string {
		return ""
	}
}

/**
 * Adapt a BaseActorGURPS to the DamageTarget interface expected by the Damage Calculator.
 */
class DamageTargetActor implements DamageTarget {
	static DamageReduction = "Damage Reduction"

	private actor: ActorGURPS

	constructor(actor: ActorGURPS) {
		this.actor = actor
	}

	get tokenId(): string {
		let result = ""
		if (game.scenes?.active?.tokens) {
			result = game.scenes.active.tokens.find(it => it.actorId === this.actor.id)?.id ?? ""
		}
		return result as string
	}

	incrementDamage(delta: number, damagePoolId: string): void {
		const attributes = [...(this.actor as CharacterGURPS).system.attributes]
		const index = attributes.findIndex(it => it.attr_id === damagePoolId)
		attributes[index].damage = attributes[index].damage! + delta
		this.actor.update({
			"system.attributes": attributes,
		})
	}

	get name(): string {
		return this.actor.name ?? ""
	}

	get ST(): number {
		return this.getSyntheticAttribute("st")?.calc.value ?? 0
	}

	get hitPoints(): HitPointsCalc {
		return this.getSyntheticAttribute("hp")!.calc
	}

	get hitLocationTable(): HitLocationTable {
		return this.actor.hitLocationTable
	}

	/**
	 * This is my sneaky way to make dynamic and static actor attributes look the same. Most of my logic uses the calc
	 * property, but I don't want to have to add that to all the static attributes. So, if the attribute doesn't have
	 * a calc property, I'll add one. This is a bit of a hack, but it works.
	 * @param name
	 * @returns an object with a calc property containing the current and max values.
	 */
	private getSyntheticAttribute(
		name: string,
	): (Attribute & { calc: { value: number; current: number } }) | undefined {
		const attr = this.actor.attributes.get(name) as Attribute & { calc: { value: number; current: number } }
		if (attr && !attr?.calc) {
			attr.calc = { value: attr?.max, current: attr?.current }
		}
		return attr
	}

	/**
	 * @returns the FIRST trait we find with the given name.
	 *
	 * This is where we would add special handling to look for traits under different names.
	 *  Actor
	 *  .traits.contents.find(it => it.name === 'Damage Resistance')
	 *	 .modifiers.contents.filter(it => it.enabled === true).find(it => it.name === 'Hardened')
	 * @param name
	 */
	getTrait(name: string): TargetTrait | undefined {
		if (this.actor instanceof ActorGURPS) {
			const traits = this.actor.traits.filter((it: Item) => it instanceof TraitGURPS) as TraitGURPS[]
			const found = traits.find((it: TraitGURPS) => it.name === name)
			return found ? new TraitAdapter(found as TraitGURPS) : undefined
		}
		return undefined
	}

	/**
	 *
	 * @param name
	 * @returns all traits with the given name.
	 */
	getTraits(name: string): TargetTrait[] {
		if (this.actor instanceof ActorGURPS) {
			const traits = this.actor.traits.contents.filter((it: Item) => it instanceof TraitGURPS) as TraitGURPS[]
			return traits.filter((it: TraitGURPS) => it.name === name).map((it: TraitGURPS) => new TraitAdapter(it))
		}
		return []
	}

	hasTrait(name: string): boolean {
		return !!this.getTrait(name)
	}

	private get isUnliving(): boolean {
		// Try "Injury Tolerance (Unliving)" and "Unliving"
		if (this.hasTrait("Unliving")) return true
		if (!this.hasTrait("Injury Tolerance")) return false
		const trait = this.getTrait("Injury Tolerance")
		return !!trait?.getModifier("Unliving")
	}

	private get isHomogenous(): boolean {
		if (this.hasTrait("Homogenous")) return true
		if (!this.hasTrait("Injury Tolerance")) return false
		const trait = this.getTrait("Injury Tolerance")
		return !!trait?.getModifier("Homogenous")
	}

	private get isDiffuse(): boolean {
		if (this.hasTrait("Diffuse")) return true
		if (!this.hasTrait("Injury Tolerance")) return false
		const trait = this.getTrait("Injury Tolerance")
		return !!trait?.getModifier("Diffuse")
	}

	get injuryTolerance(): "None" | "Unliving" | "Homogenous" | "Diffuse" {
		if (this.isDiffuse) return "Diffuse"
		if (this.isHomogenous) return "Homogenous"
		if (this.isUnliving) return "Unliving"
		return "None"
	}

	get pools(): TargetPool[] {
		return [...this.actor.poolAttributes().keys()]
			.map(key => this.actor.attributes.get(key)?.attribute_def)
			.map(def => <TargetPool>{ id: def?.id, name: def?.name, fullName: def?.resolveFullName })
	}
}

/**
 * Adapt a TraitGURPS to the TargetTrait interface expected by the Damage Calculator.
 */
class TraitAdapter implements TargetTrait {
	private trait: TraitGURPS

	// Actor
	//  .traits.contents.find(it => it.name === 'Damage Resistance')
	//  .modifiers.contents.filter(it => it.enabled === true).find(it => it.name === 'Hardened')

	getModifier(name: string): TraitModifierAdapter | undefined {
		return this.modifiers?.find(it => it.name === name)
	}

	get levels() {
		return this.trait.levels
	}

	get name() {
		return this.trait.name
	}

	get modifiers(): TraitModifierAdapter[] {
		return this.trait.modifiers.contents
			.filter(it => it instanceof TraitModifierGURPS)
			.filter(it => it.enabled === true)
			.map(it => new TraitModifierAdapter(it as TraitModifierGURPS))
	}

	constructor(trait: TraitGURPS) {
		this.trait = trait
	}
}

/**
 * Adapt the TraitModifierGURPS to the interface expected by Damage calculator.
 */
class TraitModifierAdapter implements TargetTraitModifier {
	private modifier: TraitModifierGURPS

	get levels() {
		return this.modifier.levels
	}

	get name(): string {
		return this.modifier.name!
	}

	constructor(modifier: TraitModifierGURPS) {
		this.modifier = modifier
	}
}

class DamageAttackerAdapter implements DamageAttacker {
	private actor: ActorGURPS

	constructor(actor: ActorGURPS) {
		this.actor = actor
	}

	get tokenId(): string {
		let result = ""
		if (game.scenes?.active?.tokens) {
			result = game.scenes.active.tokens.find(it => it.actorId === this.actor.id)?.id ?? ""
		}
		return result as string
	}

	get name(): string | null {
		return this.actor.name
	}
}

class DamageWeaponAdapter implements DamageWeapon {
	base: BaseWeaponGURPS | undefined

	constructor(base: BaseWeaponGURPS) {
		this.base = base
	}

	get name(): string {
		return `${this.base?.container?.name} (${this.base?.name})`
	}

	get damageDice(): string {
		return this.base?.fastResolvedDamage ?? ""
	}
}

export const ActorProxyGURPS = new Proxy(ActorGURPS, {
	construct(
		_target,
		args: [source: ActorSourceGURPS, context: DocumentModificationContext<TokenDocumentGURPS | null>],
	) {
		const ActorClass = CONFIG.GURPS.Actor.documentClasses[args[0]?.type as ActorType] ?? ActorGURPS
		return new ActorClass(...args)
	},
})
