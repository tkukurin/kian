
let deckListCache: string[] = []

export async function listDeck() : Promise<string[]> {
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

interface NoteDef {
  deck: string
  model: string       // I think Basic or Cloze (case-sensitive!)
  fields: string[]    // front and back of the card
  tags: string[]      // normal list[str]
}

export interface Card {
  id: number
  noteId: number

  deck: string
  model: string
  fieldFormats: FieldFormat[]
  fields: string[]
  tags: string[]
}

export enum SchedType {
  New,
  Learn,
  Review,
  NotScheduled
}

export async function hasDeck(deckName: string) {
  const deckList = await listDeck()
  return deckList.indexOf(deckName) !== -1;
}

export async function addDeck(deckName: string) {
  if (await hasDeck(deckName)) return false
  await ankiCall('deck_add', { deckName });
  return true
}

export async function addNote(noteDef: NoteDef) {
  const { deck, model, fields, tags } = noteDef;
  await hasDeck(deck) || await addDeck(deck);
  return ankiCall('note_add', {
    deck,
    model,
    fields,
    tags
  });
}

/**
 * Make single/multiple items to array.
 *
 * @export
 * @template T
 * @param {(T[] | T)} items Either single item or multiple items
 * @returns {[T[], boolean]} If single items were given, return ([item], false). Else return (item, true)
 */
export function pluralize<T> (items: T[] | T): [T[], boolean] {
  if (items instanceof Array) return [items, true]
  else return [[items], false]
}

/**
 * Inverse function of `pluralize`
 */
export function unpleuralize<T> (items: T[], wasPleural: boolean): T[] | T {
  if (wasPleural) {
    return items
  } else {
    if (items.length !== 1) {
      console.warn('unpleuralizing with non-length-1 array')
    }
    return items[0]
  }
}
export async function rmCard (cardIds: number[] | number) {
  cardIds = pluralize(cardIds)[0]
  return ankiCall('card_delete_batch', { cardIds })
}

