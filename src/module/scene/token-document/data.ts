import { SYSTEM_NAME } from "@module/data/constants.ts"

type TokenFlagsGURPS = DocumentFlags & {
	[SYSTEM_NAME]: {
		[key: string]: unknown
	}
	[key: string]: Record<string, unknown>
}

export type { TokenFlagsGURPS }
