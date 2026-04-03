import { MyForbiddenException } from "src/shared/exceptions";

export class PermissionDeniedException extends MyForbiddenException {
    constructor(){
        super(`Permiso denegado`, 'PERMISSION_DENIED')
    }
}