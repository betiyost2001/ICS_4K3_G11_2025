export declare enum PassType {
    REGULAR = "regular",
    VIP = "vip"
}
export declare enum PaymentMethod {
    CASH = "cash",
    CREDIT_CARD = "credit_card"
}
export declare class VisitorDto {
    age: number;
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
export declare class CreateTicketDto {
    visitDate: string;
    quantity: number;
    visitors: VisitorDto[];
    paymentMethod: PaymentMethod;
}
