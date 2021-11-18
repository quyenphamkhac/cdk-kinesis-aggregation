import { IsNotEmpty } from "class-validator";
import { UserStatus } from "../entities/user.entity";

export class UpdateUserStatus {
  constructor(data: any) {
    this.status = data?.status;
  }
  @IsNotEmpty()
  status: UserStatus;
}
