import { http } from "./http";

export type AuthResponse = {
    access_token: string;
    user: {
        id: number;
        name: string;
        lastname: string;
        email: string;
        phone?: string | null;
        address?: string | null;
        profilePhoto?: string | null;
        isActive: boolean;
        createdAt: string;
    };
    message?: string;
};

export type RegisterDto = {
    name: string;
    lastname: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    profilePhoto?: string;
};

export type LoginDto = {
    identifier: string; // email o teléfono
    password: string;
};

export const authApi = {
    // POST /auth/register — no necesita token
    register: (dto: RegisterDto) =>
        http<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(dto),
        }),

    // POST /auth/login — no necesita token
    login: (dto: LoginDto) =>
        http<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(dto),
        }),
};
