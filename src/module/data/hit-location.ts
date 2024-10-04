import fields = foundry.data.fields
import { ActorType, gid } from "@data"
import { equalFold } from "@module/data/item/components/string-criteria.ts"
import { StringBuilder, TooltipGURPS, generateId } from "@util"
import { DiceGURPS } from "./dice.ts"
import { type ActorGURPS2 } from "@module/document/actor.ts"

type ActorBodySchema = {
	name: fields.StringField<string, string, true, false, true>
	roll: fields.StringField<string, string, true, false, true>
	locations: fields.ArrayField<fields.EmbeddedDataField<HitLocation>>
	sub_tables: fields.ArrayField<
		fields.EmbeddedDataField<HitLocationSubTable>,
		Partial<SourceFromSchema<HitLocationSubTableSchema>>[],
		HitLocationSubTable[],
		false,
		false,
		true
	>
}

type HitLocationSchema = {
	id: fields.StringField<string, string, true, false, true>
	choice_name: fields.StringField<string, string, true, false, true>
	table_name: fields.StringField<string, string, true, false, true>
	slots: fields.NumberField<number, number, true, false, true>
	hit_penalty: fields.NumberField<number, number, true, false, true>
	dr_bonus: fields.NumberField<number, number, true, false, true>
	description: fields.StringField<string, string, true, false, true>
	owningTableId: fields.StringField<string, string, false, true, true>
	subTableId: fields.StringField<string, string, false, true, true>
}

type HitLocationSubTableSchema = {
	id: fields.StringField<string, string, true, false, true>
	roll: fields.StringField<string, string, true, false, true>
}

// This is the root actor body object.
// It contains flat arrays of hit locations and sub-tables as fields,
// And contains accessors for a hierarchical list of hit locations and sub-tables
class ActorBody extends foundry.abstract.DataModel<ActorGURPS2, ActorBodySchema> {
	static override defineSchema(): ActorBodySchema {
		const fields = foundry.data.fields
		return {
			name: new fields.StringField({
				required: true,
				nullable: false,
				initial: "Humanoid",
				label: "GURPS.HitLocation.Table.FIELDS.Name.Name",
			}),
			roll: new fields.StringField({
				required: true,
				nullable: false,
				initial: "3d6",
				label: "GURPS.HitLocation.Table.FIELDS.Roll.Name",
			}),
			locations: new fields.ArrayField(new fields.EmbeddedDataField(HitLocation), {
				label: "GURPS.HitLocation.Table.FIELDS.Locations.Name",
			}),
			sub_tables: new fields.ArrayField(new fields.EmbeddedDataField(HitLocationSubTable), {
				required: false,
				nullable: false,
				initial: undefined,
			}),
		}
	}

	get actor(): ActorGURPS2 {
		return this.parent
	}

	// Hierarchical list of hit locatios with included sub tables
	get hitLocations(): HitLocation[] {
		return this.locations.filter(e => e.owningTableId === null)
	}

	get owningLocation(): null {
		return null
	}

	// Remove any orphaned sub_tables or locations
	static override cleanData(
		source?: object | undefined,
		options?: Record<string, unknown> | undefined,
	): SourceFromSchema<fields.DataSchema> {
		function addRecursiveLocations(location: DeepPartial<SourceFromSchema<HitLocationSchema>>): void {
			locationsToKeep.push(location)

			if (location.subTableId === null) return
			for (const newLocation of locations.filter(e => e!.owningTableId === location.subTableId)) {
				addRecursiveLocations(newLocation!)
			}
		}
		const bodySource = source as DeepPartial<SourceFromSchema<ActorBodySchema>>

		const subTables = bodySource.sub_tables ?? []
		const locations = bodySource.locations ?? []
		for (const location of locations) {
			if (location!.owningTableId === "") location!.owningTableId = null
			location!.owningTableId ??= null
			location!.subTableId ??= null
		}

		const locationsToKeep: Partial<SourceFromSchema<HitLocationSchema>>[] = []
		for (const location of locations.filter(e => e!.owningTableId === null)) {
			addRecursiveLocations(location!)
		}

		const tablesIdsToKeep = new Set<string>()
		for (const location of locationsToKeep) {
			if (location.owningTableId) tablesIdsToKeep.add(location.owningTableId)
			if (location.subTableId) tablesIdsToKeep.add(location.subTableId)
		}

		bodySource.locations = locationsToKeep
		bodySource.sub_tables = subTables.filter(e => tablesIdsToKeep.has(e!.id!))

		return super.cleanData(bodySource, options)
	}
}

interface ActorBody extends ModelPropsFromSchema<ActorBodySchema> {}

class HitLocation extends foundry.abstract.DataModel<ActorBody, HitLocationSchema> {
	declare rollRange: string

	static override defineSchema(): HitLocationSchema {
		const fields = foundry.data.fields

		return {
			id: new fields.StringField({
				required: true,
				nullable: false,
				initial: "id",
				label: "GURPS.HitLocation.Location.FIELDS.Id.Name",
			}),
			choice_name: new fields.StringField({
				required: true,
				nullable: false,
				initial: "choice name",
				label: "GURPS.HitLocation.Location.FIELDS.ChoiceName.Name",
			}),
			table_name: new fields.StringField({
				required: true,
				nullable: false,
				initial: "table name",
				label: "GURPS.HitLocation.Location.FIELDS.TableName.Name",
			}),
			slots: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				label: "GURPS.HitLocation.Location.FIELDS.Slots.Name",
			}),
			hit_penalty: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				label: "GURPS.HitLocation.Location.FIELDS.HitPenalty.Name",
			}),
			dr_bonus: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				label: "GURPS.HitLocation.Location.FIELDS.DrBonus.Name",
			}),
			description: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.HitLocation.Location.FIELDS.Description.Name",
			}),
			owningTableId: new fields.StringField({ required: false, nullable: true, initial: null }),
			subTableId: new fields.StringField({ required: false, nullable: true, initial: null }),
			// sub_table: new fields.EmbeddedDataField(BodyGURPS, { required: false, nullable: true, initial: null }),
		}
	}

	get actor(): ActorGURPS2 {
		return this.parent.actor
	}

	get owningTable(): ActorBody | HitLocationSubTable {
		if (this.owningTableId === null) return this.parent
		return this.parent.sub_tables.find(e => e.id === this.owningTableId)!
	}

	get subTable(): HitLocationSubTable | null {
		if (!this.subTableId) return null
		return this.parent.sub_tables.find(e => e.id === this.subTableId)!
	}

	get descriptionTooltip(): string {
		return (this.description ?? "").replace(/\n/g, "<br>")
	}

	get trueIndex(): number {
		return this.parent.locations.indexOf(this)
	}

	get first(): boolean {
		if (this.owningTableId === null) return this.trueIndex === 0
		return this.owningTable.hitLocations.indexOf(this) === 0
	}

	get last(): boolean {
		return this.owningTable.hitLocations.indexOf(this) === this.owningTable.hitLocations.length - 1
	}

	updateRollRange(start: number): number {
		switch (this.slots) {
			case 0:
				this.rollRange = "-"
				break
			case 1:
				this.rollRange = `${start}`
				break
			default:
				this.rollRange = `${start}-${start + this.slots - 1}`
		}
		if (this.subTable) this.subTable.updateRollRanges()
		return start + this.slots
	}

	get DR(): Map<string, number> {
		return this._DR()
	}

	_DR(tooltip: TooltipGURPS | null = null, drMap: Map<string, number> = new Map()): Map<string, number> {
		if (this.dr_bonus !== 0) {
			drMap.set(gid.All, this.dr_bonus)
			tooltip?.push(
				game.i18n.format(game.i18n.localize("gurps.tooltip.dr_bonus"), {
					item: this.choice_name,
					bonus: this.dr_bonus.signedString(),
					type: gid.All,
				}),
				"<br>",
			)
		}

		drMap = this.actor.isOfType(ActorType.Character)
			? this.actor.system.addDRBonusesFor(this.id, tooltip, drMap)
			: new Map()
		if (this.owningTable && this.owningTable.owningLocation)
			drMap = this.owningTable.owningLocation._DR(tooltip, drMap)

		if (drMap.size !== 0) {
			const base = drMap.get(gid.All) ?? 0
			const buffer = new StringBuilder()
			for (const k of Array.from(drMap.keys()).sort()) {
				let value = drMap.get(k) ?? 0
				if (!equalFold(gid.All, k)) value += base
				buffer.push(
					game.i18n.format(game.i18n.localize("gurps.tooltip.dr_total"), {
						amount: value,
						type: k,
					}),
					"<br>",
				)
			}
			tooltip?.unshift(buffer.toString())
		}
		return drMap
	}

	get displayDR(): string {
		const drMap = this._DR()
		if (!drMap.has(gid.All)) drMap.set(gid.All, 0)
		const all = drMap.get(gid.All) ?? 0

		const keys: string[] = []
		keys.push(gid.All)
		keys.push(
			...Array.from(drMap.keys())
				.filter(e => e !== gid.All)
				.sort(),
		)
		const buffer = new StringBuilder()
		for (const k of keys) {
			let dr = drMap.get(k) ?? 0
			if (k !== gid.All) dr += all
			if (buffer.length !== 0) buffer.push("/")
			buffer.push(`${dr}`)
		}
		return buffer.toString()
	}

	// Return true if the provided ID is a valid hit location ID
	static validateId(id: string): boolean {
		return id !== gid.All
	}
}

interface HitLocation extends ModelPropsFromSchema<HitLocationSchema> {}

class HitLocationSubTable extends foundry.abstract.DataModel<ActorBody, HitLocationSubTableSchema> {
	static override defineSchema(): HitLocationSubTableSchema {
		const fields = foundry.data.fields

		return {
			id: new fields.StringField({ required: true, nullable: false, initial: generateId }),
			roll: new fields.StringField({
				required: true,
				nullable: false,
				initial: "1d6",
				label: "GURPS.HitLocation.Table.FIELDS.SubRoll.Name",
			}),
		}
	}

	get actor(): ActorGURPS2 {
		return this.parent.actor
	}

	get owningLocation(): HitLocation {
		return this.parent.locations.find(e => e.subTableId === this.id)!
	}

	get hitLocations(): HitLocation[] {
		return this.parent.locations.filter(e => e.owningTableId === this.id)
	}

	get processedRoll(): DiceGURPS {
		return DiceGURPS.fromString(this.roll)
	}

	get trueIndex(): number {
		return this.parent.sub_tables.indexOf(this)
	}

	updateRollRanges(): void {
		let start = this.processedRoll.minimum(false)
		if (this.hitLocations) for (const location of this.hitLocations) start = location.updateRollRange(start)
	}
}

interface HitLocationSubTable extends ModelPropsFromSchema<HitLocationSubTableSchema> {}

export { ActorBody, HitLocation, HitLocationSubTable }
export type { ActorBodySchema, HitLocationSchema, HitLocationSubTableSchema }
