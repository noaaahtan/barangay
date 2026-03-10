import { Injectable, Logger } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepo: UsersRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`findByEmail email=${email}`);
    return this.usersRepo.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    this.logger.log(`findById id=${id}`);
    return this.usersRepo.findById(id);
  }

  async findAll(): Promise<User[]> {
    this.logger.log("findAll");
    return this.usersRepo.findAll();
  }
}
