export declare class EmailService {
    private transporter;
    sendConfirmationEmail(email: string, ticket: any): Promise<void>;
    private generateReservationEmail;
    private generatePaidTicketEmail;
}
