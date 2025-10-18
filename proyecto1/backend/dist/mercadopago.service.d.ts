export declare class MercadoPagoService {
    private client;
    private preference;
    constructor();
    createPaymentPreference(ticketData: any): Promise<import("mercadopago/dist/clients/preference/commonTypes").PreferenceResponse>;
}
