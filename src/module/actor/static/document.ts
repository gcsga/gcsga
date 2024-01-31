import { ActorGURPS } from "@actor/base.ts"
import { SETTINGS, SYSTEM_NAME, gid } from "@module/data/index.ts"
import { TokenDocumentGURPS } from "@module/canvas/token/document.ts"
import {
	MoveMode,
	MoveModeTypes,
	StaticAttributeName,
	StaticCharacterSystemData,
	StaticPosture,
	StaticResourceThreshold,
	StaticResourceTracker,
	StaticThresholdComparison,
	StaticThresholdOperator,
} from "./data.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { getProperty, mergeObject, setProperty } from "types/foundry/common/utils/helpers.js"
import { StaticItemGURPS, StaticItemSystemData } from "@item/index.ts"
import { Static } from "@util/index.ts"
import { StaticEncumbrance, StaticEquipment, StaticMelee, StaticTrait } from "./components.ts"
import { StaticCharacterImporter } from "./import.ts"
import { UserGURPS } from "@module/user/document.ts"
import { ActorType } from "@actor"
import { Attribute } from "@sytem/attribute/object.ts"
import { Encumbrance } from "@actor/character/data.ts"

Hooks.on("createActor", async function (actor: StaticCharacterGURPS) {
	if (actor.type === "character")
		await actor.update({
			"_stats.systemVersion": game.system.version,
		})
})

export interface StaticCharacterGURPS<TParent extends TokenDocumentGURPS | null> extends ActorGURPS<TParent> {
	type: ActorType.LegacyCharacter | ActorType.LegacyEnemy
	system: StaticCharacterSystemData
}

export class StaticCharacterGURPS<
	TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null,
> extends ActorGURPS<TParent> {
	getOwners(): UserGURPS[] {
		return game.users?.contents.filter(u => this.getUserLevel(u) ?? 0 >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
	}

	// Getters
	get editing(): boolean {
		return this.system.editing
	}

	get importData(): { name: string; path: string; last_import: string } {
		return {
			name: this.system.additionalresources.importname,
			path: this.system.additionalresources.importpath,
			last_import: this.system.lastImport,
		}
	}

	override get dodgeAttribute(): DeepPartial<Attribute> {
		return {
			id: gid.Dodge as string,
			attribute_def: {
				combinedName: LocalizeGURPS.translations.gurps.attributes.dodge,
			},
			effective: this.system.dodge.value,
			current: this.system.dodge.value,
		}
	}

	get effectiveMove(): number {
		return this.system.currentmove
	}

	get effectiveSprint(): number {
		return this.system.currentmove * 1.2
	}

	get trackers(): StaticResourceTracker[] {
		/**
		 *
		 * @param v
		 */
		function getCurrentThreshold(v: StaticResourceTracker): StaticResourceThreshold | null {
			const thresholds = v.thresholds
			if (!thresholds?.length) return null
			const current = thresholds.at(-1)!
			for (const t of thresholds) {
				let compare = v.max
				if (t.operator === StaticThresholdOperator.Add) compare += t.value
				else if (t.operator === StaticThresholdOperator.Subtract) compare -= t.value
				else if (t.operator === StaticThresholdOperator.Multiply) compare *= t.value
				else if (t.operator === StaticThresholdOperator.Divide) compare /= t.value

				if (t.comparison === StaticThresholdComparison.LessThan && v.value < compare) return t
				else if (t.comparison === StaticThresholdComparison.LessThanOrEqual && v.value <= compare) return t
				else if (t.comparison === StaticThresholdComparison.GreaterThan && v.value > compare) return t
				else if (t.comparison === StaticThresholdComparison.GreaterThanOrEqual && v.value >= compare) return t
			}
			return current
		}

		if (!this.system.additionalresources.tracker) return []
		return Object.keys(this.system.additionalresources.tracker).map(k => {
			const v = this.system.additionalresources.tracker[k]
			const currentThreshold = getCurrentThreshold(v)
			return mergeObject(v, {
				index: k,
				currentThreshold: currentThreshold,
			})
		})
	}

	get maxHP(): number {
		return this.system.HP.max
	}

	override get sizeMod(): number {
		return this.system.traits?.sizemod ?? 0
	}

	encumbranceLevel(): Encumbrance {
		for (const e of Object.values(this.system.encumbrance)) {
			if (e.current)
				return {
					level: e.level,
					maximum_carry: parseFloat(e.weight),
					penalty: -e.level,
					name: LocalizeGURPS.translations.gurps.character.encumbrance[e.level as 0 | 1 | 2 | 3 | 4],
				}
		}
		return {
			level: 0,
			maximum_carry: 20,
			penalty: 0,
			name: LocalizeGURPS.translations.gurps.character.encumbrance[0],
		}
	}

	override prepareBaseData(): void {
		// NOTE: why not set flags after sizemod calculation?
		super.prepareBaseData()
		this.system.conditions.posture = StaticPosture.Standing
		this.system.conditions.exhausted = false
		this.system.conditions.reeling = false
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData()

		// Handle new move data -- if system.move exists, use the default value in that object to set the move
		// value in the first entry of the encumbrance object
		if (this.system.encumbrance) {
			let move: MoveMode = this.system.move
			if (!move) {
				const currentMove = this.system.encumbrance["00000"].move ?? this.system.basicmove.value
				const value: MoveMode = {
					mode: MoveModeTypes.Ground,
					basic: currentMove,
					default: true,
				}
				setProperty(this, "system.move.00000", value)
				move = this.system.move
			}

			const current = Object.values(move).find(it => it.default)
			if (current) {
				this.system.encumbrance["00000"].move = current.basic
			}
		}

		this.calculateDerivedValues()
		this.prepareAttributes()
	}

	prepareAttributes(): void {
		const atts = new Map()
		for (const [key, value] of Object.entries(this.system.attributes)) {
			atts.set(key.toLowerCase(), {
				attr_id: key.toLowerCase(),
				current: value.value,
				points: value.points,
				attribute_def: {
					combinedName: game.i18n.localize(`gurps.static.${key.toLowerCase()}`),
				},
			})
		}
		this.attributes = atts
	}

	// Execute after every import
	async postImport(): Promise<void> {
		// This.calculateDerivedValues()

		// Convoluted code to add Items (and features) into the equipment list
		let orig: StaticItemGURPS[] = (this.items.contents as StaticItemGURPS[]).sort(
			(a, b) => b.name?.localeCompare(a.name ?? "") ?? 0,
		)
		let good: StaticItemGURPS[] = []
		while (orig.length > 0) {
			// We are trying to place 'parent' items before we place 'children' items
			const left: StaticItemGURPS[] = []
			let atLeastOne = false
			for (const i of orig) {
				if (!i.system.eqt.parentuuid || good.find(e => e.system.eqt.uuid === i.system.eqt.parentuuid)) {
					atLeastOne = true
					good.push(i)
				} else left.push(i)
			}
			if (atLeastOne) orig = left
			else {
				good = [...good, ...left]
				orig = []
			}
		}
		// For (const item of good) await this.addItemData(item)

		await this.update({ "_stats.systemVersion": game.system.version }, { diff: false, render: false })
		await this.setResourceTrackers()
		await this.syncLanguages()
	}

	async setResourceTrackers(): Promise<void> {
		// TODO: implement this
		// let templates = ResourceTrackerManager.getAllTemplates().filter(it => !!it.slot)
	}

	findTrait(sname: string): StaticTrait | null {
		let t: StaticTrait | null = null
		sname = Static.makeRegexPatternFrom(sname, false)
		const regex = new RegExp(sname, "i")
		Static.recurseList(this.system.ads, s => {
			if (s.name.match(regex)) {
				t = s
			}
		})
		return t
	}

	async syncLanguages(): Promise<void> {
		if (this.system.languages) {
			let updated = false
			const newads = { ...this.system.ads }
			const langn = /Language:?/i
			const langt = new RegExp(LocalizeGURPS.translations.gurps.language.language)
			Static.recurseList(this.system.languages, (e, _k, _d) => {
				const a = this.findTrait(`*${e.name}`)
				if (a) {
					if (!a.name.match(langn) && !a.name.match(langt)) {
						// GCA4 / GCS style
						a.name = `${LocalizeGURPS.translations.gurps.language.language}: ${a.name}`
						updated = true
					}
				} else {
					// GCA5 style (Language without Adv)
					let n = `${LocalizeGURPS.translations.gurps.language.language}: ${e.name}`
					// If equal, then just report single level
					if (e.spoken === e.written) n += ` (${e.spoken})`
					// Otherwise, report ttpy eand level (like GCA4)
					else {
						if (e.spoken) n += ` (${LocalizeGURPS.translations.gurps.language.spoken})(${e.spoken})`
						if (e.written) n += ` (${LocalizeGURPS.translations.gurps.language.written})(${e.written})`
					}
					const a = new StaticTrait()
					a.name = n
					a.points = e.points
					Static.put(newads, a)
					updated = true
				}
			})
			if (updated) await this.update({ "system.ads": newads })
		}
	}

	// This will ensure that every characater at least starts
	// with these new data values.  actor-sheet.js may change them.
	calculateDerivedValues(): void {
		// Let saved = !!this.ignoreRender
		// this.ignoreRender = true
		this._initializeStartingValues()
		// This._applyItemBonuses()

		// Must be done after bonuses, but before weights
		// this._calculateEncumbranceIssues()

		// Must be after bonuses and encumbrance effects on ST
		// this._recalcItemFeatures()
		// this._calculateRangedRanges()

		// Must be done at end
		// this._calculateWeights()

		// let maneuver = this.effects.contents.find(it => it.flags?.core?.statusId === "maneuver")
		// this.system.conditions.maneuver = maneuver ? maneuver.flags.gurps.name : "undefined"
		// This.ignoreRender = saved
		// if (!saved) setTimeout(() => this.render(), 333)
	}

	/*
	 * Initialize the attribute starting values/levels.
	 * The code is expecting 'value' or 'level' for many things,
	 * and instead of changing all of the GUIs and OTF logic
	 * we are just going to switch the rug out from underneath.
	 * "Import" data will be in the 'import' key and then we will calculate value/level when the actor is loaded.
	 */
	_initializeStartingValues(): void {
		const data = this.system
		data.currentdodge = 0
		data.equipment ??= { carried: {}, other: {} }
		data.equipment.carried ??= {}
		data.equipment.other ??= {}

		// Need to protect against data errors
		for (const attr in data.attributes) {
			if (
				typeof data.attributes[attr as StaticAttributeName] === "object" &&
				data.attributes[attr as StaticAttributeName] !== null
			)
				if (isNaN(data.attributes[attr as StaticAttributeName].import))
					data.attributes[attr as StaticAttributeName].value = 0
		}
		Static.recurseList(data.skills, (e, _k, _d) => {
			if (e.import) e.level = Number(Number(e.import))
		})
	}

	getEquipped(key: keyof StaticCharacterSystemData): [string, number] {
		let val = 0
		let txt = ""
		if (this.system.melee && this.system.equipment?.carried)
			Object.values(this.system.melee).forEach((melee: StaticMelee) => {
				Static.recurseList(this.system.equipment.carried, (e: StaticEquipment, _k, _d) => {
					if (e && !val && e.equipped && melee.name.match(Static.makeRegexPatternFrom(e.name, false))) {
						const t = parseInt(melee[key as keyof StaticMelee] as string)
						if (!isNaN(t)) {
							val = t
							txt = `${melee[key as keyof StaticMelee]}`
						}
					}
				})
			})
		if (!val && this.system[key]) {
			txt = `${this.system[key]}`
			val = parseInt(txt)
		}
		return [txt, val]
	}

	getEquippedParry(): number {
		const [txt, val] = this.getEquipped("parry")
		this.system.equippedparryisfencing = Boolean(txt && txt.match(/f$/i))
		return val
	}

	getEquippedBlock(): number {
		return this.getEquipped("block")[1]
	}

	// // Called when equipment is being moved
	// /**
	//  * @param {Equipment} eqt
	//  * @param {string} targetPath
	//  */
	// async updateItemAdditionsBasedOn(eqt: StaticEquipment, targetPath: string) {
	// 	await this._updateEqtStatus(eqt, targetPath, targetPath.includes(".carried"))
	// }

	// // Equipment may carry other eqt, so we must adjust the carried status all the way down.
	// /**
	//  * @param {Equipment} eqt
	//  * @param {string} eqtkey
	//  * @param {boolean} carried
	//  */
	// async _updateEqtStatus(eqt: StaticEquipment, eqtkey: string, carried: boolean) {
	// 	eqt.carried = carried
	// 	if (eqt.itemid) {
	// 		let item: StaticItemGURPS | undefined = this.items.get(eqt.itemid) as StaticItemGURPS
	// 		await this.updateEmbeddedDocuments("Item", [
	// 			{ _id: item.id, "system.equipped": eqt.equipped, "system.carried": carried },
	// 		])
	// 		if (!carried || !eqt.equipped) await this._removeItemAdditions(eqt.itemid)
	// 		if (carried && eqt.equipped) await this._addItemAdditions(item, eqtkey)
	// 	}
	// 	for (const k in eqt.contains) await this._updateEqtStatus(eqt.contains[k], `${eqtkey}.contains.${k}`, carried)
	// 	for (const k in eqt.collapsed)
	// 		await this._updateEqtStatus(eqt.collapsed[k], `${eqtkey}.collapsed.${k}`, carried)
	// }

	// /**
	//  * @param {string} itemid
	//  */
	// async _removeItemAdditions(itemid: string) {
	// 	await this._removeItemElement(itemid, "melee")
	// 	await this._removeItemElement(itemid, "ranged")
	// 	await this._removeItemElement(itemid, "ads")
	// 	await this._removeItemElement(itemid, "skills")
	// 	await this._removeItemElement(itemid, "spells")
	// }

	// // We have to remove matching items after we searched through the list
	// // because we cannot safely modify the list why iterating over it
	// // and as such, we can only remove 1 key at a time and must use thw while loop to check again
	// /**
	//  * @param {string} itemid
	//  * @param {string} key
	//  */
	// async _removeItemElement(itemid: string, key: string) {
	// 	let found = "ERROR"
	// 	let any = false
	// 	if (!key.startsWith("system.")) key = `system.${key}`
	// 	while (found !== "") {
	// 		found = ""
	// 		let list = getProperty(this, key)
	// 		Static.recurseList(list, (e, k, _d) => {
	// 			if (e.itemid === itemid) found = k
	// 		})
	// 		if (found) {
	// 			any = true
	// 			await Static.removeKey(this, `${key}.${found}`)
	// 		}
	// 	}
	// 	return any
	// }

	// /**
	//  * @param {string} srckey
	//  * @param {string} targetkey
	//  * @param {boolean} shiftkey
	//  */
	// async moveEquipment(srckey: string, targetkey: string, shiftkey: boolean) {
	// 	if (srckey === targetkey) return
	// 	if (shiftkey && (await this._splitEquipment(srckey, targetkey))) return
	// 	// Because we may be modifing the same list, we have to check the order of the keys and
	// 	// apply the operation that occurs later in the list, first (to keep the indexes the same)
	// 	let srca = srckey.split(".")
	// 	srca.splice(0, 3)
	// 	let tara = targetkey.split(".")
	// 	tara.splice(0, 3)
	// 	let max = Math.min(srca.length, tara.length)
	// 	let isSrcFirst = max === 0 ? srca.length > tara.length : false
	// 	for (let i = 0; i < max; i++) {
	// 		if (parseInt(srca[i]) < parseInt(tara[i])) isSrcFirst = true
	// 	}
	// 	let object = getProperty(this, srckey)
	// 	if (targetkey.match(/^system\.equipment\.\w+$/)) {
	// 		object.parentuuid = ""
	// 		if (object.itemid) {
	// 			let item = /** @type {Item} */ this.items.get(object.itemid)
	// 			await this.updateEmbeddedDocuments("Item", [{ _id: item?.id, "system.eqt.parentuuid": "" }])
	// 		}
	// 		let target = { ...Static.decode(this, targetkey) } // Shallow copy the list
	// 		if (!isSrcFirst) await Static.removeKey(this, srckey)
	// 		let eqtkey = Static.put(target, object)
	// 		await this.updateItemAdditionsBasedOn(object, `${targetkey}.${eqtkey}`)
	// 		await this.update({ [targetkey]: target })
	// 		if (isSrcFirst) await Static.removeKey(this, srckey)
	// 	}
	// 	if (await this._checkForMerging(srckey, targetkey)) return
	// 	if (srckey.includes(targetkey) || targetkey.includes(srckey)) {
	// 		ui.notifications?.error(
	// 			"Unable to drag and drop withing the same hierarchy. Try moving it elsewhere first."
	// 		)
	// 		return
	// 	}
	// 	this.toggleExpand(targetkey, true)
	// 	let d = new Dialog({
	// 		title: object.name,
	// 		content: "<p>Where do you want to place this?</p>",
	// 		buttons: {
	// 			one: {
	// 				icon: '<i class="fas fa-level-up-alt"></i>',
	// 				label: "Before",
	// 				callback: async () => {
	// 					if (!isSrcFirst) {
	// 						await Static.removeKey(this, srckey)
	// 						await this.updateParentOf(srckey, false)
	// 					}
	// 					await this.updateItemAdditionsBasedOn(object, targetkey)
	// 					await Static.insertBeforeKey(this, targetkey, object)
	// 					await this.updateParentOf(targetkey, true)
	// 					if (isSrcFirst) {
	// 						await Static.removeKey(this, srckey)
	// 						await this.updateParentOf(srckey, false)
	// 					}
	// 					this.render()
	// 				},
	// 			},
	// 			two: {
	// 				icon: '<i class="fas fa-sign-in-alt"></i>',
	// 				label: "In",
	// 				callback: async () => {
	// 					if (!isSrcFirst) {
	// 						await Static.removeKey(this, srckey)
	// 						await this.updateParentOf(srckey, false)
	// 					}
	// 					let k = `${targetkey}.contains.${Static.zeroFill(0)}`
	// 					await this.updateItemAdditionsBasedOn(object, targetkey)
	// 					await Static.insertBeforeKey(this, k, object)
	// 					await this.updateParentOf(k, true)
	// 					if (isSrcFirst) {
	// 						await Static.removeKey(this, srckey)
	// 						await this.updateParentOf(srckey, false)
	// 					}
	// 					this.render()
	// 				},
	// 			},
	// 		},
	// 		default: "one",
	// 	})
	// 	d.render(true)
	// }

	// /**
	//  * @param {string} srckey
	//  * @param {string} targetkey
	//  */
	// async _splitEquipment(srckey: string, targetkey: string) {
	// 	let srceqt = getProperty(this, srckey)
	// 	if (srceqt.count <= 1) return false // Nothing to split
	// 	let content = await renderTemplate("systems/gurps/templates/transfer-equipment.html", { eqt: srceqt })
	// 	let count = 0
	// 	let callback = async (html: JQuery<HTMLElement>) =>
	// 		(count = parseInt(html.find("#qty").val()?.toString() || "0"))
	// 	await Dialog.prompt({
	// 		title: "Split stack",
	// 		label: LocalizeGURPS.translations.gurps.static.ok,
	// 		content: content,
	// 		callback: callback,
	// 	})
	// 	if (count <= 0) return true // Didn't want to split
	// 	if (count >= srceqt.count) return false // Not a split, but a move
	// 	if (targetkey.match(/^data\.equipment\.\w+$/)) targetkey += `.${Static.zeroFill(0)}`
	// 	if (srceqt.globalid) {
	// 		await this.updateEqtCount(srckey, srceqt.count - count)
	// 		const item = this.items.get(srceqt.itemid) as StaticItemGURPS
	// 		item.system.eqt.count = count
	// 		await this.addNewItemData(item, targetkey)
	// 		await this.updateParentOf(targetkey, true)
	// 		this.render()
	// 		return true
	// 	} else {
	// 		// Simple eqt
	// 		let neqt = duplicate(srceqt)
	// 		neqt.count = count
	// 		await this.updateEqtCount(srckey, srceqt.count - count)
	// 		await Static.insertBeforeKey(this, targetkey, neqt)
	// 		await this.updateParentOf(targetkey, true)
	// 		this.render()
	// 		return true
	// 	}
	// }

	// // Set the equipment count to 'count' and then recalc sums
	// /**
	//  * @param {string} eqtkey
	//  * @param {number} count
	//  */
	// async updateEqtCount(eqtkey: string, count: number) {
	// 	let update: { [key: string]: any } = { [`${eqtkey}.count`]: count }
	// 	if (game.settings.get(SYSTEM_NAME, SETTINGS.STATIC_AUTOMATICALLY_SET_IGNOREQTY))
	// 		update[`${eqtkey}.ignoreImportQty`] = true
	// 	await this.update(update)
	// 	let eqt = getProperty(this, eqtkey)
	// 	await this.updateParentOf(eqtkey, false)
	// 	if (eqt.itemid) {
	// 		let item = this.items.get(eqt.itemid)
	// 		if (item) await this.updateEmbeddedDocuments("Item", [{ _id: item.id, "system.eqt.count": count }])
	// 		else {
	// 			ui.notifications?.warn("Invalid Item in Actor... removing all features")
	// 			this._removeItemAdditions(eqt.itemid)
	// 		}
	// 	}
	// }

	// /**
	//  * @param {string} srckey
	//  * @param {string} targetkey
	//  */
	// async _checkForMerging(srckey: string, targetkey: string) {
	// 	let srceqt = getProperty(this, srckey)
	// 	let desteqt = getProperty(this, targetkey)
	// 	if (
	// 		(srceqt.globalid && srceqt.globalid === desteqt.globalid) ||
	// 		(!srceqt.globalid && srceqt.name === desteqt.name)
	// 	) {
	// 		await this.updateEqtCount(targetkey, parseInt(srceqt.count) + parseInt(desteqt.count))
	// 		// If (srckey.includes('.carried') && targetkey.includes('.other'))
	// 		// 	 await this._removeItemAdditionsBasedOn(desteqt)
	// 		await this.deleteEquipment(srckey)
	// 		this.render()
	// 		return true
	// 	}
	// 	return false
	// }

	// Initialize the attribute starting values/levels.
	// The code is expecting 'value' or 'level' for many things, and instead of changing all of the GUIs and OTF logic
	// we are just going to switch the rug out from underneath.
	// "Import" data will be in the 'import' key and then we will calculate value/level when the actor is loaded.
	// _initializeStartingValues(): void {
	// 	const data = this.system;
	// 	data.currentdodge = 0; // Start at 0, bonuses will add, then they will be finalized
	// 	if (data.equipment) {
	// 		data.equipment.carried ??= {};
	// 		data.equipment.other ??= {};
	// 	}
	// 	if (!data.migrationVersion) return;
	// 	let v: SemanticVersion = SemanticVersion.fromString(data.migrationVersion);

	// 	// Attributes need to have 'value' set because Foundry expects objs with value and max
	// 	// to be attributes (so we can't use currentvalue)
	// 	// Need to protect against data errors
	// 	for (const attr in data.attributes) {
	// 		if (typeof data.attributes[attr] === "object" && data.attributes[attr] !== null)
	// 			if (isNaN(data.attributes[attr].import)) data.attributes[attr].value = 0;
	// 			else data.attributes[attr].value = parseInt(data.attributes[attr].import);
	// 	}

	// 	// After all of the attributes are copied over, apply tired to ST
	// 	// if (!!data.conditions.exhausted)
	// 	//   data.attributes.ST.value = Math.ceil(parseInt(data.attributes.ST.value.toString()) / 2)
	// 	recurselist(data.skills, (e, k, d) => {
	// 		if (e.import) e.level = parseInt(e.import);
	// 	});
	// 	recurselist(data.spells, (e, k, d) => {
	// 		if (e.import) e.level = parseInt(e.import);
	// 	});

	// 	recurselist(data.melee, (e, k, d) => {
	// 		if (e.import) {
	// 			e.level = parseInt(e.import);
	// 			if (!isNaN(parseInt(e.parry))) {
	// 				// Allows for '14f' and 'no'
	// 				let base = 3 + Math.floor(e.level / 2);
	// 				let bonus = parseInt(e.parry) - base;
	// 				if (bonus !== 0) {
	// 					e.parrybonus = (bonus > 0 ? "+" : "") + bonus;
	// 				}
	// 			}
	// 			if (!isNaN(parseInt(e.block))) {
	// 				let base = 3 + Math.floor(e.level / 2);
	// 				let bonus = parseInt(e.block) - base;
	// 				if (bonus !== 0) {
	// 					e.blockbonus = (bonus > 0 ? "+" : "") + bonus;
	// 				}
	// 			}
	// 		} else {
	// 			e.parrybonus = e.parry;
	// 			e.blockbonus = e.block;
	// 		}
	// 	});

	// 	recurselist(data.ranged, (e, k, d) => {
	// 		e.level = parseInt(e.import);
	// 	});

	// 	// Only prep hitlocation DRs from v0.9.7 or higher
	// 	if (!v.isLowerThan(settings.VERSION_097))
	// 		recurselist(data.hitlocations, (e, k, d) => {
	// 			e.dr = e.import;
	// 		});
	// }

	// _applyItemBonuses(): void {
	// 	let pi = (n?: string) => (n ? parseInt(n) : 0);
	// 	let gids: string[] = [];
	// 	const data = this.system;
	// 	for (const item of this.items) {
	// 		let itemData = (item as StaticItemGURPS).system;
	// 		if (itemData.equipped && itemData.carried && itemData.bonuses && gids.includes(itemData.globalid)) {
	// 			gids.push(itemData.globalid);
	// 			let bonuses = itemData.bonuses.split("\n");
	// 			for (let bonus of bonuses) {
	// 				let m = bonus.match(/\[(.*)\]/);
	// 				if (m) bonus = m[1]; // Remove extranious [ ]
	// 				let link = parselink(bonus);
	// 				if (link.action) {
	// 					// Start OTF
	// 					recurselist(data.melee, (e: StaticMelee, _k: any, _d: any) => {
	// 						e.level = pi(e.level);
	// 						if (link.action.type === "attribute" && link.action.attrkey === "DX") {
	// 							// All melee attacks skills affected by DX
	// 							e.level += pi(link.action.mod);
	// 							if (!isNaN(parseInt(e.parry))) {
	// 								// Handles "11f"
	// 								let m = `${ e.parry }`.match(/(\d+)(.*)/);
	// 								e.parry = 3 + Math.floor(e.level / 2);
	// 								if (e.parrybonus) e.parry += pi(e.parrybonus);
	// 								if (m) e.parry += m[2];
	// 							}
	// 							if (!isNaN(parseInt(e.block))) {
	// 								// Handles "no"
	// 								e.block = 3 + Math.floor(e.level / 2);
	// 								if (e.blockbonus) e.block += pi(e.blockbonus);
	// 							}
	// 						}
	// 						if (link.action.type === "attack" && link.action.isMelee) {
	// 							if (e.name.match(makeRegexPatternFrom(link.action.name, false))) {
	// 								e.level += pi(link.action.mod);
	// 								if (!isNaN(parseInt(e.parry))) {
	// 									// Handles "11f"
	// 									let m = `${ e.parry }`.match(/(\d+)(.*)/);
	// 									e.parry = 3 + Math.floor(e.level / 2);
	// 									if (e.parrybonus) e.parry += pi(e.parrybonus);
	// 									if (m) e.parry += m[2];
	// 								}
	// 								if (!isNaN(parseInt(e.block))) {
	// 									// Handles "no"
	// 									e.block = 3 + Math.floor(e.level / 2);
	// 									if (e.blockbonus) e.block += pi(e.blockbonus);
	// 								}
	// 							}
	// 						}
	// 					}); // End melee
	// 					recurselist(data.ranged, (e: StaticRanged, _k: any, _d: any) => {
	// 						e.level = pi(e.level);
	// 						if (link.action.type === "attribute" && link.action.attrkey === "DX")
	// 							e.level += pi(link.action.mod);
	// 						if (link.action.type === "attack" && link.action.isRanged) {
	// 							if (e.name.match(makeRegexPatternFrom(link.action.name, false)))
	// 								e.level += pi(link.action.mod);
	// 						}
	// 					}); // End ranged
	// 					recurselist(data.skills);
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	async addItemData(itemData: StaticItemGURPS, targetKey: string | null = null): Promise<void> {
		const [eqtKey, addFeatures] = await this._addNewItemEquipment(itemData, targetKey)
		if (addFeatures) await this._addItemAdditions(itemData, eqtKey)
	}

	async _addNewItemEquipment(itemData: StaticItemGURPS, targetKey: string | null): Promise<[string, boolean]> {
		const existing = this._findEqtKeyForId("uuid", itemData._id)
		if (existing) {
			const eqt = getProperty(this, existing) as StaticEquipment
			return [existing, eqt.carried && eqt.equipped]
		}
		const _data = itemData.system
		if (_data.eqt.parentuuid) {
			let found
			Static.recurseList(this.system.equipment.carried, (e, k: string, _d) => {
				if (e.uuid === _data.eqt.parentuuid) found = `system.equipment.carried.${k}`
			})
			if (!found)
				Static.recurseList(this.system.equipment.other, (e, k, _d) => {
					if (e.uuid === _data.eqt.parentuuid) found = `system.equipment.other.${k}`
				})
			if (found) targetKey = `${found}.contains.${Static.zeroFill(0)}`
		}
		if (targetKey === null) {
			if (_data.carried) {
				targetKey = "system.equipment.carried"
				let index = 0
				const list = getProperty(this, targetKey) as StaticEquipment
				while (Object.prototype.hasOwnProperty.call(list, Static.zeroFill(index))) index += 1
				targetKey += `.${Static.zeroFill(index)}`
			} else targetKey = "system.equipment.other"
		}
		if (targetKey.match(/^system\.equipment\.\w+$/)) targetKey += `.${Static.zeroFill(0)}`
		const eqt = _data.eqt
		if (!eqt) {
			ui.notifications?.warn(`Item: ${itemData._id} (Global:${_data.globalid}) missing equipment`)
			return ["", false]
		}
		eqt.itemid = itemData._id
		eqt.globalid = _data.uuid
		eqt.equipped = !!_data.equipped ?? true
		eqt.img = itemData.img
		eqt.carried = !!_data.carried ?? true
		await Static.insertBeforeKey(this, targetKey, eqt)
		await this.updateParentOf(targetKey, true)
		return [targetKey, eqt.carried && eqt.equipped]
	}

	_findEqtKeyForId(key: string, id: string): string | undefined {
		let eqtkey: string | undefined
		const data = this.system
		Static.recurseList(data.equipment.carried, (e, k, _d) => {
			if (e[key] === id) eqtkey = `system.equipment.carried${k}`
		})
		if (!eqtkey)
			Static.recurseList(data.equipment.other, (e, k, _d) => {
				if (e[key] === id) eqtkey = `system.equipment.other${k}`
			})
		return eqtkey
	}

	async updateParentOf(srcKey: string, updatePuuid = true): Promise<void> {
		const pindex = 4
		const paths = srcKey.split(".")
		let sp = paths.slice(0, pindex).join(".")
		const parent = getProperty(this, sp) as StaticEquipment
		if (parent) {
			await StaticEquipment.calcUpdate(this, parent, sp)
			if (updatePuuid) {
				let puuid = ""
				if (paths.length >= 6) {
					sp = paths.slice(0, -2).join(".")
					puuid = (getProperty(this, sp) as StaticEquipment).uuid
				}
				await this.update({ [`${srcKey}.parentuuid`]: puuid })
				const eqt = getProperty(this, srcKey) as StaticEquipment
				if (eqt.itemid) {
					const item = this.items.get(eqt.itemid)
					if (item)
						await this.updateEmbeddedDocuments("Item", [{ _id: item.id, "system.eqt.parentuuid": puuid }])
				}
			}
		}
	}

	async _addItemAdditions(itemData: StaticItemGURPS, eqtkey: string): Promise<void> {
		let commit = {}
		commit = { ...commit, ...(await this._addItemElement(itemData, eqtkey, "melee")) }
		commit = { ...commit, ...(await this._addItemElement(itemData, eqtkey, "ranged")) }
		commit = { ...commit, ...(await this._addItemElement(itemData, eqtkey, "ads")) }
		commit = { ...commit, ...(await this._addItemElement(itemData, eqtkey, "skills")) }
		commit = { ...commit, ...(await this._addItemElement(itemData, eqtkey, "spells")) }
		await this.update(commit, { diff: false })
		this.calculateDerivedValues() // New skills and bonuses may affect other items... force a recalc
	}

	async _addItemElement(
		itemData: StaticItemGURPS,
		eqtKey: string,
		key: keyof StaticCharacterSystemData & keyof StaticItemSystemData,
	): Promise<Record<string, unknown>> {
		let found = false
		// @ts-expect-error variable type ambiguity...
		Static.recurseList(this.system[key], (e, _k, _d) => {
			if (e.itemid === itemData._id) found = true
		})
		if (found) return {}
		// @ts-expect-error variable type ambiguity...
		const list = { ...this.system[key] }
		let i = 0
		for (const k in itemData.system[key]) {
			// @ts-expect-error variable type ambiguity...
			const e = duplicate(itemData.system[key][k])
			e.itemid = itemData._id
			e.uuid = `${key}-${(i += 1)}-${e.itemid}`
			e.eqtkey = eqtKey
			e.imd = itemData.img
			Static.put(list, e)
		}
		return i === 0 ? {} : { [`system.${key}`]: list }
	}

	async importCharacter(): Promise<void> {
		const import_path = this.system.additionalresources.importpath
		const import_name = import_path.match(/.*[/\\]Data[/\\](.*)/)
		if (import_name) {
			const file_path = import_name[1].replace(/\\/g, "/")
			const request = new XMLHttpRequest()
			request.open("GET", file_path)

			new Promise(resolve => {
				request.onload = () => {
					if (request.status === 200) {
						const text = request.response
						StaticCharacterImporter.import(this, {
							text: text,
							name: import_name[1],
							path: import_path,
						})
					} else this._openImportDialog()
					resolve(this)
				}
			})
			request.send(null)
		} else this._openImportDialog()
	}

	_openImportDialog(): void {
		let file: File | null = null
		if (game.settings.get(SYSTEM_NAME, SETTINGS.SERVER_SIDE_FILE_DIALOG)) {
			const filepicker = new FilePicker({
				baseApplication: null,
				width: null,
				height: null,
				top: null,
				left: null,
				popOut: true,
				minimizable: false,
				resizable: null,
				id: "",
				classes: [],
				dragDrop: [],
				title: "Test",
				type: "text",
				scrollY: [],
				template: null,
				filters: [],
				tabs: [],
				callback: (path: string) => {
					const request = new XMLHttpRequest()
					request.open("GET", path)
					new Promise(resolve => {
						request.onload = () => {
							if (request.status === 200) {
								const text = request.response
								file = {
									text: text,
									name: path,
									path: request.responseURL,
								}
								StaticCharacterImporter.import(this, file)
							}
							resolve(this)
						}
					})
					request.send(null)
				},
			})
			filepicker.extension = [".gcs", ".xml", ".gca5"]
			filepicker.render(true)
		} else {
			const inputEl = document.createElement("input")
			inputEl.type = "file"
			$(inputEl).on("change", event => {
				const rawFile = $(event.currentTarget).prop("files")[0]
				file = {
					text: "",
					name: rawFile.name,
					path: rawFile.path,
				}
				readTextFromFile(rawFile).then(text => {
					StaticCharacterImporter.import(this, {
						text: text,
						name: rawFile.name,
						path: rawFile.path,
					})
				})
			})
			$(inputEl).trigger("click")
		}
		// SetTimeout(async () => {
		// 	new Dialog(
		// 		{
		// 			title: `Import character data for: ${this.name}`,
		// 			content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/import.hbs`, {
		// 				name: `"${this.name}"`,
		// 			}),
		// 			buttons: {
		// 				import: {
		// 					icon: '<i class="fas fa-file-import"></i>',
		// 					label: "Import",
		// 					callback: html => {
		// 						const form = $(html).find("form")[0]
		// 						const files = form.data.files
		// 						if (!files.length) {
		// 							return ui.notifications?.error("You did not upload a data file!")
		// 						} else {
		// 							const file = files[0]
		// 							readTextFromFile(file).then(text =>
		// 								StaticCharacterImporter.import(this, {
		// 									text: text,
		// 									name: file.name,
		// 									path: file.path,
		// 								})
		// 							)
		// 						}
		// 					},
		// 				},
		// 				no: {
		// 					icon: '<i class="fas fa-times"></i>',
		// 					label: "Cancel",
		// 				},
		// 			},
		// 			default: "import",
		// 		},
		// 		{
		// 			width: 400,
		// 		}
		// 	).render(true)
		// }, 200)
	}

	_findElementIn(list: string, uuid: string, name = "", mode = "") {
		let foundkey: any = null
		const l = getProperty(this, list)
		Static.recurseList(l, (e, k, _d) => {
			if ((uuid && e.uuid === uuid) || (e.name && e.name.startsWith(name) && e.mode === mode)) foundkey = k
		})
		return foundkey === null ? foundkey : getProperty(this, `${list}.${foundkey}`)
	}

	_migrateOtfsAndNotes(oldobj: any = {}, newobj: any = {}, importvttnotes = "") {
		if (!oldobj) return
		if (importvttnotes) newobj.notes += (newobj.notes ? " " : "") + importvttnotes
		this._updateOtf("check", oldobj, newobj)
		this._updateOtf("during", oldobj, newobj)
		this._updateOtf("pass", oldobj, newobj)
		this._updateOtf("fail", oldobj, newobj)
		if (oldobj.notes?.startsWith(newobj.notes))
			// Must be done AFTER OTFs have been stripped out
			newobj.notes = oldobj.notes
		if (oldobj.name?.startsWith(newobj.name)) newobj.name = oldobj.name
	}

	_updateOtf(otfkey: string, oldobj: any, newobj: any) {
		const objkey = `${otfkey}otf`
		const oldotf = oldobj[objkey] ?? ""
		newobj[objkey] = oldotf
		let notes
		let newotf
		;[notes, newotf] = this._removeOtf(otfkey, newobj.notes || "")
		if (newotf) newobj[objkey] = newotf
		newobj.notes = notes?.trim()
	}

	// Looking for OTFs in text.  ex:   c:[/qty -1] during:[/anim healing c]
	_removeOtf(key: string, text: string) {
		if (!text) return [text, null]
		let start
		let patstart = text.toLowerCase().indexOf(`${key[0]}:[`)
		if (patstart < 0) {
			patstart = text.toLowerCase().indexOf(`${key}:[`)
			if (patstart < 0) return [text, null]
			else start = patstart + key.length + 2
		} else start = patstart + 3
		let cnt = 1
		let i = start
		if (i >= text.length) return [text, null]
		do {
			const ch = text[i++]
			if (ch === "[") cnt++
			if (ch === "]") cnt--
		} while (i < text.length && cnt > 0)
		if (cnt === 0) {
			const otf = text.substring(start, i - 1)
			const front = text.substring(0, patstart)
			let end = text.substring(i)
			if ((front === "" || front.endsWith(" ")) && end.startsWith(" ")) end = end.substring(1)
			return [front + end, otf]
		} else return [text, null]
	}

	async toggleExpand(path: string, expandOnly = false) {
		const obj = getProperty(this, path)
		if (obj.collapsed && Object.keys(obj.collapsed).length > 0) {
			const temp = { ...obj.contains, ...obj.collapsed }
			const update = {
				[`${path}.-=collapsed`]: null,
				[`${path}.collapsed`]: {},
				[`${path}.contains`]: temp,
			}
			await this.update(update)
		} else if (!expandOnly && obj.contains && Object.keys(obj.contains).length > 0) {
			const temp = { ...obj.contains, ...obj.collapsed }
			const update = {
				[`${path}.-=contains`]: null,
				[`${path}.contains`]: {},
				[`${path}.collapsed`]: temp,
			}
			await this.update(update)
		}
	}

	// Create a new embedded item based on this item data and place in the carried list
	// This is how all Items are added originally.
	/**
	 * @param {StaticItemGURPS} itemData
	 * @param {string | null} [targetkey]
	 */
	async addNewItemData(itemData: StaticItemGURPS, targetkey: string | null = null) {
		let d = itemData
		// @ts-expect-error incomplete item
		if (typeof itemData.toObject === "function") d = itemData.toObject()
		// @ts-expect-error incomplete item
		const localItems = await this.createEmbeddedDocuments("Item", [d]) // Add a local Foundry Item based on some Item data
		const localItem = localItems[0] as StaticItemGURPS
		await this.updateEmbeddedDocuments("Item", [{ _id: localItem.id, "system.eqt.uuid": newUUID() }])
		await this.addItemData(localItem, targetkey) // Only created 1 item
	}

	// // Return the item data that was deleted (since it might be transferred)
	// /**
	//  * @param {string} path
	//  * @param depth
	//  */
	// async deleteEquipment(path: string, depth = 0) {
	// 	let eqt = getProperty(this, path)
	// 	if (!eqt) return eqt
	//
	// 	// Delete in reverse order so the keys don't get messed up
	// 	if (eqt.contains)
	// 		for (const k of Object.keys(eqt.contains).sort().reverse())
	// 			await this.deleteEquipment(`${path}.contains.${k}`, depth + 1)
	// 	if (eqt.collpased)
	// 		for (const k of Object.keys(eqt.collapsed).sort().reverse())
	// 			await this.deleteEquipment(`${path}.collapsed.${k}`, depth + 1)
	//
	// 	let item
	// 	if (eqt.itemid) {
	// 		item = this.items.get(eqt.itemid)
	// 		if (item) await item.delete() // Data protect for messed up mooks
	// 		await this._removeItemAdditions(eqt.itemid)
	// 	}
	// 	await Static.removeKey(this, path)
	// 	if (depth === 0) this.render()
	// 	return item
	// }

	// async increaseCondition(id: EffectID): Promise<ConditionGURPS | null> {
	// 	if (Postures.includes(id as any)) {
	// 		if (this.hasCondition(id as any)) await this.update({ "system.move.posture": "standing" })
	// 		else await this.update({ "system.move.posture": id })
	// 	}
	// 	return super.increaseCondition(id)
	// }
	//
	// async decreaseCondition(id: EffectID, { forceRemove } = { forceRemove: false }): Promise<void> {
	// 	if (Postures.includes(id as any)) await this.update({ "system.move.posture": "standing" })
	// 	return super.decreaseCondition(id, { forceRemove })
	// }
	//
	// async changeManeuver(id: ManeuverID | "none"): Promise<ConditionGURPS | null> {
	// 	await this.update({ "system.move.maneuver": id })
	// 	return super.changeManeuver(id)
	// }
	//
	// async resetManeuvers(): Promise<null> {
	// 	await this.update({ "system.move.maneuver": "none" })
	// 	return super.resetManeuvers()
	// }

	// All this changes is allowing delta values to decrease the bar below 0
	override async modifyTokenAttribute(attribute: string, value: number, isDelta?: boolean, isBar?: boolean) {
		const current = foundry.utils.getProperty(this.system, attribute) as { value: number; max: number; min: number }

		// Determine the updates to make to the actor data
		let updates
		if (isBar) {
			if (isDelta) value = Math.clamped(-Infinity, Number(current.value) + value, current.max)
			updates = { [`system.${attribute}.value`]: value }
		} else {
			if (isDelta) value = Number(current) + value
			updates = { [`system.${attribute}`]: value }
		}

		const allowed = Hooks.call("modifyTokenAttribute", { attribute, value, isDelta, isBar }, updates)
		if (allowed !== false) this.update(updates)
		return this
	}
}
