var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
export class RegisterDto {
    email;
    username;
    password;
}
__decorate([
    IsEmail({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    IsString(),
    MinLength(3, { message: 'Username must be at least 3 characters long' }),
    Matches(/^[a-zA-Z0-9\_]+$/, { message: 'Username can only contain letters, numbers, and underscores', }),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);
__decorate([
    IsString(),
    MinLength(6, { message: 'Password must be at least 6 characters long' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
//# sourceMappingURL=register.dto.js.map