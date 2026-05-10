import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly service: DashboardService) { }

    @Get('admin')
    @Roles('admin')
    getAdminStats() {
        return this.service.getAdminStats();
    }

    @Get('profesor')
    getProfesorStats(@Request() req) {
        return this.service.getProfesorStats(req.user.id_usuario);
    }
}
