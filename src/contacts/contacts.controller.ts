import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { ContactsService } from './contacts.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  
  @ApiTags('Contacts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('contacts')
  export class ContactsController {
    constructor(private contactsService: ContactsService) {}
  
    @Get()
    getContacts(@Req() req: any) {
      return this.contactsService.getContacts(req.user.id);
    }
  
    @Post(':contactId')
    addContact(@Req() req: any, @Param('contactId') contactId: string) {
      return this.contactsService.addContact(req.user.id, contactId);
    }
  
    @Delete(':contactId')
    removeContact(@Req() req: any, @Param('contactId') contactId: string) {
      return this.contactsService.removeContact(req.user.id, contactId);
    }
  
    @Get('search')
    searchUsers(@Req() req: any, @Query('q') query: string) {
      return this.contactsService.searchUsers(req.user.id, query ?? '');
    }
  }
  