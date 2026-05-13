// messages.controller.ts

import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('messages')
export class MessagesController {

    constructor(private readonly messagesService: MessagesService) { }

    @Get()
    async findAll() {
        return this.messagesService.findAll();
    }

    @Post()
    async create(
        @Body() dto: CreateMessageDto,
    ) {
        return this.messagesService.create(dto);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.messagesService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateMessageDto,
    ) {
        return this.messagesService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.messagesService.remove(id);
    }
}