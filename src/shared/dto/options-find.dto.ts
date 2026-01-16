export class OptionsFindDto<T = undefined> {
    throwException?: boolean = true
    template?: new() => T
}