import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventsEnum } from 'src/shared/enums/events.enum';
import * as emailService from 'src/shared/services/email/email.service';
import { EmailService } from 'src/shared/services/email/email.service';

@Injectable()
export class NotificationsService {
    constructor(
        private readonly emailService: EmailService
    ){}

    @OnEvent(EventsEnum.SEND_MAIL)
    async sendMail(data: emailService.EmailOptions){
        await this.emailService.sendEmail(data);
    }
}
