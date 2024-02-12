type GCAHitLocationTable = {
	name: string
	description?: string
	hitlocationline?: GCAHitLocationLine[]
	hitlocationnote?: GCAHitLocationNote[]
}

type GCAHitLocationLine = {
	roll: string
	location: string
	penalty?: string
	notes?: string
}

type GCAHitLocationNote = {
	key: string
	value: string
}

type GCAImageStore = {
	imageref?: GCAImageRef[]
	count: number
}

type GCAImageRef = {
	filename: string
	fullfilename: string
	purpose?: string
	image?: string
}

type GCABonusClassesBlock = {
	bonusclass: GCABonusClass[]
	count: number
}

type GCABonusClass = {
	name: string
	affects?: string
	stacks?: string
	upto?: string
	downto?: string
	uptoisset?: number
	downtoisset?: number
	best?: string
	worst?: string
}

type GCAGroupingOptions = {
	traittype: string
	groupingtype: string
	specifiedtag: string
	includetagpartinheader: string
	specifiedvaluesonly: string
	specifiedvalueslist: string
	groupsatend: string
	treataslist?: string
}

type GCATraitGroupingBlock = {
	groupingoptions: GCAGroupingOptions[]
	count: number
}

type GCAFlagSymbol = {
	name: string
	filename: string
	criteria: string
	image: string
}

type GCASymbolsBlock = {
	symbol: GCAFlagSymbol[]
	count: number
}

type GCAMessagesBlock = {
	message: GCAMessage[]
	count: number
}

type GCAMessage = {
	caption: string
	text: string
}

type GCAExtendedTagsBlock = {
	extendedtag: GCAUnknownTag[]
	count: number
}

type GCAUnknownTag = {
	tagname: string
	tagbalue: string
}

type GCABonusesBlock = {
	bonus: GCABonus[]
	count: number
}

type GCABonus = {
	targetprefix?: string
	targetname: string
	targettext?: string
	targetttag?: string
	targettype: string
	affects: string
	bonuspart: string
	bonustype: string
	fullbonustext: string
	upto?: string
	value: number
	stringvalue?: string
	stringvaluetext?: string
	notes?: string
	listas?: string
	unnless?: string
	onlyif?: string
	classes?: string
	fromname?: string
	fromtype?: string
	fromprefix?: string
	fromtext?: string
	fromtag?: string
}

type GCABody = {
	name?: string
	description?: string
	bodyitem: GCABodyItem[]
	count: number
}

type GCABodyItem = {
	name: string
	cat: string
	group: string
	basedb: string
	basedr: string
	basehp: string
	display: boolean // TODO: byte, check
	posx: number
	posy: number
	width?: number
	height?: number
	expanded: boolean
	layers: number
	db: string
	dr: string
	hp: string
}

type GCAOrderedLayers = {
	layeritem: GCALayerItem[]
	count: number
}

type GCALayerItem = {
	itemname: string
	isinnate: boolean
	countaslayer: boolean
	isflexible: boolean
	idkey: number
}

type GCACategoriesBlock = {
	category: GCACategory[]
	count: number
}

type GCaCategory = {
	name: string
	code?: string
	itemtype: string
}

type GCAModifiersBlock = {
	modifier: GCAModifier[]
	count: number
}

type GCAModifier = {
	name: string
	nameext?: string
	group: string
	cost: string
	formula?: string
	forceformula?: string
	level: number
	premodsvalue: string
	value: string
	valuenum: string

	gives?: string
	conditional?: string
	round?: string
	shortname?: string
	page?: string
	mods?: string
	tier?: string
	upto?: string
	levelname?: string
	description?: string

	extended?: GCAExtendedTagsBlock

	modifiers?: GCAModifiersBlock
	bonuses?: GCABonusesBlock
	conditionals?: GCABonusesBlock
}
