#!/usr/bin/env node

import Trello from 'trello';
import { uniq, compact } from 'lodash-es';
import { EOL } from 'os';
import rawConfig from './config.json' with { type: 'json' };
import { validateConfig } from './config-schema.js';

const config = validateConfig(rawConfig);

const API_KEY = process.env.TRELLO_API_KEY;
const API_TOKEN = process.env.TRELLO_API_TOKEN;
const BOARD_ID = process.env.TRELLO_BOARD_ID;

if (!API_KEY || !API_TOKEN || !BOARD_ID) {
  console.error('Error: Missing required environment variables.');
  process.exit(1);
}

const trello = new Trello(API_KEY, API_TOKEN);

async function fetchCardsWithRecentActivity(lists) {
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - config.recentActivityHours || 12);

  const actions = await trello.makeRequest('get', `/1/boards/${BOARD_ID}/actions`, {
    since: yesterday.toISOString(),
    limit: 1000
  });

  const ids = uniq(compact(actions.map(action => action.data?.card?.id)));
  const cards = await Promise.all(
    ids.map(id => trello.makeRequest('get', `/1/cards/${id}`, { attachments: true }))
  );

  return Object.fromEntries(
    lists.map(list => [
      list.name,
      cards.filter(card => card.idList === list.id)
    ])
  );
}

async function fetchCardsFromLists(lists) {
  return Object.fromEntries(
    await Promise.all(
      lists.map(async list => [
        list.name,
        await trello.makeRequest('get', `/1/lists/${list.id}/cards`, { attachments: true })
      ])
    )
  );
}

function parseGitHubAttachments(card) {
  if (!card.attachments) return '';

  const attachments = card.attachments
    .filter(attachment => attachment.url?.startsWith('https://github.com/'))
    .map(attachment => {
      if (attachment.url.includes('/pull/')) return '[PR #' + attachment.url.split('/pull/')[1] + '](' + attachment.url + ')';
      if (attachment.url.includes('/commit/')) return '[Commit](' + attachment.url + ')';
    });

  return attachments.length ? ' - ' + attachments.join(', ') : '';
}

function generateMarkdown(list, cards) {
  const openCards = config.ignoreArchived ? cards.filter(card => !card.closed) : cards;
  const section = openCards.length ? openCards.map(card => '- ' + card.name + parseGitHubAttachments(card)).join(EOL) : 'None';
  return ('*' + (list.title ?? list.name) + '*') + EOL + EOL + section;
}

async function main() {
  const listsOnBoard = await trello.getListsOnBoard(BOARD_ID);

  const reportLists = listsOnBoard.map(list => ({
    id: list.id,
    name: list.name,
    mode: config.lists.find(target => target.name === list.name)?.mode
  })).filter(list => list.mode);

  if (!reportLists.length) {
    console.error('Error: The board does not contain any of the specified lists.');
    process.exit(1);
  }

  const listsWithAllCards = await fetchCardsFromLists(reportLists.filter(list => list.mode === 'all'));
  const listsWithRecentActivity = await fetchCardsWithRecentActivity(reportLists.filter(list => list.mode === 'withRecentActivity'));

  const markdown = config.lists.map(target => {
    const bag = target.mode === 'all' ? listsWithAllCards : listsWithRecentActivity;
    return generateMarkdown(target, bag[target.name]);
  });

  console.log([config.heading, ...markdown].join(EOL + EOL));
}

main();
