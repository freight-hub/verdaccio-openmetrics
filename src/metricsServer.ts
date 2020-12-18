import { register, collectDefaultMetrics } from 'prom-client'
import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import { AddressInfo } from 'net'
export { Server }

type Callback = (port: number) => void

const DEFAULT_PORT = 9090

export type MetricsServerConfig = {
    /**
     * Port where the metrics server should be listening on.
     * Defaults to 9090.
     */
    port?: number

    /**
     * Sets static labels to every metric emitted through the default registry, as name/value pairs:
     * { defaultLabel: "value", anotherLabel: "value 2" }
     */
    defaultLabels?: Object
}

export function startMetricsServer(config: MetricsServerConfig, callback?: Callback): Server
export function startMetricsServer(callback?: Callback): Server
export function startMetricsServer(configOrCallback?: MetricsServerConfig | Callback, cb?: Callback): Server {
    const config = typeof configOrCallback === 'object' ? configOrCallback : {}
    const callback = typeof configOrCallback === 'function' ? configOrCallback : cb

    const { port = DEFAULT_PORT, defaultLabels = {} } = config

    register.setDefaultLabels(defaultLabels)
    const server = createServer(responseHandler).listen(port, () => {
        const serverPort = (server.address() as AddressInfo).port
        callback?.(serverPort)
    })
    return server
}

function responseHandler(req: IncomingMessage, res: ServerResponse) {
    if (req.url === '/metrics') {
        res.setHeader('content-type', register.contentType)
        register.metrics().then(data => res.end(data))
    } else {
        res.statusCode = 404
        res.end()
    }
}
