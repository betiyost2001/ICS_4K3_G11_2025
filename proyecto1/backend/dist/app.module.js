"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const tickets_controller_1 = require("./tickets/tickets.controller");
const tickets_service_1 = require("./tickets/tickets.service");
const email_service_1 = require("./email/email.service");
const mercadopago_service_1 = require("./mercadopago/mercadopago.service");
const webhooks_controller_1 = require("./mercadopago/webhooks.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot()],
        controllers: [tickets_controller_1.TicketsController, webhooks_controller_1.WebhooksController],
        providers: [tickets_service_1.TicketsService, email_service_1.EmailService, mercadopago_service_1.MercadoPagoService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map