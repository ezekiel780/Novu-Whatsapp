import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateMessageDto) {
    return this.messagesService.create(req.user.id, dto);
  }

  @Get(':conversationId')
  findAll(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
  ) {
    return this.messagesService.findAll(
      req.user.id,
      conversationId,
      cursor,
      take ? Number(take) : 30,
    );
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.messagesService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    return this.messagesService.delete(req.user.id, id);
  }

  @Patch(':conversationId/read')
  markAsRead(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagesService.markAsRead(req.user.id, conversationId);
  }

  @Get(':conversationId/search')
  search(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
    @Query('q') query: string,
  ) {
    return this.messagesService.search(req.user.id, conversationId, query);
  }
}
