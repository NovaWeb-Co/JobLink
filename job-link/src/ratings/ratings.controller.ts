import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('ratings')
export class RatingsController {

    constructor(private readonly ratingsService: RatingsService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        return this.ratingsService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Body() dto: CreateRatingDto,
    ) {
        return this.ratingsService.create(dto);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.ratingsService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRatingDto,
    ) {
        return this.ratingsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.ratingsService.remove(id);
    }

    @Delete(':userId/remove-rating/:ratingId')
    removeRatingFromUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('ratingId', ParseIntPipe) ratingId: number,
    ) {
        return this.ratingsService.removeRatingFromUser(
            userId,
            ratingId,
        );
    }
}