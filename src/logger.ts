import * as bunyan from "bunyan"
import * as fs from "fs"
import LogMessage from "objects/LogMessage"

export default class Logger {
    private readonly mainLogger: bunyan

    private readonly loggers: Record<string, bunyan> = {}

    constructor(logPath: string) {
        /**
         * Create the logs folder to prepare Bunyan's rotating logs
         */
        if (!fs.existsSync(logPath)) {
            fs.mkdirSync(logPath)
        }

        this.mainLogger = bunyan.createLogger({
            name: "LogCollector",
            level: bunyan.INFO,
            serializers: bunyan.stdSerializers,
            streams: [{
                stream: process.stdout
            }, {
                type: "rotating-file",
                path: `${logPath}/main.log`,
                period: "1d",
                count: 3
            }]
        })
    }

    logMessage(entry: LogMessage) {
        const logger = this.loggers[entry.source] || (this.loggers[entry.source] = this.mainLogger.child({ source: entry.source }))

        logger.info(entry.message)
    }

    logDirect(text: string) {
        this.mainLogger.info(text)
    }
}