export class Team {
    readonly id: string
    private _name: string

    constructor(id: string, name: string) {
        this.id = id
        this._name = name
    }

    get name(): string {
        return this._name
    }

    setName(name: string): void {
        const trimmed = name.trim()
        if (!trimmed) throw new Error('El nombre no puede estar vacío')
        this._name = trimmed
    }
}
