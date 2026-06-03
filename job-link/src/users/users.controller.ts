import { Body, Controller, Delete, Get, Post, HttpCode, Param, ParseIntPipe, Patch, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) { }

  @Roles(Role.ADMIN, Role.ROOT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN, Role.ROOT)
  @HttpCode(204)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    await this.usersService.remove(
      id,
      req.user.id,
      req.user.role,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (
          req,
          file,
          callback,
        ) => {
          const fileName =
            `${Date.now()}-${file.originalname}`;

          callback(
            null,
            fileName,
          );
        },
      }),
    }),
  )

  async uploadPhoto(
    @UploadedFile()
    file: Express.Multer.File,
    @Request() req,
  ) {
    const user =
      await this.usersService.uploadPhoto(
        req.user.id,
        file.filename,
      );
    return {
      message:
        'Foto subida correctamente',
      imageUrl:
        `/uploads/${file.filename}`,
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reactivate')
  reactivate(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.usersService.reactivate(
      +id,
      req.user.role,
    );
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ROOT)
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: Role,
  ) {
    return this.usersService.updateRole(
      id,
      role,
    );
  }
}