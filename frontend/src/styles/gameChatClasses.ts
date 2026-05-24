export const gamePageClasses = {
	container: 'flex justify-center items-start pt-1 pb-20 sm:pt-8 sm:pb-8',
} as const;

export const basicChatClasses = {
	container: 'flex flex-col h-full w-full max-w-[320px] overflow-hidden',
	onlinePing:
		'absolute inline-flex h-full w-full animate-ping rounded-full bg-green-700 opacity-75',
	onlineDot: 'relative inline-flex size-3 rounded-full bg-green-600',
	offlineDot: 'relative inline-flex size-3 rounded-full bg-red-500',
	messageText:
		'min-w-0 max-w-full whitespace-pre-wrap wrap-anywhere text-sm leading-snug text-white',
} as const;

export const boardClasses = {
	emptyState: 'w-full max-w-3xl mx-auto px-6 py-10 text-white',
	card:
		'w-full max-w-5xl overflow-x-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl sm:p-6 xl:p-8',
	layout:
		'grid w-full min-w-0 grid-cols-1 items-start justify-items-center gap-6 text-center xl:grid-cols-[1fr_auto_1fr]',
	playArea:
		'flex w-full min-w-0 max-w-96 flex-col items-center xl:col-start-2',
	boardGrid:
		'grid w-full max-w-96 grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-8',
	spectatorArea: 'mt-6 text-white/60 font-medium',
	popupArea: 'w-full min-w-0 max-w-80 xl:col-start-3 xl:justify-self-start',
} as const;

export const endGamePopupClasses = {
	card:
		'flex min-w-80 max-w-[90vw] flex-col items-center gap-4 bg-slate-900 p-8 text-white hover:scale-100',
	title:
		'flex max-w-full items-center justify-center gap-2 text-center text-2xl font-bold',
	winnerName: 'max-w-32 font-bold',
	subtitle: 'text-center text-sm font-medium text-white/70',
	replayActions: 'flex flex-col items-center gap-3',
	replayVotes: 'flex gap-2 text-xs font-bold',
	vote: 'rounded-full border px-3 py-1',
	voteXActive: 'border-cyan-400 text-cyan-400',
	voteOActive: 'border-fuchsia-400 text-fuchsia-400',
	voteInactive: 'border-white/10 text-white/40',
	disabledReplayText: 'text-center text-sm text-white/50',
} as const;

export const gameStatusBannerClasses = {
	error:
		'mb-4 rounded-lg border border-red-400 bg-red-500/20 px-4 py-3 text-red-200',
	disconnect:
		'border border-orange-400 bg-orange-500/20 px-4 py-3 text-orange-100',
} as const;

export const playerCardsClasses = {
	symbolBadge:
		'grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 sm:h-6 sm:w-6',
	symbolIcon: 'h-3.5 w-3.5 stroke-3 sm:h-4 sm:w-4',
	youLabel:
		'absolute inset-x-0 -top-4 text-center text-[10px] font-bold uppercase text-cyan-400 sm:-top-6 sm:text-xs',
	card: 'flex w-24 flex-col items-center p-2 sm:w-28 sm:p-3',
	activeCard: 'ring-2 ring-cyan-400',
	nameRow:
		'mt-2 flex w-full min-w-0 items-center justify-center gap-1 font-bold sm:mt-3',
	name: 'max-w-10 text-[11px] font-bold sm:max-w-14 sm:text-xs',
	container:
		'mb-3 flex w-full max-w-[280px] items-center justify-between text-white sm:mb-8 sm:max-w-96',
	timer:
		'grid size-11 place-items-center rounded-full text-xs font-bold sm:size-16 sm:text-sm',
} as const;

export const spectatorCountClasses = {
	container:
		'mb-2 flex items-center justify-center gap-1 text-xs text-white/60',
} as const;

export const squareClasses = {
	button:
		'aspect-square w-full rounded-xl border border-white/40 bg-white/10 text-7xl font-bold shadow-md active:scale-95 hover:bg-white/20 transition-all flex items-center justify-center',
	value: 'transition-all duration-300',
	xValue: 'text-cyan-400',
	oValue: 'text-fuchsia-400',
	warning: 'opacity-30 scale-75',
	normal: 'opacity-100',
} as const;
