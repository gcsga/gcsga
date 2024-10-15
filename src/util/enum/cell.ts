import { equalFold } from "@module/data/item/components/string-criteria.ts"

export namespace cell {
	export enum Type {
		Text = "text",
		Tags = "tags",
		Toggle = "toggle",
		PageRef = "page_ref",
		Markdown = "markdown",
	}

	export namespace Type {
		export function ensureValid(T: Type): Type {
			if (Types.includes(T)) return T
			return Types[0]
		}

		export function toString(T: Type): string {
			return `GURPS.Enum.cell.${T}`
		}

		export function extractType(s: string): Type {
			for (const one of Types) {
				if (equalFold(one, s)) return one
			}
			return Types[0]
		}
	}
	export const Types: Type[] = [Type.Text, Type.Tags, Type.Toggle, Type.PageRef, Type.Markdown]
}
