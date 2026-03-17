import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators';
import { UserRole } from '../users/user.entity';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('platform')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getPlatformStats() {
    return this.statsService.getPlatformStats();
  }

  @Get('me')
  getMyStats(@Request() req) {
    return this.statsService.getUserStats(req.user.id);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getUserStats(@Param('userId') userId: string) {
    return this.statsService.getUserStats(userId);
  }
}
