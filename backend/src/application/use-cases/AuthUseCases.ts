import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { hashPassword, comparePasswords } from '../../utils/crypto';
import { generateToken } from '../../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../../domain/errors/AppError';
import { User, Role } from '../../domain/entities';

// Interfaces for DTOs
export interface RegisterDTO {
    email: string;
    passwordHash: string; // En realidad recibimos password plana de DTO, renombramos en params
    role?: Role;
}

export interface LoginDTO {
    email: string;
    passwordHash: string; // Recibimos password plana
}

export class AuthUseCases {
    constructor(private userRepository: IUserRepository) { }

    async register(data: RegisterDTO): Promise<{ user: Partial<User>, token: string }> {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new BadRequestError('Email already registered');
        }

        const hashedPassword = await hashPassword(data.passwordHash);

        // TODO: Utilizar uuid para generar ids
        const newUser: User = {
            id: crypto.randomUUID(),
            email: data.email,
            passwordHash: hashedPassword,
            role: data.role || Role.BASIC,
        };

        const savedUser = await this.userRepository.save(newUser);

        const token = generateToken({ userId: savedUser.id, role: savedUser.role });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...userWithoutPassword } = savedUser;

        return { user: userWithoutPassword, token };
    }

    async login(data: LoginDTO): Promise<{ user: Partial<User>, token: string }> {
        const user = await this.userRepository.findByEmail(data.email);

        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const isPasswordValid = await comparePasswords(data.passwordHash, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const token = generateToken({ userId: user.id, role: user.role });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }
}
