import { ConflictException } from '@nestjs/common';

// 12a (auditoria QA E2E, 2026-09-03): el mensaje decia siempre "email" aunque el duplicado
// fuera de CI — confundia al usuario sobre qué campo corregir.
export class UserAlreadyExistsException extends ConflictException {
    constructor(field: 'email' | 'ci' = 'email') {
        const message = field === 'ci' ? 'A user with this CI already exists.' : 'A user with this email already exists.';
        super({ message, error: 'USER_ALREADY_EXISTS' });
    }
}
