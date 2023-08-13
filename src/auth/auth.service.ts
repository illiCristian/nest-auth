import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/auth.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { SignUpDto } from './dto/signup-dto';
import { LoginDto } from './dto/login-dto';
import {UnauthorizedException} from '@nestjs/common';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    const { name, email, password } = signUpDto;

    const hasedPasswrod = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      name,
      email,
      password: hasedPasswrod,
    });

    const token = this.jwtService.sign({
      id: user._id,
      email: user.email,
    });

    return {
      token,
    };
  }

  async login(loginDto : LoginDto) : Promise <{token : string}>{
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      id: user._id,
      email: user.email,
    })
    return {
      token,
    }
  }
}
