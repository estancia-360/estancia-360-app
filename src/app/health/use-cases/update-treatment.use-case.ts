import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateTreatmentDto } from '../dto/inputs/update-treatment.dto';
import { TreatmentsService } from 'src/modules/health-modules/treatments/services/treatments.service';
import { TreatmentDto } from 'src/modules/health-modules/treatments/dto/treatment.dto';

@Injectable()
export class UpdateTreatmentUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly treatmentsService: TreatmentsService,
    ) {}

    async execute(id: number, dto: UpdateTreatmentDto): Promise<TreatmentDto> {
        return await this.dataSource.transaction(async (manager) => {
            // RN-18: si cambian los días de retiro, recalcular withdrawal_end_date
            // en base a la eventDate ORIGINAL del tratamiento (no cambia con el update)
            let withdrawalEndDate: Date | undefined;
            if (dto.withdrawalDays !== undefined) {
                const existing = await this.treatmentsService.findOneById(id, {
                    throwException: true,
                    template: TreatmentDto,
                }, manager);
                const eventDate = new Date(existing!.event.eventDate);
                withdrawalEndDate = new Date(eventDate);
                withdrawalEndDate.setDate(withdrawalEndDate.getDate() + dto.withdrawalDays);
            }

            await this.treatmentsService.update(id, {
                illness: dto.illness,
                medication: dto.medication,
                dose: dto.dose,
                durationDays: dto.durationDays,
                withdrawalDays: dto.withdrawalDays,
                withdrawalEndDate,
                responsible: dto.responsible,
                notes: dto.notes,
            }, manager);

            return (await this.treatmentsService.findOneById(
                id,
                { throwException: true, template: TreatmentDto },
                manager,
            ))!;
        });
    }
}
