import { FindOptionsWhere } from "typeorm"

export class OptionsFindDto<T = undefined,TEntity = undefined> {
    throwException?: boolean = true
    template?: new() => T
    where?: FindOptionsWhere<TEntity>
}