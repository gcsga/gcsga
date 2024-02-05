import { SYSTEM_NAME } from "@data"

export function registerFonts(): void {
	CONFIG.fontDefinitions["Roboto Flex"] = {
		editor: true,
		fonts: [{ urls: [`systems/${SYSTEM_NAME}/fonts/roboto_flex.ttf`], style: "normal", weight: "100" }],
	}

	CONFIG.fontDefinitions["GCS"] = {
		editor: false,
		fonts: [{ urls: [`systems/${SYSTEM_NAME}/fonts/gcs.woff2`], style: "normal", weight: "400" }],
	}
}
