import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CallsService } from './calls.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Calls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calls')
export class CallsController {
  constructor(private callsService: CallsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateCallDto) {
    return this.callsService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCallDto,
  ) {
    return this.callsService.update(req.user.id, id, dto);
  }

  @Get('history')
  getHistory(
    @Req() req: any,
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
  ) {
    return this.callsService.getHistory(
      req.user.id,
      cursor,
      take ? Number(take) : 20,
    );
  }

  @Get('missed')
  getMissedCalls(@Req() req: any) {
    return this.callsService.getMissedCalls(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.callsService.findOne(req.user.id, id);
  }
}
