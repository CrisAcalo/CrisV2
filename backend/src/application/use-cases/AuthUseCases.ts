import { randomUUID } from 'node:crypto';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Role, User } from '../../domain/entities';
import { BadRequestError, UnauthorizedError } from '../../domain/errors/AppError';
import { comparePasswords, hashPassword } from '../../utils/crypto';

type LoginDTO = { email: string; password: string; otp?: string };
type RegisterDTO = Omit<LoginDTO, 'otp'> & { role?: Role };
type PublicUser = Pick<User, 'id' | 'email' | 'role'>;
type SessionCredentials = { token: string; expiresAt: Date };

// A bcrypt hash of a discarded random string, for equivalent work on missing users.
const dummyHash = '$2b$10$86ipvPOmcMcjnmL9o.pEGuyvj2qam7nUtczcRH156sLOrnyGJXpXa';

function publicIdentity({ id, email, role }: User): PublicUser {
    return { id, email, role };
}

export class AuthUseCases {
    constructor(
        private userRepository: IUserRepository,
        private issueSession: (user: User, otp?: string) => Promise<SessionCredentials>,
    ) { }

    async register(data: RegisterDTO): Promise<{ user: PublicUser }> {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) throw new BadRequestError('Email already registered');

        const user = await this.userRepository.save({
            id: randomUUID(),
            email: data.email,
            passwordHash: await hashPassword(data.password),
            role: data.role ?? Role.BASIC,
        });
        return { user: publicIdentity(user) };
    }

    async login(data: LoginDTO): Promise<{ user: PublicUser } & SessionCredentials> {
        const user = await this.userRepository.findByEmail(data.email);
        const isPasswordValid = await comparePasswords(data.password, user?.passwordHash ?? dummyHash);
        if (!user || user.deletedAt || !isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        return { user: publicIdentity(user), ...await this.issueSession(user, data.otp) };
    }
}
