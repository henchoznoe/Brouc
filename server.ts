/**
 * File: server.ts
 * Description: Custom Node.js server wrapping Next.js + Socket.io.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'
import { setupSocketHandlers } from './lib/socket/server'
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './lib/socket/types'

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME ?? 'localhost'
const port = Number.parseInt(process.env.PORT ?? '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${port}`,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  setupSocketHandlers(io)

  httpServer.listen(port, () => {
    console.log(`> Brouc server ready on http://${hostname}:${port}`)
    console.log(`> Socket.io ready`)
    console.log(`> Environment: ${dev ? 'development' : 'production'}`)
  })
})
