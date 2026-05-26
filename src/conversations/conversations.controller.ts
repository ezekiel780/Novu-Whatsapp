import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateConversationDto) {
    return this.conversationsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.conversationsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.conversationsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(req.user.id, id, dto);
  }

  @Post(':id/members/:memberId')
  addMember(@Req() req: any, @Param('id') id: string, @Param('memberId') memberId: string) {
    return this.conversationsService.addMember(req.user.id, id, memberId);
  }

  @Delete(':id/members/:memberId')
  removeMember(@Req() req: any, @Param('id') id: string, @Param('memberId') memberId: string) {
    return this.conversationsService.removeMember(req.user.id, id, memberId);
  }

  @Delete(':id/leave')
  leave(@Req() req: any, @Param('id') id: string) {
    return this.conversationsService.leave(req.user.id, id);
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    return this.conversationsService.delete(req.user.id, id);
  }
}
