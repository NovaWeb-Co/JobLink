import { Controller, Get } from '@nestjs/common';
import { timestamp } from 'rxjs';

@Controller('health')
export class HealthController {
    @Get()
    check() {
        return {
            status: 'ok',
            message: 'API funcionando corectamente',
            timestamp: new Date().toISOString(),
        };
    }
}
