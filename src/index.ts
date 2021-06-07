import Logger from "./logger"
import LogMessage from "objects/LogMessage"
import * as config from "config"
import * as uWS from "uWebSockets.js"

const textDecoder = new TextDecoder()

const logPath = config.has("logDir") ? <string>config.get("logDir") : "./logs"
const logger = new Logger(logPath)

function main() {
    const app = uWS.App({
        passphrase: "1234"
    })

    app.ws("/log", {
        /* Options */
        compression: uWS.SHARED_COMPRESSOR,
        maxPayloadLength: 16 * 1024 * 1024,
        /* Handlers */
        open: (ws) => {
            logger.logDirect('A WebSocket connected!');
        },
        message: (ws, message, isBinary) => {
            const text = textDecoder.decode(message)

            try {
                const logMessage = <LogMessage>JSON.parse(text)
                logger.logMessage(logMessage)
            } catch (ex) {
                logger.logDirect(`Failed to decode message (${text}): ${ex}`)
            }

        },
        close: (ws, code, message) => {
            logger.logDirect('WebSocket closed');
        }
    })

    const host = config.has("host") ? config.get("host") : "localhost"
    const port = config.has("port") ? config.get("port") : 55689

    app.listen("localhost", 55689, (sock) => {
        logger.logDirect(`Server started on ${host}:${port}`)
    })
}

main()