import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  ReportCampaignDto,
} from './campaign.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Public, Roles } from '../auth/decorators';
import { UserRole } from '../users/user.entity';

const coverImageInterceptor = FileInterceptor('coverImage', {
  storage: diskStorage({
    destination: './uploads/campaigns',
    filename: (_req, file, cb) => {
      cb(null, `${uuidv4()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Public()
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.campaignsService.findAll(page, limit, category, search, sort);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.campaignsService.findAllAdmin(page, limit);
  }

  @Get('admin/reported')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getReported(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.campaignsService.getReported(page, limit);
  }

  @Get('my')
  getMyCampaigns(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.campaignsService.findByCreator(req.user.id, page, limit);
  }

  @Public()
  @Get('creator/:id')
  getCreatorCampaigns(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.campaignsService.findByCreatorPublic(id, page, limit);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Post()
  @UseInterceptors(coverImageInterceptor)
  create(
    @Request() req,
    @Body(new ValidationPipe({ transform: true })) dto: CreateCampaignDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!req.user?.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email before creating a campaign',
      );
    }

    const coverImage = file ? `/uploads/campaigns/${file.filename}` : undefined;
    return this.campaignsService.create(req.user.id, dto, coverImage);
  }

  @Patch(':id')
  @UseInterceptors(coverImageInterceptor)
  update(
    @Param('id') id: string,
    @Request() req,
    @Body(new ValidationPipe({ transform: true, skipMissingProperties: true }))
    dto: UpdateCampaignDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const coverImage = file ? `/uploads/campaigns/${file.filename}` : undefined;
    return this.campaignsService.update(
      id,
      req.user.id,
      req.user.role,
      dto,
      coverImage,
    );
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.campaignsService.delete(id, req.user.id, req.user.role);
  }

  @Post(':id/report')
  report(
    @Param('id') id: string,
    @Request() req,
    @Body(ValidationPipe) dto: ReportCampaignDto,
  ) {
    return this.campaignsService.report(id, req.user.id, dto);
  }

  @Patch(':id/freeze')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  freeze(@Param('id') id: string) {
    return this.campaignsService.freeze(id);
  }

  @Patch(':id/unfreeze')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  unfreeze(@Param('id') id: string) {
    return this.campaignsService.unfreeze(id);
  }
}
