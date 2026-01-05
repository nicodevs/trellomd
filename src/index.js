#!/usr/bin/env node

import { existsSync } from 'fs'
import { resolve } from 'path'
import { generate } from './generate.js'
import { setup } from './setup.js'

const configPath = resolve('./trello-to-markdown.config.json')

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
