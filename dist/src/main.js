"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const redacting_logger_1 = require("./logger/redacting.logger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: new redacting_logger_1.RedactingLogger(),
    });
    await app.listen(Number(process.env.PORT ?? 3000));
}
bootstrap();
//# sourceMappingURL=main.js.map