import { SYSTEM_NAME } from "@module/data/index.ts"

interface SceneFlagsGURPS extends DocumentFlags {
	[SYSTEM_NAME]: {
		[key: string]: unknown
	}
}

export type { SceneFlagsGURPS }
