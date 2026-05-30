import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const url = process.env.DATABASE_URL;

if (!url) {
    throw new Error(
        'DATABASE_URL no está definida en el archivo .env',
    );
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: url,
    }),
});

async function main() {
    const rootExists =
        await prisma.user.findFirst({
            where: {
                role: Role.ROOT,
            },
        });

    if (!rootExists) {
        const hashedPassword =
            await bcrypt.hash(
                '1q2w3e4r5t6y7u8i9o0p',
                10,
            );

        await prisma.user.create({
            data: {
                name: 'Root',
                lastname: 'JobLink',
                email: 'root@joblink.com',
                password: hashedPassword,
                phone: '3148276565',
                address: 'Sistema',
                role: Role.ROOT,
                isActive: true,
            },
        });

        console.log(
            '✅ Usuario ROOT creado correctamente',
        );
    } else {
        console.log(
            'ℹ️ Ya existe un usuario ROOT',
        );
    }
}

main()
    .catch((error) => {
        console.error(
            '❌ Error ejecutando seed:',
            error,
        );
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });