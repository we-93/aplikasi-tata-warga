const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    // Sanitize duplicate headers from Cloudflare + OpenLiteSpeed
    const headersToSanitize = ['x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-for', 'origin', 'host'];
    
    headersToSanitize.forEach(header => {
      if (req.headers[header] && typeof req.headers[header] === 'string' && req.headers[header].includes(',')) {
        req.headers[header] = req.headers[header].split(',')[0].trim();
      }
    });

    handle(req, res, parse(req.url, true))
  }).listen(3001, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3001')
  })
})
