import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { WalletService } from '../wallet/wallet.service';
import { Wallet } from '../wallet/wallet.entity';
import { CreateWalletDto } from '../wallet/dto/create-wallet.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private walletService: WalletService,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users.map(
      (user) => plainToInstance(UserResponseDto, user) as UserResponseDto,
    );
  }

  async findOne(id: number): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }
    return plainToInstance(UserResponseDto, user) as UserResponseDto;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async createUserWallet(user: User): Promise<Wallet> {
    const payload: CreateWalletDto = {
      name: 'Default Wallet',
      email: user.email,
      balance: 0,
      userId: user.id!,
    };
    return this.walletService.create(payload);
  }

  async create(user: CreateUserDto): Promise<UserResponseDto> {
    user.password = await this.hashPassword(user.password);

    const created = this.userRepository.create(user);
    const saved = await this.userRepository.save(created);

    await this.createUserWallet(saved);
    return plainToInstance(UserResponseDto, saved) as UserResponseDto;
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }
    return plainToInstance(UserResponseDto, user) as UserResponseDto;
  }

  async update(
    id: number,
    user: Partial<User>,
  ): Promise<UserResponseDto | null> {
    // await this.userRepository.update(id, user);
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('User does not exist!');
    }

    // Merge new fields into the existing user
    Object.assign(existing, user);

    const updated = await this.userRepository.save(existing);
    return plainToInstance(UserResponseDto, updated) as UserResponseDto;
  }

  async updatePassword(
    id: number,
    password: string,
  ): Promise<UserResponseDto | null> {
    // await this.userRepository.update(id, user);
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('User does not exist!');
    }

    const hashedPassword = await this.hashPassword(password);
    Object.assign(existing, { password: hashedPassword });

    const updated = await this.userRepository.save(existing);
    return plainToInstance(UserResponseDto, updated) as UserResponseDto;
  }

  async delete(id: number): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }
    await this.userRepository.delete(id);
  }
}
