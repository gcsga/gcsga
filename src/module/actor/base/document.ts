import { TokenDocumentGURPS } from "@scene/token-document/document.ts"
import { ActorFlagsGURPS, ActorSystemData, PrototypeTokenGURPS } from "./data.ts"
import { AbstractContainerGURPS, EquipmentContainerGURPS, EquipmentGURPS, ItemGURPS } from "@item"
import type { ActorSheetGURPS } from "./sheet.ts"
import type { ActorSourceGURPS } from "@actor/data.ts"
import type { ActiveEffectGURPS } from "@module/active-effect/index.ts"
import { EquipmentContainerSource, EquipmentSource, ItemSourceGURPS } from "@item/data/index.ts"
import { itemIsOfType } from "@item/helpers.ts"
import { ErrorGURPS, Evaluator, LastActor, LocalizeGURPS, TooltipGURPS, attribute, objectHasKey, stlimit } from "@util"
import { ActorFlags, ActorType, ItemType, SYSTEM_NAME, gid } from "@module/data/constants.ts"
import {
	AbstractAttribute,
	AttributeBonus,
	AttributeDef,
	BodyGURPS,
	CostReduction,
	DRBonus,
	Feature,
	FeatureMap,
	SkillBonus,
	SkillPointBonus,
	SpellBonus,
	SpellPointBonus,
	WeaponBonus,
} from "@system"
import { ActorInstances, EmbeddedItemInstances } from "@actor/types.ts"
import { ActorItemCollectionMap } from "./item-collection-map.ts"
import { SheetSettings, sheetSettingsFor } from "@module/data/sheet-settings.ts"
import { DamagePayload } from "@module/apps/damage-calculator/damage-chat-message.ts"
import { DamageAttackerAdapter, DamageTargetActor, DamageWeaponAdapter } from "@actor/helpers.ts"
import { DamageRollAdapter, DamageTarget } from "@module/apps/damage-calculator/index.ts"
import { ApplyDamageDialog } from "@module/apps/damage-calculator/apply-damage-dialog.ts"
import { getCRFeatures } from "@item/trait/data.ts"

/**
 * Extend the base Actor class to implement additional logic specialized for GURPS.
 * @category Actor
 */
class ActorGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null> extends Actor<TParent> {
	/** Has this document completed `DataModel` initialization? */
	declare initialized: boolean
	// Cached variable values for fast access
	declare cachedVariables: Map<string, string>
	/** Hit location table */
	declare hitLocationTable: BodyGURPS<this>

	// Exclusions to prevent circular references in variable resolution
	declare variableResolverExclusions: Set<string>

	// Set of keys containing
	declare variableResolverSets: Set<string>

	// Map of features added by items
	declare features: FeatureMap

	// Map of item collections
	declare itemCollections: ActorItemCollectionMap<this>

	get importData(): { name: string; path: string; last_import: string } {
		return this.flags[SYSTEM_NAME][ActorFlags.Import]
	}

	get settings(): SheetSettings {
		return sheetSettingsFor(this)
	}

	get techLevel(): string {
		return "0"
	}

	/** The recorded schema version of this actor, updated after each data migration */
	get schemaVersion(): number | null {
		return Number(this.system._migration?.version) || null
	}

	/** A cached copy of `Actor#itemTypes`, lazily regenerated every data preparation cycle */
	private declare _itemTypes: EmbeddedItemInstances<this> | null

	/** Cache the return data before passing it to the caller */
	override get itemTypes(): EmbeddedItemInstances<this> {
		return (this._itemTypes ??= super.itemTypes as EmbeddedItemInstances<this>)
	}

	get allowedItemTypes(): ItemType[] {
		return CONFIG.GURPS.Actor.allowedContents[this.type]
	}

	// Size Modifier
	get baseSizeModifier(): number {
		return 0
	}

	get adjustedSizeModifier(): number {
		return this.baseSizeModifier + this.sizeModifierBonus
	}

	get sizeModifierBonus(): number {
		if (this.isOfType(ActorType.Character)) return this.attributeBonusFor(gid.SizeModifier, stlimit.Option.None)
		return 0
	}

	protected override async _preCreate(
		data: this["_source"],
		options: DocumentModificationContext<TParent>,
		user: User<Actor<null>>,
	): Promise<boolean | void> {
		super._preCreate(data, options, user)
		this.updateSource({ name: LocalizeGURPS.translations.TYPES.Actor[data.type] })
	}

	protected override _onCreate(
		data: this["_source"],
		options: DocumentModificationContext<TParent>,
		userId: string,
	): void {
		super._onCreate(data, options, userId)
		LastActor.set(this)
	}

	static override getDefaultArtwork(actorData: foundry.documents.ActorSource): {
		img: ImageFilePath
		texture: {
			src: ImageFilePath | VideoFilePath
		}
	} {
		const img: ImageFilePath = `systems/${SYSTEM_NAME}/icons/default-icons/${actorData.type}.svg`
		return { img, texture: { src: img } }
	}

	/** A means of checking this actor's type without risk of circular import references */
	isOfType<T extends ActorType>(...types: T[]): this is ActorInstances<TParent>[T]
	isOfType(...types: string[]): boolean {
		return types.some(t => this.type === t)
	}

	/** Checks if the item can be added to this actor by checking the valid item types. */
	checkItemValidity(source: PreCreate<ItemSourceGURPS>): boolean {
		if (!itemIsOfType(source, ...this.allowedItemTypes)) {
			ui.notifications.error(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.error.cannot_add_type, {
					type: LocalizeGURPS.translations.TYPES.Item[source.type],
				}),
			)

			return false
		}

		return true
	}

	embeddedEval(s: string): string {
		const ev = new Evaluator({ resolver: this })
		const exp = s.slice(2, s.length - 2)
		const result = ev.evaluate(exp)
		return `${result}`
	}

	getVariableSets(): Map<string, AbstractAttribute>[] {
		const sets: Map<string, AbstractAttribute>[] = []
		for (const key of this.variableResolverSets) {
			if (!objectHasKey(this, key)) {
				console.error(`No such variable resolver set: ${key}`)
				continue
			}
			const map = this[key]
			if (!(map instanceof Map)) {
				console.error(`Variable resolver set is not a Map: ${key}`)
				continue
			}
			if (map.size === 0) {
				// Not a real error as empty sets are valid
				// console.error(`Variable resolver set is empty: ${key}`)
				continue
			}
			if (typeof map.keys().next().value !== "string") {
				console.error(`Variable resolver key is not a string: ${key}`)
				continue
			}
			if (!(map.values().next().value instanceof AbstractAttribute)) {
				console.error(`Variable resolver object type is not a valid Attribute type: ${key}`)
				continue
			}
			sets.push(map)
		}
		return sets
	}

	resolveAttributeCurrent(_: string): number {
		ErrorGURPS(`${this.name} if of type "${this.type}" and cannot resolve attributes`)
		return 0
	}

	resolveAttributeEffective(_: string): number {
		ErrorGURPS(`${this.name} if of type "${this.type}" and cannot resolve attributes`)
		return 0
	}

	resolveAttributeMax(_id: string): number {
		ErrorGURPS(`${this.name} if of type "${this.type}" and cannot resolve attributes`)
		return 0
	}

	resolveAttributeName(_id: string): string {
		ErrorGURPS(`${this.name} if of type "${this.type}" and cannot resolve attributes`)
		return ""
	}

	resolveVariable(variableName: string): string {
		if (this.variableResolverExclusions?.has(variableName)) {
			console.error(`Attempt to resolver variable via itself: $${variableName}`)
			return ""
		}
		this.cachedVariables ??= new Map()
		const cached = this.cachedVariables.get(variableName)
		if (cached) return cached
		this.variableResolverExclusions ??= new Set()

		this.variableResolverExclusions.add(variableName)
		try {
			if (variableName === gid.SizeModifier) {
				const result = `${this.adjustedSizeModifier}`
				this.cachedVariables.set(variableName, result)
				return result
			}

			const parts = variableName.split(".", 2)
			let attr: AbstractAttribute | null = null
			const sets = this.getVariableSets()
			for (const set of sets) {
				if (set.has(variableName)) {
					attr = set.get(variableName)!
				}
			}
			if (!attr) {
				ErrorGURPS(`No such variable $${variableName}`)
				return ""
			}
			const def = attr.definition
			if (!def) {
				ErrorGURPS(`No such variable definition $${variableName}`)
				return ""
			}
			if (
				def instanceof AttributeDef &&
				def.type === attribute.Type.Pool &&
				parts.length > 1 &&
				parts[1] === "current"
			) {
				const result = attr.current.toString()
				this.cachedVariables.set(variableName, result)
				return result
			}
			const result = attr.max.toString()
			this.cachedVariables.set(variableName, result)
			return result
		} finally {
			this.variableResolverExclusions.delete(variableName)
		}
	}

	protected override _initialize(options?: Record<string, unknown>): void {
		this.initialized = false

		this._itemTypes = null
		return super._initialize(options)
	}

	/**
	 * Never prepare data except as part of `DataModel` initialization. If embedded, don't prepare data if the parent is
	 * not yet initialized. See https://github.com/foundryvtt/foundryvtt/issues/7987
	 */
	override prepareData(): void {
		if (this.initialized) return
		if (this.parent && !this.parent.initialized) return
		this.initialized = true
		super.prepareData()
	}

	override prepareBaseData(): void {
		super.prepareBaseData()

		this.variableResolverSets = new Set()
		this.itemCollections = new ActorItemCollectionMap<this>(this.items)

		this.features = {
			attributeBonuses: [],
			costReductions: [],
			drBonuses: [],
			skillBonuses: [],
			skillPointBonuses: [],
			spellBonuses: [],
			spellPointBonuses: [],
			weaponBonuses: [],
			moveBonuses: [],
		}
	}

	override prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments()

		// this.itemCollections = new ItemCollectionMap<this>(this.items)

		this.prepareFeatures()

		this.updateSkills()
		this.updateSpells()

		for (let i = 0; i < 5; i++) {
			this.preparePrereqs()
			const skillsChanged = this.updateSkills()
			const spellsChanged = this.updateSpells()
			if (!skillsChanged && !spellsChanged) break
		}

		this.prepareDataFromItems()
	}

	updateSkills(): boolean {
		let changed = false
		for (const item of this.itemCollections.skills) {
			if (item.isOfType(ItemType.SkillContainer)) continue
			if (item.updateLevel()) changed = true
		}
		return changed
	}

	updateSpells(): boolean {
		let changed = false
		for (const item of this.itemCollections.spells) {
			if (item.isOfType(ItemType.SpellContainer)) continue
			if (item.updateLevel()) changed = true
		}
		return changed
	}

	prepareFeatures(): void {
		for (const trait of this.itemCollections.traits) {
			if (!trait.enabled) continue
			let levels = 0
			if (trait.isOfType(ItemType.Trait)) {
				levels = Math.max(trait.levels, 0)
				for (const feature of trait.features) {
					this.prepareFeature(trait, null, feature, levels)
				}
				const crFeatures = getCRFeatures()
				if (crFeatures.has(trait.CRAdj))
					for (const f of crFeatures?.get(trait.CRAdj) || []) {
						this.prepareFeature(trait, null, f, levels)
					}
				for (const mod of trait.deepModifiers) {
					if (mod.enabled === false) continue
					for (const f of mod.features) {
						this.prepareFeature(trait, null, f, mod.levels)
					}
				}
			}
		}
		for (const skill of this.itemCollections.skills) {
			if (skill.isOfType(ItemType.SkillContainer)) continue
			for (const f of skill.features) {
				this.prepareFeature(skill, null, f, 0)
			}
		}
		for (const equipment of this.itemCollections.carriedEquipment) {
			if (!equipment.equipped) continue
			for (const feature of equipment.features) {
				this.prepareFeature(equipment, null, feature, 0)
			}
			for (const mod of equipment.deepModifiers) {
				if (mod.enabled === false) continue
				for (const f of mod.features) {
					this.prepareFeature(mod, null, f, 0)
				}
			}
		}
	}

	prepareFeature(owner: ItemGURPS, subOwner: ItemGURPS | null, feature: Feature, levels: number): number {
		feature.owner = owner
		feature.subOwner = subOwner
		feature.setLevel(levels)

		switch (true) {
			case feature instanceof AttributeBonus:
				return this.features.attributeBonuses.push(feature)
			case feature instanceof CostReduction:
				return this.features.costReductions.push(feature)
			case feature instanceof DRBonus:
				if (feature.location === "") {
					if (itemIsOfType(owner, ItemType.Equipment, ItemType.EquipmentContainer)) {
						const allLocations: Map<string, boolean> = new Map()
						const locationsMatched: Map<string, boolean> = new Map()
						for (const f2 of owner.features) {
							if (f2 instanceof DRBonus && f2.location !== "") {
								allLocations.set(f2.location, true)
								if (f2.specialization === feature.specialization) {
									locationsMatched.set(f2.location, true)
									const additionalDRBonus = new DRBonus()
									additionalDRBonus.location = f2.location
									additionalDRBonus.specialization = feature.specialization
									additionalDRBonus.leveledAmount = feature.leveledAmount
									additionalDRBonus.owner = owner
									additionalDRBonus.subOwner = subOwner
									additionalDRBonus.setLevel(levels)
									this.features.drBonuses.push(additionalDRBonus)
								}
							}
						}
						return 0
					}
					return 0
				} else return this.features.drBonuses.push(feature)
			case feature instanceof SkillBonus:
				return this.features.skillBonuses.push(feature)
			case feature instanceof SkillPointBonus:
				return this.features.skillPointBonuses.push(feature)
			case feature instanceof SpellBonus:
				return this.features.spellBonuses.push(feature)
			case feature instanceof SpellPointBonus:
				return this.features.spellPointBonuses.push(feature)
			case feature instanceof WeaponBonus:
				return this.features.weaponBonuses.push(feature)
			default:
				return 0
		}
	}

	preparePrereqs(): void {
		const notMet = LocalizeGURPS.translations.gurps.prereq.not_met
		for (const trait of this.itemCollections.traits) {
			if (itemIsOfType(trait, ItemType.TraitContainer)) continue
			if (trait.prereqsEmpty) continue
			trait.unsatisfiedReason = ""
			const tooltip = new TooltipGURPS()
			if (!trait.prereqs.satisfied(this, trait, tooltip)) {
				trait.unsatisfiedReason = notMet + tooltip.toString()
			}
		}
	}

	/** Prepare data among owned items as well as actor-data preparation performed by items */
	protected prepareDataFromItems(): void {
		// for (const condition of this.itemTypes.condition) {
		// 	this.conditions.set(condition.id, condition)
		// }

		for (const item of this.items) {
			item.prepareSiblingData?.()
		}
	}

	// Handle damage dropping onto the character sheet
	handleDamageDrop(payload: DamagePayload): void {
		if (payload.index === -1) {
			ui.notifications?.warn("Multiple damage rolls are not yet supported.")
			return
		}

		let attacker = undefined
		if (payload.attacker) {
			const actor = game.actors?.get(payload.attacker)
			if (actor) {
				attacker = new DamageAttackerAdapter(actor)
			}
		}

		let weapon = undefined
		if (payload.uuid) {
			const temp = fromUuidSync(payload.uuid)
			if (temp instanceof ItemGURPS && temp.isOfType(ItemType.MeleeWeapon, ItemType.RangedWeapon)) {
				weapon = new DamageWeaponAdapter(temp)
			}
		}

		const roll = new DamageRollAdapter(payload, attacker, weapon)
		const target: DamageTarget = new DamageTargetActor(this)
		ApplyDamageDialog.create(roll, target).then(dialog => dialog.render(true))
	}

	addDRBonusesFor(
		_locationID: string,
		_tooltip: TooltipGURPS | null = null,
		_drMap: Map<string, number> = new Map(),
	): Map<string, number> {
		throw ErrorGURPS("The base ActorGURPS class cannot add DR bonuses")
	}

	/**
	 * Moves an item to another actor's inventory.
	 * @param targetActor Instance of actor to be receiving the item.
	 * @param item        Instance of the item being transferred.
	 * @param quantity    Number of items to move.
	 * @param containerId Id of the container that will contain the item.
	 * @return The target item, if the transfer is successful, or otherwise `null`.
	 */
	async transferEquipmentToActor(
		targetActor: ActorGURPS,
		item: EquipmentGURPS<ActorGURPS> | EquipmentContainerGURPS<ActorGURPS>,
		quantity: number,
		containerId?: string,
		newStack = false,
	): Promise<ItemGURPS<ActorGURPS> | null> {
		if (!item.isOfType(ItemType.Equipment, ItemType.EquipmentContainer)) {
			throw ErrorGURPS("Only equipment can be transfered between actors")
		}
		const container = targetActor.items.get(containerId ?? "")
		if (container && !container?.isOfType(ItemType.EquipmentContainer)) {
			throw ErrorGURPS("containerId refers to a non-container")
		}

		// Loot transfers can be performed by non-owners when a GM is online */
		// const gmMustTransfer = (source: ActorGURPS, target: ActorGURPS): boolean => {
		// 	const bothAreOwned = source.isOwner && target.isOwner
		// 	const sourceIsOwnedOrLoot = source.isLootableBy(game.user)
		// 	const targetIsOwnedOrLoot = target.isLootableBy(game.user)
		// 	return !bothAreOwned && sourceIsOwnedOrLoot && targetIsOwnedOrLoot
		// }
		// if (gmMustTransfer(this, targetActor)) {
		// 	const source = { tokenId: this.token?.id, actorId: this.id, itemId: item.id }
		// 	const target = { tokenId: targetActor.token?.id, actorId: targetActor.id }
		// 	await new ItemTransfer(source, target, quantity, container?.id).request()
		// 	return null
		// }

		if (!this.canUserModify(game.user, "update")) {
			ui.notifications.error(LocalizeGURPS.translations.gurps.error.cannot_move_item_source)
			return null
		}
		if (!targetActor.canUserModify(game.user, "update")) {
			ui.notifications.error(LocalizeGURPS.translations.gurps.error.cannot_move_item_destination)
			return null
		}

		// Limit the amount of items transfered to how many are actually available.
		quantity = Math.min(quantity, item.system.quantity)

		// Remove the item from the source if we are transferring all of it; otherwise, subtract the appropriate number.
		const newQuantity = item.system.quantity - quantity
		const removeFromSource = newQuantity < 1

		if (removeFromSource) {
			await item.delete()
		} else {
			await item.update({ "system.quantity": newQuantity })
		}

		const newItemData = item.toObject()
		// newItemData.system.quantity = quantity
		// newItemData.system.equipped.carryType = "worn"
		// if ("invested" in newItemData.system.equipped) {
		// 	newItemData.system.equipped.invested = item.traits.has("invested") ? false : null
		// }

		return targetActor.addToInventory(newItemData, container, newStack)
	}

	async addToInventory(
		itemSource: EquipmentSource | EquipmentContainerSource,
		_container?: AbstractContainerGURPS<this>,
		newStack?: boolean,
	): Promise<ItemGURPS<this> | null> {
		// Stack with an existing item if possible
		const stackItem = this.itemCollections.findStackableItem(itemSource)
		if (!newStack && stackItem && stackItem.type !== ItemType.EquipmentContainer) {
			const stackQuantity = stackItem.system.quantity + itemSource.system.quantity
			await stackItem.update({ "system.quantity": stackQuantity })
			return stackItem
		}

		// Otherwise create a new item
		const result = await ItemGURPS.create(itemSource, { parent: this })
		if (!result) {
			return null
		}
		const movedItem = this.items.get(result.id)
		if (!movedItem) return null
		// await this.stowOrUnstow(movedItem, container)

		return movedItem
	}
}

interface ActorGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null> extends Actor<TParent> {
	flags: ActorFlagsGURPS
	readonly _source: ActorSourceGURPS
	readonly type: ActorType
	readonly effects: foundry.abstract.EmbeddedCollection<ActiveEffectGURPS<this>>
	readonly items: foundry.abstract.EmbeddedCollection<ItemGURPS<this>>
	system: ActorSystemData

	prototypeToken: PrototypeTokenGURPS<this>

	get sheet(): ActorSheetGURPS<ActorGURPS>
}

/** A `Proxy` to to get Foundry to construct `ActorGURPS` subclasses */
const ActorProxyGURPS = new Proxy(ActorGURPS, {
	construct(
		_target,
		args: [source: PreCreate<ActorSourceGURPS>, context?: DocumentConstructionContext<ActorGURPS["parent"]>],
	) {
		return new CONFIG.GURPS.Actor.documentClasses[args[0].type](...args)
	},
})

export { ActorGURPS, ActorProxyGURPS }
