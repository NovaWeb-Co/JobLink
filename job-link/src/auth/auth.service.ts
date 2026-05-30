import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {

        const userExists =
            await this.prisma.user.findFirst({
                where: {
                    OR: [
                        {
                            email: registerDto.email,
                        },
                        {
                            phone: registerDto.phone,
                        },
                    ],
                },
            });

        if (userExists) {
            throw new BadRequestException(
                'El correo o teléfono ya existe',
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                registerDto.password,
                10,
            );

        const user =
            await this.prisma.user.create({
                data: {
                    name: registerDto.name,
                    lastname: registerDto.lastname,
                    email: registerDto.email,
                    password: hashedPassword,
                    phone: registerDto.phone,
                    address: registerDto.address,
                    profilePhoto:
                        registerDto.profilePhoto,
                },
            });

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const token =
            this.jwtService.sign(payload);

        const {
            password,
            ...userWithoutPassword
        } = user;

        return {
            message: 'Usuario creado',

            access_token: token,

            user: userWithoutPassword,
        };
    }

    async login(loginDto: LoginDto) {
    const user =
        await this.prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: loginDto.identifier,
                    },
                    {
                        phone: loginDto.identifier,
                    },
                ],
            },
        });

    if (!user) {
        throw new UnauthorizedException(
            'Usuario no encontrado',
        );
    }

    // 🔴 VALIDAR CUENTA ACTIVA
    if (!user.isActive) {
        throw new UnauthorizedException(
            'Cuenta desactivada',
        );
    }

    const passwordValid =
        await bcrypt.compare(
            loginDto.password,
            user.password,
        );

    if (!passwordValid) {
        throw new UnauthorizedException(
            'Contraseña incorrecta',
        );
    }

    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
    };

    const {
        password,
        ...userWithoutPassword
    } = user;

    return {
        access_token: this.jwtService.sign(payload),
        user: userWithoutPassword,
    };
}
}