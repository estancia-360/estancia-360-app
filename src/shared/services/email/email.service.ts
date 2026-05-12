import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { MyEmailConfig } from 'src/infrastructure/config/services/email.config';

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
}

@Injectable()
export class EmailService {
    private readonly resend: Resend;
    private readonly fromAddress: string;
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly emailConfig: MyEmailConfig) {
        const { apiKey, fromAddress } = this.emailConfig.get();
        this.resend = new Resend(apiKey);
        this.fromAddress = fromAddress;
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        setImmediate(() => this.sendEmailAsync(options));
    }

    private async sendEmailAsync(options: EmailOptions): Promise<void> {
        const { error } = await this.resend.emails.send({
            from: this.fromAddress,
            to: Array.isArray(options.to) ? options.to : [options.to],
            subject: options.subject,
            html: options.html,
        });

        if (error) {
            this.logger.error(`Error al enviar email a ${options.to}: ${error.message}`);
        }
    }
}
