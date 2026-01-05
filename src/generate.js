import Trello from 'trello'
import { uniq, compact } from 'lodash-es'
import { EOL } from 'os'
import { validateConfig } from './config-schema.js'

async function fetchCardsWithRecentActivity(trello, config, lists) {
  const yesterday = new Date()
  yesterday.setHours(yesterday.getHours() - config.recentActivityHours || 12)

  const actions = await trello.makeRequest('get', `/1/boards/${config.board}/actions`, {
    since: yesterday.toISOString(),
    limit: 1000
  })

  const ids = uniq(compact(actions.map(action => action.data?.card?.id)))
  const cards = await Promise.all(
    ids.map(id => trello.makeRequest('get', `/1/cards/${id}`, { attachments: true }))
  )

  return Object.fromEntries(
    lists.map(list => [
      list.id,
      cards.filter(card => card.idList === list.id)
    ])
  )
}

async function fetchCardsFromLists(trello, lists) {
  return Object.fromEntries(
    await Promise.all(
      lists.map(async list => [
        list.id,
        await trello.makeRequest('get', `/1/lists/${list.id}/cards`, { attachments: true })
      ])
    )
  )
}

function parseGitHubAttachments(card) {
  if (!card.attachments) return ''

  const attachments = card.attachments
    .filter(attachment => attachment.url?.startsWith('https://github.com/'))
    .map(attachment => {
      if (attachment.url.includes('/pull/')) return '[PR #' + attachment.url.split('/pull/')[1] + '](' + attachment.url + ')'
      if (attachment.url.includes('/commit/')) return '[Commit](' + attachment.url + ')'
    })

  return attachments.length ? ' - ' + attachments.join(', ') : ''
}

function generateMarkdown(config, list, cards) {
  const openCards = config.ignoreArchived ? cards.filter(card => !card.closed) : cards
  const section = openCards.length ? openCards.map(card => '- ' + card.name + parseGitHubAttachments(card)).join(EOL) : 'None'
  return ('*' + (list.title ?? list.name) + '*') + EOL + EOL + section
}

export async function generate(configPath) {
  let rawConfig

  try {
    const configModule = await import(configPath, { with: { type: 'json' } })
    rawConfig = configModule.default
  } catch {
    console.error('Error: Could not find or parse configuration file.')
    process.exit(1)
  }

  const config = validateConfig(rawConfig)
  const trello = new Trello(config.apiKey, config.apiToken)

  const listsWithAllCards = await fetchCardsFromLists(trello, config.lists.filter(list => list.mode === 'all'))
  const listsWithRecentActivity = await fetchCardsWithRecentActivity(trello, config, config.lists.filter(list => list.mode === 'withRecentActivity'))

  const markdown = config.lists.map(list => {
    const bag = list.mode === 'all' ? listsWithAllCards : listsWithRecentActivity
    return generateMarkdown(config, list, bag[list.id])
  })

  console.log([config.heading, ...markdown].join(EOL + EOL))
}
