#!/usr/bin/env node

import { existsSync } from 'fs'
import { generate } from './generate.js'
import { setup } from './setup.js'

const configPath = './trello-to-markdown.config.json'

if (!existsSync(configPath)) {
  setup().catch(error => {
    console.error('An error occurred: ' + error.message)
    process.exit(1)
  })
} else {
  generate(configPath).catch(error => {
    console.error('An error occurred: ' + error.message)
    process.exit(1)
  })
}
