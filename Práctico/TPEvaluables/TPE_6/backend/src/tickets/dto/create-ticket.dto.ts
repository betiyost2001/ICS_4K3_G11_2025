import { IsDateString, IsEnum, IsInt, IsArray, ValidateNested, Min, Max, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export enum PassType {
  REGULAR = 'regular',
  VIP = 'vip'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card'
}

export class VisitorDto {
  @IsInt()
  @Min(0)
  @Max(100)
  age: number;

  @IsEnum(PassType)
  passType: PassType;
}

export interface TicketPricing {
  basePrice: number;
  finalPrice: number;
  discount: number;
  discountReason?: string;
}

export interface TicketSummary {
  totalTickets: number;
  totalAmount: number;
  ticketDetails: Array<{
    age: number;
    passType: PassType;
    pricing: TicketPricing;
  }>;
}

export class CreateTicketDto {
  @IsDateString()
  visitDate: string;

  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisitorDto)
  @ArrayMaxSize(10)
  visitors: VisitorDto[];

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}