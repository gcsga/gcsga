import { ActorGURPS } from "@actor"
import { gid } from "@data"
import { DiceGURPS } from "@module/dice/index.ts"
import { equalFold } from "@module/util/index.ts"
import { LaxSchemaField } from "@system/schema-data-fields.ts"
import { LocalizeGURPS, StringBuilder, TooltipGURPS } from "@util"
import { BodySchema, HitLocationSchema } from "./data.ts"

class HitLocation extends foundry.abstract.DataModel<ActorGURPS, HitLocationSchema> {

	protected declare static _schema: LaxSchemaField<HitLocationSchema> | undefined

	declare rollRange: string
	declare owningTable: BodyGURPS | null

	static override	defineSchema(): HitLocationSchema {
		const fields = foundry.data.fields

		return {
			id: new fields.StringField({ initial: LocalizeGURPS.translations.gurps.placeholder.hit_location.id }),
			choice_name: new fields.StringField({ initial: LocalizeGURPS.translations.gurps.placeholder.hit_location.choice_name }),
			table_name: new fields.StringField({ initial: LocalizeGURPS.translations.gurps.placeholder.hit_location.table_name }),
			slots: new fields.NumberField({ initial: 0 }),
			hit_penalty: new fields.NumberField({ initial: 0 }),
			dr_bonus: new fields.NumberField({ initial: 0 }),
			description: new fields.StringField({ nullable: true }),
			sub_table: new fields.ObjectField({ required: false })
		}
	}

	constructor(
		data: DeepPartial<SourceFromSchema<HitLocationSchema>>,
		options?: DataModelConstructionOptions<ActorGURPS>
	) {
		super(data, options)
		if (data.sub_table) {
			const sub_table = data.sub_table as SourceFromSchema<BodySchema>
			this.sub_table = new BodyGURPS(sub_table, { owningLocation: this })
		}
	}

	get descriptionTooltip(): string {
		return (this.description ?? "").replace(/\n/g, "<br>")
	}


	get actor(): ActorGURPS {
		return this.parent
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
		if (this.sub_table) this.sub_table.updateRollRanges()
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

		drMap = this.actor.addDRBonusesFor(this.id, tooltip, drMap)
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

	static createInstance(): HitLocation {
		return new HitLocation({})
	}
}

interface HitLocation
	extends foundry.abstract.DataModel<ActorGURPS, HitLocationSchema>, Omit<ModelPropsFromSchema<HitLocationSchema>, "sub_table"> {
	sub_table: BodyGURPS | null
	get schema(): LaxSchemaField<HitLocationSchema>;
}

class BodyGURPS extends foundry.abstract.DataModel<ActorGURPS, BodySchema> {

	protected declare static _schema: LaxSchemaField<BodySchema> | undefined

	declare owningLocation: HitLocation | null

	static override defineSchema(): BodySchema {
		const fields = foundry.data.fields

		return {
			name: new fields.StringField({ initial: null }),
			roll: new fields.StringField({ initial: "1d" }),
			locations: new fields.ArrayField(new fields.SchemaField(HitLocation.defineSchema()))

		}
	}

	constructor(data: DeepPartial<SourceFromSchema<BodySchema>>, options?: BodyConstructionOptions) {
		super(data, options)
		this.owningLocation = options?.owningLocation ?? null
	}

	get actor(): ActorGURPS {
		return this.parent
	}

	get processedRoll(): DiceGURPS {
		return new DiceGURPS(this.roll)
	}

	updateRollRanges(): void {
		let start = this.processedRoll.minimum(false)
		if (this.locations) for (const location of this.locations) start = location.updateRollRange(start)
	}

	static createInstance(): BodyGURPS {
		return new BodyGURPS({}, {})
	}
}

interface BodyGURPS extends foundry.abstract.DataModel<ActorGURPS, BodySchema>, Omit<ModelPropsFromSchema<BodySchema>, "locations"> {
	locations: Array<HitLocation>

	get schema(): LaxSchemaField<BodySchema>;
}


interface BodyConstructionOptions extends DataModelConstructionOptions<ActorGURPS> {
	owningLocation?: HitLocation | null
}

export { BodyGURPS, HitLocation }

