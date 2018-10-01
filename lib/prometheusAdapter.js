const prometheus = require('prom-client')
const http = require('http')

function CPUMetrics(client) {
  const system = new client.Gauge({ name: 'os_cpu_used_ratio', help: 'os_cpu_used_ratio' })
  const process = new client.Gauge({ name: 'process_cpu_used_ratio', help: 'process_cpu_used_ratio' })

  return (data) => {
    process.set(data.process, data.time)
    system.set(data.system, data.time)
  }
}

function MemoryMetrics(client) {
  const physical = new client.Gauge({ name: 'process_resident_memory_bytes', help: 'process_resident_memory_bytes' })
  const virtual = new client.Gauge({ name: 'process_virtual_memory_bytes', help: 'process_virtual_memory_bytes' })

  return (data) => {
    physical.set(data.physical, data.time)
    virtual.set(data.virtual, data.time)
  }
}

function EventLoopMetrics(client) {
  const measure = new client.Summary({
    name: 'nodejs_eventloop_latency_ms',
    help: 'nodejs_eventloop_latency_ms',
    percentiles: [0.5, 0.9, 0.999]
  });

  return (data) => {
    measure.observe(data.latency.min)
    measure.observe(data.latency.max)
    measure.observe(data.latency.avg)
  }
}

function GCMetrics(client) {
  const heapSize = new client.Summary({
    name: 'nodejs_heap_total_bytes',
    help: 'nodejs_heap_total_bytes',
    percentiles: [0.5, 0.9]
  });

  const heapUsed = new client.Summary({
    name: 'nodejs_heap_used_bytes',
    help: 'nodejs_heap_used_bytes',
    percentiles: [0.5, 0.9]
  });

  const duration = new client.Summary({
    name: 'nodejs_gc_duration_ms',
    help: 'nodejs_gc_duration_ms',
    labelNames: ['type'],
    percentiles: [0.5, 0.9]
  });

  return (data) => {
    heapSize.observe(data.size)
    heapUsed.observe(data.used)
    duration.observe({ type: data.type }, data.duration)
  }
}

function HTTPMetrics(client) {
  const name = 'http_request_duration_ms'
  const request = new client.Summary({
    name,
    help: name,
    percentiles: [0.5, 0.9],
  });

  return (data) => {
    request.observe({ method: data.method, url: data.url, statusCode: data.statusCode, direction: data.direction || 'inbound' }, data.duration)
  }
}

const httpInMetrics = HTTPMetrics(prometheus)
const httpOutMetrics = data => httpInMetrics(Object.assign({ direction: 'outbound' }, data))
const cpuMetrics = CPUMetrics(prometheus)
const memoryMetrics = MemoryMetrics(prometheus)
const eventLoopMetrics = EventLoopMetrics(prometheus)
const gcMetrics = GCMetrics(prometheus)
const port = process.env.METRICS_PORT

if (port) {
  const server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(prometheus.register.metrics())
  })

  server.listen(port, () => {
    console.log(`Metrics app listening on port ${port}!`)
  });
}

module.exports = {
  cpuMetrics,
  memoryMetrics,
  eventLoopMetrics,
  gcMetrics,
  httpInMetrics,
  httpOutMetrics
}
