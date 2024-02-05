import { SYSTEM_NAME } from "@data"
import { CharacterGURPS } from "./document.ts"
import { LocalizeGURPS } from "@util"
import { PointsRecord } from "./data.ts"
import { DateTimeFormatOptions } from "luxon"

interface PointsRecordSheetData<TActor extends CharacterGURPS> extends FormApplicationData<TActor> {
	actor: TActor["_source"]
	system: TActor["system"]
}

interface PointRecordSheet<TActor extends CharacterGURPS, TOptions extends FormApplicationOptions>
	extends FormApplication<TActor> {
	object: TActor
}

class PointRecordSheet<
	TActor extends CharacterGURPS,
	TOptions extends FormApplicationOptions,
> extends FormApplication<TActor> {
	constructor(object: TActor, options?: Partial<TOptions>) {
		super(object, options)
		this.object = object
	}

	static override get defaultOptions(): FormApplicationOptions {
		return fu.mergeObject(super.defaultOptions, {
			classes: ["form", "points-sheet", "gurps"],
			template: `systems/${SYSTEM_NAME}/templates/actor/character/points-record.hbs`,
			width: 520,
			resizable: true,
			submitOnChange: false,
			submitOnClose: false,
			closeOnSubmit: true,
		})
	}

	override get title(): string {
		return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.character.points_record.title, {
			name: this.object.name,
		})
	}

	override getData(options: Partial<TOptions>): PointsRecordSheetData<TActor> {
		super.getData(options)
		const actor = this.object

		return {
			options: options,
			actor: actor.toObject(),
			system: actor.system,
		}
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find(".add").on("click", event => this._onAdd(event))
		html.find(".delete").on("click", event => this._onDelete(event))
	}

	async _onAdd(event: JQuery.ClickEvent): Promise<number> {
		event.preventDefault()
		event.stopPropagation()
		const list = this.object.system.points_record
		const date = new Date().toISOString()
		list.unshift({
			when: date,
			points: 0,
			reason: "",
		})
		await this.object.update({ "system.points_record": list })
		await this.render()
		return list.length
	}

	async _onDelete(event: JQuery.ClickEvent): Promise<PointsRecord> {
		event.preventDefault()
		const list = this.object.system.points_record
		const index = parseInt($(event.currentTarget).data("index"))
		const deleted = list.splice(index, 1)
		await this.object.update({ "system.points_record": list })
		await this.render()
		return deleted[0]
	}

	protected async _updateObject(_event: Event, formData: Record<string, unknown>): Promise<unknown> {
		if (!this.object.id) return
		const data: Record<string, unknown> = {}
		const record: PointsRecord[] = this.object.system.points_record
		for (const k of Object.keys(formData)) {
			const index: number = parseInt(k.split(".")[0])
			const field: keyof PointsRecord = k.split(".")[1] as keyof PointsRecord
			let value = formData[k] as string | number
			if (field === "when") {
				const date = new Date(value)
				const options: DateTimeFormatOptions = {
					dateStyle: "medium",
					timeStyle: "short",
				}
				options.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
				value = date.toLocaleString("en-US", options).replace(" at", ",")
			}
			if (record[index]) record[index] = { ...record[index], [field]: value }
		}
		data["system.points_record"] = record
		data["system.total_points"] = record.reduce((partialSum, a) => partialSum + a.points, 0)

		await this.object.update(data)
		return this.render()
	}

	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
		const all_buttons: ApplicationHeaderButton[] = [
			{
				label: "",
				class: "apply",
				icon: "gcs-checkmark",
				onclick: (event: Event) => this._onSubmit(event),
			},
			...super._getHeaderButtons(),
		]
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-not"
		return all_buttons
	}
}

export { PointRecordSheet }
