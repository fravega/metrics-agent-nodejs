const appmetrics = require('appmetrics')

appmetrics.configure({ mqtt: 'off' })

module.exports = class Agent {
  constructor(adapter, config = {}) {
    this.monitor = appmetrics.monitor()

    this.monitor.on('cpu', adapter.onCPUMetrics)
    this.monitor.on('memory', adapter.onMemoryMetrics)
    this.monitor.on('eventloop', adapter.onEventLoopMetrics)
    this.monitor.on('gc', adapter.onGCMetrics)

    if (config.http) {
      appmetrics.setConfig('http', config.http)
      appmetrics.setConfig('https', config.http)

      this.monitor.on('http', adapter.onHttpInMetrics)
      this.monitor.on('https', adapter.onHttpInMetrics)
    }

    if (config.httpOutbound) {
      this.monitor.on('http-outbound', adapter.onHttpOutMetrics)
      this.monitor.on('https-outbound', adapter.onHttpOutMetrics)
    }

    this.monitor.on('app-metric', adapter.onAppMetrics)
  }

  send (value, labels={}) {
    appmetrics.emit('app-metric', { value, labels: Object.assign({type: 'gauge'}, labels) })
  }

  startTimer (labels={}) {
    const startTime = new Date().getTime()

    return (endLabels={}) => {
      this.send((new Date()).getTime() - startTime, Object.assign(labels, endLabels))
    }
  }
}