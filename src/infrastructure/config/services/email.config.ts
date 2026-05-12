import { Injectable } from "@nestjs/common";
import { MyConfigService } from "../config.service";

@Injectable()
export class MyEmailConfig {
    constructor(private readonly config: MyConfigService) {}

    get() {
        return {
            apiKey: this.config.get<string>('RESEND_API_KEY'),
            fromAddress: this.config.get<string>('EMAIL_FROM'),
        };
    }
}
