import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  BadRequestException,
  ForbiddenException,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { APIResponse, ReqWithUser } from 'src/shared/types.shared';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // get all users
  @Get()
  async findAll(): Promise<APIResponse<UserResponseDto[]>> {
    const users = await this.userService.findAll();
    return {
      success: true,
      data: users,
    };
  }

  // get user by id
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: number,
  ): Promise<APIResponse<UserResponseDto>> {
    const user = await this.userService.findOne(id);
    return {
      success: true,
      data: user,
    };
  }

  // create user
  @Post()
  @ApiCreatedResponse({
    type: UserResponseDto,
  })
  async create(
    @Body() user: CreateUserDto,
  ): Promise<APIResponse<UserResponseDto>> {
    const createdUser = await this.userService.create(user);
    return {
      success: true,
      data: createdUser,
      message: 'User created successfully',
    };
  }

  // update self
  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateSelf(
    @Req() req: ReqWithUser,
    @Body() user: UpdateUserDto,
  ): Promise<APIResponse<UserResponseDto>> {
    const updatedUser = await this.userService.update(req.user.id, user);
    return {
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    };
  }

  // update password self
  @Patch('password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Req() req: ReqWithUser,
    @Body() passwordDto: UpdateUserPasswordDto,
  ): Promise<APIResponse<UserResponseDto>> {
    const updatedUser = await this.userService.updatePassword(
      req.user.id,
      passwordDto.password,
    );
    return {
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    };
  }

  // update by id
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Body() user: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<APIResponse<UserResponseDto>> {
    const updatedUser = await this.userService.update(id, user);
    return {
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    };
  }

  // delete user
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<APIResponse<void>> {
    await this.userService.delete(id);
    return { success: true, message: 'User deleted successfully' };
  }
}
