// Rol del usuario DENTRO de una estancia — no confundir con RoleEnum (global).
// Definido acá porque UsersService.findRanchIdWhereUserIsOwner() lo necesita antes
// de que el módulo ranch-management esté migrado.
export enum RanchRolesEnum {
    OWNER = 1,
    WORKER = 2,
    ADMINISTRATOR = 3,
}
