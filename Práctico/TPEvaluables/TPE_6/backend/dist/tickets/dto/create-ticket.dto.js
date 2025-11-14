"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTicketDto = exports.VisitorDto = exports.PaymentMethod = exports.PassType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var PassType;
(function (PassType) {
    PassType["REGULAR"] = "regular";
    PassType["VIP"] = "vip";
})(PassType || (exports.PassType = PassType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CREDIT_CARD"] = "credit_card";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
class VisitorDto {
}
exports.VisitorDto = VisitorDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], VisitorDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PassType),
    __metadata("design:type", String)
], VisitorDto.prototype, "passType", void 0);
class CreateTicketDto {
}
exports.CreateTicketDto = CreateTicketDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTicketDto.prototype, "visitDate", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CreateTicketDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => VisitorDto),
    (0, class_validator_1.ArrayMaxSize)(10),
    __metadata("design:type", Array)
], CreateTicketDto.prototype, "visitors", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], CreateTicketDto.prototype, "paymentMethod", void 0);
//# sourceMappingURL=create-ticket.dto.js.map