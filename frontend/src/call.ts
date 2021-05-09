
let deckListCache: string[] = []

export async function listDeck (): Promise<string[]> {
  if (!deckListCache.length) {
    deckListCache = await ankiCall('deck_list')
  }
  return deckListCache
}

interface KianMainSocket {
  emit (event: string, args: object): void
  on (event: string, callback: (response: any) => any): void
}

let mainSocket: KianMainSocket

/**
 * Set main socket. You can mock ankiCall by registering mock socket with this.
 * @param newSocket Socket to use.
 */
export function setMainSocket (newSocket: KianMainSocket) {
  mainSocket = newSocket
  mainSocket.on('msg', Messagehandler)
}

const syncKeyHeader = Math.random().toString()
let lastSyncKey = 0

/**
 * Create unique message key
 */
function createMessageKey () {
  return `syncKey_${syncKeyHeader}_${lastSyncKey++}`
}

const callbackPromiseTable = new Map()

export default function ankiCall (apiType: string, data?: any) {
  if (!mainSocket) {
    throw new Error('Socket not yet initialized')
  }

  return new Promise<any>((resolve, reject) => {
    const messageKey = createMessageKey()
    callbackPromiseTable.set(messageKey, { resolve, reject })
    mainSocket.emit('msg', {
      apiType,
      syncKey: messageKey,
      ...data
    })
  })
}

interface IResponse {
  syncKey: string
  [key: string]: any
}

function Messagehandler (response: IResponse) {
  const { syncKey } = response
  const callback = callbackPromiseTable.get(syncKey)
  if (!callback) return

  const { resolve, reject } = callback
  callbackPromiseTable.delete(syncKey)

  return response.error
    ? reject(new Error(response.error.toString()))
    : resolve(response.result)
}

interface ICardBrowserInfo {
  id: number
  noteId: number
  deck: string
  model: string
  ord: number
  preview: string
  tags: string[]
  createdAt: number
  updatedAt: number
  due: number
  schedType: SchedType
  suspended: boolean
}

export type CardSortBy = 'id' | 'deck' | 'noteId' | 'model' | 'preview' | 'createdAt' | 'updatedAt' | 'due'
export type CardSortOrder = 'asc' | 'desc'

export async function queryCardIds (param: {
  query: string,
  sortBy?: CardSortBy,
  sortOrder?: CardSortOrder
} = { query: '' }): Promise<number[]> {
  const { query, sortBy, sortOrder } = param
  return ankiCall('browser_query', {
    query: query || '',
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'desc'
  })
}

export async function getCardsBrowserInfo (cardIds: number[]): Promise<ICardBrowserInfo[]> {
  const cards = await ankiCall('browser_get_batch', {
    cardIds
  })
  return cards.map((card: any) => ({
    id: card.id,
    noteId: card.noteId,
    deck: card.deck,
    model: card.model,
    ord: card.ord,
    preview: card.preview,
    tags: card.tags,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    due: card.due,
    schedType:
    (card.schedType === 'new') ? SchedType.New
      : (card.schedType === 'lrn') ? SchedType.Learn
        : (card.schedType === 'rev') ? SchedType.Review
          : SchedType.NotScheduled,
    suspended: card.suspended
  }))
}

interface ReviewEntryInfo {
  cardId: number
  noteId: number
  front: string
  back: string
  ansButtonCount: number
  remaining: DeckDue
}

export function getReviewerNextEntry(deckName: string): Promise<ReviewEntryInfo | null> {
  return ankiCall('reviewer_next_entry', { deckName })
}

export function reviewerShuffle() {
  return ankiCall('reviewer_reset')
}
