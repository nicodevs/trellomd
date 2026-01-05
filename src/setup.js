import Trello from 'trello'
import { writeFileSync } from 'fs'
import { EOL } from 'os'
import { confirm, intro, cancel, note, group, text, isCancel, multiselect, select, spinner, log, outro } from '@clack/prompts'

function cancelSetup() {
  cancel('Setup cancelled.')
  process.exit(0)
}

async function showIntro() {
  intro('Trello to Markdown')
  note(
    [
      'This wizard will ask you for Trello API keys and configuration.',
      'It will create a trellomd.config.json file in the current directory.',
      'After setup, run this script from the directory where the JSON is located to generate your reports.'
    ].join(EOL),
    'Setup Wizard'
  )

  const shouldContinue = await confirm({ message: 'Do you want to continue?' })

  if (!shouldContinue) {
    cancelSetup()
  }
}

function extractBoardId (url) {
  return url.match(/trello\.com\/b\/([^/]+)/)?.[1]
}

function getTokenUrl(apiKey) {
  return `https://trello.com/1/authorize?expiration=never&response_type=token&key=${apiKey}`
}

async function promptForCredentials() {
  return await group({
    apiKey: () => {
      note(
        ['1. Go to https://trello.com/power-ups/admin', '2. Create a new Power-Up', '3. Generate an API key'].join(EOL),
        'Get your Trello API key:'
      )

      return text({
        message: 'Enter your Trello API key',
        validate: (value) => value?.length ? undefined : 'API key is required'
      })
    },
    apiToken: ({ results }) => {
      note(
        ['1. Go to ' + getTokenUrl(results.apiKey), '2. Click "Allow"', '3. Copy the token'].join(EOL),
        'Get your Trello API token:'
      )

      return text({
        message: 'Enter your token',
        validate: (value) => value?.length ? undefined : 'API token is required'
      })
    },
    boardUrl: () => text({
      message: 'Enter your Trello board URL',
      placeholder: 'https://trello.com/b/BOARD_ID/board-name',
      validate: (value) => !value ? 'Board URL is required' : extractBoardId(value) ? undefined : 'Invalid Trello board URL'
    })
  }, {
    onCancel: cancelSetup
  })
}

async function promptForConfiguration() {
  return await group({
    heading: () => text({
      message: 'Enter a heading for your reports',
      placeholder: 'My Daily Report',
      defaultValue: 'My Daily Report'
    }),
    ignoreArchived: () => confirm({
      message: 'Ignore archived cards?',
      initialValue: true
    }),
    recentActivityHours: () => {
      note(['Each list can be configured to fetch either:', EOL, '- All cards', '- Only cards with recent activity', EOL, 'By default, recent activity means the last 12 hours.'].join(EOL), 'Recent activity configuration')

      return text({
        message:  'How many hours should be considered recent activity?',
        placeholder: '12',
        defaultValue: '12',
        validate: (value) => {
          if (!value) return undefined
          const num = parseInt(value)
          return isNaN(num) ? 'Please enter a valid number' : num < 1 ? 'Must be at least 1 hour' : undefined
        }
      })
    },
  }, {
    onCancel: cancelSetup
  })
}

async function fetchListsFromBoard(apiKey, apiToken, boardId) {
  const s = spinner()
  s.start('Fetching lists from your board')

  try {
    const trello = new Trello(apiKey, apiToken)
    const lists = await trello.getListsOnBoard(boardId)

    s.stop('Lists fetched successfully')

    if (!lists?.length) {
      log.error('No lists found on this board.')
      process.exit(1)
    }

    return lists
  } catch (error) {
    s.stop('Failed to fetch lists')
    log.error(String(error.message || error))
    process.exit(1)
  }
}

async function promptForListSelection(lists) {
  const selectedListIds = await multiselect({
    message: 'Select the lists you want to include in your reports (press Space to select, Enter to submit)',
    options: lists.map(list => ({ value: list.id, label: list.name })),
    required: true
  })

  if (isCancel(selectedListIds)) {
    cancelSetup()
  }

  return lists.filter(list => selectedListIds.includes(list.id))
}

async function promptForListConfiguration(list, additionalConfig) {
  note(list.name, 'Configuring')

  const listConfig = await group({
    mode: () => select({
      message: `Which cards from the "${list.name}" list would you like to include?`,
      options: [
        { value: 'all', label: 'All cards', hint: 'Retrieve all cards from this list' },
        { value: 'withRecentActivity', label: 'Only cards with recent activity', hint: `Updated in the last ${additionalConfig.recentActivityHours} hours` }
      ]
    }),
    title: () => text({
      message: `Custom title for "${list.name}" (optional)`,
      placeholder: list.name,
      defaultValue: ''
    })
  }, {
    onCancel: cancelSetup
  })

  return {
    id: list.id,
    name: list.name,
    mode: listConfig.mode,
    ...(listConfig.title?.trim() && { title: listConfig.title.trim() })
  }
}

async function saveConfiguration(config) {
  try {
    writeFileSync('trellomd.config.json', JSON.stringify(config, null, 2))
    log.info('Configuration saved to trellomd.config.json')
    outro('Run: npx trellomd@latest')
  } catch (error) {
    log.error('Error writing config file: ' + error.message)
    process.exit(1)
  }
}

export async function setup() {
  await showIntro()

  const credentials = await promptForCredentials()
  const additionalConfig = await promptForConfiguration()

  const boardId = extractBoardId(credentials.boardUrl)
  const listsOnBoard = await fetchListsFromBoard(credentials.apiKey, credentials.apiToken, boardId)

  const selectedLists = await promptForListSelection(listsOnBoard)

  log.info('Configure each list:')

  const listConfigs = []
  for (const list of selectedLists) {
    const listConfig = await promptForListConfiguration(list, additionalConfig)
    listConfigs.push(listConfig)
  }

  const config = {
    apiKey: credentials.apiKey,
    apiToken: credentials.apiToken,
    board: boardId,
    heading: additionalConfig.heading,
    ignoreArchived: additionalConfig.ignoreArchived,
    recentActivityHours: parseInt(additionalConfig.recentActivityHours),
    lists: listConfigs
  }

  await saveConfiguration(config)
}
