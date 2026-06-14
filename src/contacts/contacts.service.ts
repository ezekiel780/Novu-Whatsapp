import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async addContact(userId: string, contactId: string) {
    if (userId === contactId)
      throw new BadRequestException('You cannot add yourself as a contact');

    const contact = await this.prisma.user.findUnique({ where: { id: contactId } });
    if (!contact) throw new NotFoundException('User not found');

    const existing = await this.prisma.contact.findUnique({
      where: { userId_contactId: { userId, contactId } },
    });
    if (existing) throw new BadRequestException('Contact already added');

    return this.prisma.contact.create({
      data: { userId, contactId },
      include: {
        contact: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatarUrl: true,
            status: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
    });
  }

  async getContacts(userId: string) {
    const contacts = await this.prisma.contact.findMany({
      where: { userId },
      include: {
        contact: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatarUrl: true,
            status: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return contacts.map((c) => c.contact);
  }

  async removeContact(userId: string, contactId: string) {
    const existing = await this.prisma.contact.findUnique({
      where: { userId_contactId: { userId, contactId } },
    });
    if (!existing) throw new NotFoundException('Contact not found');

    await this.prisma.contact.delete({
      where: { userId_contactId: { userId, contactId } },
    });

    return { message: 'Contact removed successfully' };
  }

  async searchUsers(userId: string, query: string) {
    return this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          {
            OR: [
              { displayName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        status: true,
        isOnline: true,
      },
      take: 10,
    });
  }
}
