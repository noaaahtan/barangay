import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { User } from "../users/entities/user.entity";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    this.logger.log(`validateUser email=${email}`);
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return user;
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    this.logger.log(`login email=${dto.email}`);
    const user = await this.validateUser(dto.email, dto.password);
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
