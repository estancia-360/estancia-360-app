// Rol del usuario DENTRO de una estancia — no confundir con RoleEnum (global).
// Definido acá porque UsersService.findRanchesWhereUserIsOwner() lo necesita sin
// importar ranch-management horizontalmente (módulos atómicos).
export enum RanchRolesEnum {
    OWNER = 1,
    WORKER = 2,
    ADMINISTRATOR = 3,
}
