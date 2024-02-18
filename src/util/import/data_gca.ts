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
	_count: number
}

type GCAImageRef = {
	filename: string
	fullfilename: string
	purpose?: string
	image?: string
}

type GCABonusClassesBlock = {
	bonusclass: GCABonusClass[]
	_count: number
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
	_count: number
}

type GCAFlagSymbol = {
	name: string
	filename: string
	criteria: string
	image: string
}

type GCASymbolsBlock = {
	symbol: GCAFlagSymbol[]
	_count: number
}

type GCAMessagesBlock = {
	message: GCAMessage[]
	_count: number
}

type GCAMessage = {
	caption: string
	text: string
}

type GCAExtendedTagsBlock = {
	extendedtag: GCAUnknownTag[]
	_count: number
}

type GCAUnknownTag = {
	tagname: string
	tagvalue: string
}

type GCABonusesBlock = {
	bonus: GCABonus[]
	_count: number
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
	_count: number
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
	_count: number
}

type GCALayerItem = {
	itemname: string
	isinnate: boolean
	countaslayer: boolean
	isflexible: boolean
	_idkey: number
}

type GCACategoriesBlock = {
	category: GCACategory[]
	_count: number
}

type GCACategory = {
	name: string
	code?: string
	itemtype: string
}

type GCAModifiersBlock = {
	modifier: GCAModifier[]
	_count: number
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

	_idkey: number
}

type GCAAttackModesBlock = {
	attackmode: GCAAttackMode[]
	_count: number
}

type GCAAttackMode = {
	name?: string
	acc?: string
	armordivisor?: string
	break?: string
	bulk?: string
	damage?: string
	damtype?: string
	dmg?: string
	lc?: string
	minst?: string
	notes?: string
	parry?: string
	rangehalfdam?: string
	rangemax?: string
	radius?: string
	rcl?: string
	reach?: string
	rof?: string
	shots?: string
	skillused?: string
	stcap?: string

	scopeacc?: string
	malf?: string

	damagebasedon?: string
	minstbasedon?: string
	reachbasedon?: string
	damageistext?: string

	characc?: string
	chararmordivisor?: string
	charbreak?: string
	charbulk?: string
	chardamage?: string
	chardamtype?: string
	chareffectivest?: string
	charminst?: string
	charparry?: string
	charparryscore?: string

	charblockscore?: string

	charradius?: string
	charrangehalfdam?: string
	charrangemax?: string
	charrcl?: string
	charreach?: string
	charrof?: string
	charshots?: string
	charskillscore?: string
	charskillused?: string

	charskillusedkey?: string

	charscopeacc?: string
	charmalf?: string

	uses?: string
	uses_sections?: string
	uses_used?: string
	uses_settings?: string

	itemnotes?: string

	vttmodenotes?: string

	rollto?: string
	rolltophrase?: string

	minimode_damage?: string
	minimode_damtype?: string
	minimode_armordivisor?: string
	minimode_radius?: string
}

type GCATrait = {
	name: string
	nameext?: string
	symbol?: string
	parentkey?: string
	childkeylist?: string
	cat?: string
	tl?: string
	bonuslist?: string
	conditionallist?: string
	needscheck?: boolean
	taboofailed?: boolean
	points?: number
	score?: number
	type?: string
	level?: number
	step?: string
	stepoff?: string
	cost?: number
	count?: number
	weight?: number
	parrylevel?: number
	blocklevel?: number
	hide?: string
	lock?: string

	displaynameformula?: string
	vars?: string

	calcs: {
		cost?: string
		sd?: string
		deflevel?: string
		deffrom?: string
		deffromid?: string
		pointmult?: string
		levelmult?: string
		syslevels?: string
		bonuslevels?: string
		extralevels?: string
		baselevel?: string
		basepoints?: string
		multpoints?: string
		appoints?: string
		premodspoints?: string

		preformulacost?: string
		preformulaweight?: string
		postformulacost?: string
		postformulaweight?: string
		prechildrencost?: string
		prechildrenweight?: string

		childpoints?: string
		baseappoints?: string
		defpoints?: string
		extrapoints?: string
		basecost?: string
		baseweight?: string
		childrencosts?: string
		childrenweights?: string
		precountcost?: string
		precountweight?: string
		premodscost?: string
		basevalue?: string
		maxscore?: string
		minscore?: string
		up?: string
		down?: string
		step?: string
		round?: string
		basescore?: string
		parryat?: string
		blockat?: string
		upto?: string
		downto?: string
		levelnames?: string

		baseweightconverted?: string
		baseweightunconverted?: string
		charammo?: string
		charammounits?: string
	}

	weaponmodesdata?: {
		mode?: string
		damage?: string
		damtype?: string
		dmg?: string
		reach?: string
		parry?: string
		minst?: string
		skillused?: string
		acc?: string
		rangehalfdam?: string
		rangemax?: string
		rof?: string
		rcl?: string
		shots?: string
		armordivisor?: string
		break?: string
		radius?: string
		bulk?: string
		damagebasedon?: string
		minstbasedon?: string
		reachbasedon?: string
		damageistext?: string
		calcrange?: string
		chardamage?: string
		chardamtype?: string
		charreach?: string
		charparry?: string
		charminst?: string
		charskillused?: string
		charskillscore?: string
		charparryscore?: string
		characc?: string
		charrangehalfdam?: string
		charrangemax?: string
		charrof?: string
		charrcl?: string
		charshots?: string
		chararmordivisor?: string
		charbreak?: string
		charradius?: string
		chareffectivest?: string

		charbulk?: string
		stcap?: string
	}

	armordata?: {
		dr?: string
		chardr?: string
		db?: string
		chardb?: string

		chardeflect?: number
		charfortify?: number

		location?: string

		coverage?: string
		charlocation?: string
		locationcoverage?: string

		aa?: string

		drnotes?: string
	}

	ref?: {
		basedon?: string
		page?: string
		itemnotes?: string
		usernotes?: string
		familiarities?: string
		notes?: string
		description?: string

		units?: string

		shortcat?: string
		prereqcount?: string
		magery?: string
		class?: string
		time?: string
		duration?: string
		castingcost?: string

		countasneed?: string
		ident?: string

		needs?: string
		gives?: string
		conditional?: string
		taboo?: string
		default?: string
		mods?: string
		initmods?: string
		techlvl?: string
		load?: string
		lc?: string
		ndl?: string

		highlight?: string
		highlightme?: string
		hideme?: string
		collapse?: string
		collapseme?: string

		keep?: string
		owned?: string
		locked?: string
		owns?: string
		pkids?: string

		gms?: string
		mainwin?: string
		display?: string
		isparent?: string
		noresync?: string
		disadat?: string

		brokenlinks?: string
		linked?: string
		linkedname?: string
		linkedfrom?: string
		linkedfromnames?: string

		weightcapacity?: string
		weightcapacitylevel?: string
		overweightcapacity?: string
		overweightcapacityby?: string
		countcapacity?: string
		countcapacitylevel?: string
		overcountcapacity?: string
		overcountcapacityby?: string

		childcapacity?: string
		childcapacitylevel?: string
		overchildcapacity?: string
		overchildcapacityby?: string

		charunits?: string
		weightcapacityunits?: string
		charweightcapacity?: string
		charweightcapacityunits?: string

		vttnotes?: string

		appliedsymbols?: string
	}

	attackmodes?: GCAAttackModesBlock

	extended?: GCAExtendedTagsBlock

	modifiers?: GCAModifiersBlock
	bonuses?: GCABonusesBlock
	conditionals?: GCABonusesBlock

	_type: string
	_idkey: string
}

type GCATraitBlock = {
	trait?: GCATrait[]
	_count: number
}

type GCAItemBlock = {
	item?: GCAItem[]
	_count: number
}

type GCAItem = {
	name: string
	_idkey: number
}

type GCALoadout = {
	name: string
	bodyimagefile?: string
	weight: number
	shielddb: number
	hexmask: string
	alwaysautocalcarmor?: string
	userorderedlayers?: string
	facingdb: {
		leftflank: number
		leftfront: number
		centerfront: number
		rightfront: number
		rightflank: number
		rear: number
	}
	items: GCAItemBlock
	armoritems: GCAItemBlock
	shielditems: GCAItemBlock

	orderedlayers?: GCAOrderedLayers

	body?: GCABody
	hitlocationtable?: GCAHitLocationTable
}

type GCATransform = {
	name: string
	points: number
	items: GCAItemBlock
}

type GCALogEntryBlock = {
	logentry: GCALogEntry[]
	_count: number
}

type GCALogEntry = {
	entrydate: string
	campaigndate: string
	charpoints: number

	charmoney?: number

	caption: string
	notes: string
}

type GCABasicDamage = {
	st: boolean
	thbase: string
	thadd: string
	swbase: string
	swadd: string
}

type GCADamageBreak = {
	break: boolean
	addice: boolean
	subtract: boolean
}

type GCASkillType = {
	name: string
	costs: string
	baseadj: boolean
	adds: number
	defaultstat: string
	relname: string
	zeropointsokay: number
	subzero: number
}

type GCAGroup = {
	name: string
	groupitem: GCAGroupItem[]
	_count: number
}

type GCAGroupItem = {
	name: string
	nameext?: string
	itemtype: string
}

type GCACharacter = {
	author?: {
		name?: string
		version?: string
		copyright?: string
		datecreated?: string
	}
	system: {
		version: string
		lastkey: number
	}
	library?: {
		name: string
		book: string[]
	}
	settings?: {
		ruleof?: number
		globalruleof?: number
		modmultpercents?: number
		usediceaddsconversion?: number
		allownoniqoptspecs?: number
		allowstackingdeflect?: number
		allowstackingfortify?: number
		inplay?: number
		showcharactertraitsymbols?: number

		rendernonloadoutitemsinactive?: number
		grayoutinactiveitems?: number

		includeunassigneditemsincurrentloadout?: number

		nodefaultleveldiscount?: number

		allowusertraitordering?: number

		flagoverspentskills?: number

		applydbtoactivedefenses?: number

		traitgrouping?: GCATraitGroupingBlock
	}

	name: string
	player?: string
	bodytype: string
	bodyimagefile?: string
	bodyimage?: string
	currentloadout: string
	currenttransform?: string

	output?: {
		sheetviewsheet?: string
		charactersheet?: string
		altcharactersheet?: string
		exportsheet?: string
		altexportsheet?: string
	}

	vitals?: {
		race?: string
		height?: string
		weight?: string
		age?: string
		appearance?: string
		portraitfile?: string
		portraitimage?: string
	}

	basicdefense?: {
		parryidkey: number
		parryusing: string
		parryscore: number
		blockidkey: number
		blockusing: string
		blockscore: number
	}

	description?: string
	note?: string

	body?: GCABody
	hitlocationtable?: GCAHitLocationTable

	tags?: GCAExtendedTagsBlock
	messages?: GCAMessagesBlock

	traits: {
		attributes: GCATraitBlock
		cultures: GCATraitBlock
		languages: GCATraitBlock
		advantages: GCATraitBlock
		disadvantages: GCATraitBlock
		quirks: GCATraitBlock
		perks: GCATraitBlock
		features: GCATraitBlock
		skills: GCATraitBlock
		spells: GCATraitBlock
		equipment: GCATraitBlock
		templates: GCATraitBlock
	}

	loadouts: {
		loadout?: GCALoadout[]
		_count: number
	}

	transforms?: {
		transform: GCATransform[]
		_count: number
	}

	campaign: {
		name: string
		basetl: number
		basepoints: number
		disadlimit: number
		quirklimit: number
		hasdisadlimit: boolean
		hasquirklimit: boolean
		loggedpoints: number
		otherpoints: number
		totalpoints: number

		loggedmoney?: number
		othermoney?: number
		totalmoney?: number

		logentries: GCALogEntryBlock
	}

	basicdamages: {
		basicdamage: GCABasicDamage[]
		_count: number
	}

	damagebreaks: {
		damagebreak?: GCADamageBreak[]
		_count: number
	}

	skilltypes: {
		skilltype: GCASkillType[]
		_count: number
	}

	groups: {
		group: GCAGroup[]
		_count: number
	}

	categories?: GCACategoriesBlock

	symbols?: GCASymbolsBlock

	bonusclasses?: GCABonusClassesBlock

	bodyimagestore?: GCAImageStore
}

type gca5 = {
	character: GCACharacter[]
}

export type {
	GCAHitLocationTable,
	GCAHitLocationLine,
	GCAHitLocationNote,
	GCAImageStore,
	GCAImageRef,
	GCABonusClassesBlock,
	GCABonusClass,
	GCAGroupingOptions,
	GCATraitGroupingBlock,
	GCAFlagSymbol,
	GCASymbolsBlock,
	GCAMessagesBlock,
	GCAMessage,
	GCAExtendedTagsBlock,
	GCAUnknownTag,
	GCABonusesBlock,
	GCABonus,
	GCABody,
	GCABodyItem,
	GCAOrderedLayers,
	GCALayerItem,
	GCACategoriesBlock,
	GCACategory,
	GCAModifiersBlock,
	GCAModifier,
	GCAAttackModesBlock,
	GCAAttackMode,
	GCATrait,
	GCATraitBlock,
	GCAItemBlock,
	GCAItem,
	GCALoadout,
	GCATransform,
	GCALogEntryBlock,
	GCALogEntry,
	GCABasicDamage,
	GCADamageBreak,
	GCASkillType,
	GCAGroup,
	GCAGroupItem,
	GCACharacter,
	gca5,
}
