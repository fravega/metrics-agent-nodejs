const { findPackageJson } = require('./lib/utils')
const Agent = require('./lib/metricAgent')
const adapter = require('./lib/prometheusAdapter')
const config = Object.assign({ http: {}, httpOutbound: false}, findPackageJson().metricsAgent || {})

module.exports = new Agent(adapter, config)
