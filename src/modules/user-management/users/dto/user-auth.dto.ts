import { Expose } from "class-transformer";
import { UserDto } from "./user.dto";

export class UserAuthDto extends UserDto {
    @Expose()
    password: string
}