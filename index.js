
const Ssdp = require('node-ssdp')
const express = require('express')
const bodyParser = require('body-parser')
const ip = require('ip')
const app = express()
const gpio = require('rpi-gpio')

let state = {
  power: false,
}

app.use(bodyParser.json())

app.get('/', function (req, res) {
  // Here you can return the switch state
  gpio.read(7, function(err, power) {
    console.log('\n State requested:')
    console.log({ power })
    res.json({ power })
  })
})

app.post('/', function (req, res) {
  // Maybe perform some validation, change any device internal handling and then
  // return back the state
  state = req.body.state || state
  const { power }  = state
  if (power === undefined) console.warn('No power value given')
  gpio.write(7, power, function(err) {
      if (err) throw err;
      console.log('\n State changed:')
      console.log(state)
      res.json(state)
  })
})

const httpServer = app.listen(3000, function () {
  const addr = httpServer.address().address
  const port = httpServer.address().port
  console.log('👾 Bigfoot device mock started on %s:%s', addr, port)

  ssdpServer = new Ssdp.Server({
    suppressRootDeviceAdvertisements: true,
    location: `http://${ip.address()}:${port}`,
    sourcePort: 1900,
  })
  ssdpServer.addUSN('bigfoot:all')
  ssdpServer.start()

  gpio.setup(7, gpio.DIR_OUT, write);
})

process.on('exit', function() {
  ssdpServer.stop() // advertise shutting down and stop listening
  app.stop() // close express server
})
