from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)
import logging



cardDict = {}

@registerApi('reviewer_next_card')
def getNextScheduledCard(msg):
    """Fetch next scheduled card"""

    typeCheck(msg, {
        'deckName': str,
    })

    with Col() as col:
        deckName = msg['deckName']
        deck = col.decks.byName(deckName)
        col.decks.select(deck['id'])

        card = col.sched.getCard()
        if card is None:
            return emit.emitResult(None)

        answerButtonCount = col.sched.answerButtons(card)

        cardDict[card.id] = card

        return emit.emitResult({
            'cardId': card.id,
            'noteId': card.nid,
            'front': card.q(),
            'back': card.a(),
            'ansButtonCount': answerButtonCount,
        })

@registerApi('reviewer_answer_card')
def answerCard(msg):
    typeCheck(msg, {
        'cardId': int,
        'ease': int,
    })

    cardId, ease = int(msg['cardId']), int(msg['ease'])
    cardId = msg['cardId']
    card = cardDict[cardId]
    ease = int(msg['ease'])

    with Col() as col:
        col.sched.answerCard(card, ease)
        logging.info("Cid[%d] Reviewed with ease %d" % (cardId, ease))
        return emit.emitResult(True)
