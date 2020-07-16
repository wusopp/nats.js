/*
 * Copyright 2020 The NATS Authors
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* jslint node: true */
'use strict'

// change '../' to 'nats' when copying
const nats = require('../')
const argv = require('minimist')(process.argv.slice(2))

const url = argv.s || nats.DEFAULT_URI
const creds = argv.creds
const subject = argv._[0]

if (!subject) {
  console.log('Usage: bulk-sub  [-s server] [--creds=filepath] <subject>')
  process.exit()
}

// Connect to NATS server.
const opts = nats.creds(creds) || {}
opts.yieldTime = 1000
const nc = nats.connect(url, opts)
  .on('connect', () => {
    console.log('connected');
    (async () => {
      let i = 0
      nc.subscribe(subject, (msg) => {
        i++
        if (i % 1000 === 0) {
          console.info(`> ${i} messages`)
        }
      })
    })()
  })

nc.on('close', () => {
  console.log('client closed')
})

nc.on('error', (e) => {
  console.log('Error [' + nc.currentServer + ']: ' + e)
  process.exit()
})
