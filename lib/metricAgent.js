const appmetrics = require('appmetrics')

appmetrics.configure({ mqtt: 'off' })

module.exports = class Agent {
  constructor(adapter, config = {}) {
    this.monitor = appmetrics.monitor()

    this.monitor.on('cpu', adapter.cpuMetrics)
    this.monitor.on('memory', adapter.memoryMetrics)
    this.monitor.on('eventloop', adapter.eventLoopMetrics)
    this.monitor.on('gc', adapter.gcMetrics)

    if (config.http) {
      appmetrics.setConfig('http', config.http)
      appmetrics.setConfig('https', config.http)

      this.monitor.on('http', adapter.httpInMetrics)
      this.monitor.on('https', adapter.httpInMetrics)
    }

    if (config.httpOutbound) {
      this.monitor.on('http-outbound', adapter.httpOutMetrics)
      this.monitor.on('https-outbound', adapter.httpOutMetrics)
    }
  }
}