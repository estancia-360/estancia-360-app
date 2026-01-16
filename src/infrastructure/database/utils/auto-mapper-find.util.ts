function isPlainObject(v: any) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isPrimitive(v: any) {
    return v === null || v === undefined || (typeof v !== 'object' && typeof v !== 'function');
}

function toSelectOptions(obj: any, seen = new WeakSet()): any {
    if (isPrimitive(obj)) return true;

    if (typeof obj === 'object') {
        if (seen.has(obj)) return true;
        seen.add(obj);
    }

    if (Array.isArray(obj)) {
        if (obj.length === 0) return true;
        return toSelectOptions(obj[0], seen);
    }

    const res: any = {};
    for (const key of Object.keys(obj)) {
        const val = obj[key];

        if (isPrimitive(val)) {
            res[key] = true;
        } else if (Array.isArray(val)) {
            // array -> analizar primer elemento
            res[key] = toSelectOptions(val, seen);
        } else {
            res[key] = toSelectOptions(val, seen);
        }
    }

    return res;
}

function toRelationOptions(obj: any, seen = new WeakSet()): any {
    if (isPrimitive(obj)) return false; // no es relación si es primitivo

    if (typeof obj === 'object') {
        if (seen.has(obj)) return true;
        seen.add(obj);
    }

    if (Array.isArray(obj)) {
        if (obj.length === 0) return false;
        return toRelationOptions(obj[0], seen);
    }

    const res: any = {};
    let hasRelation = false;

    for (const key of Object.keys(obj)) {
        const val = obj[key];

        if (isPrimitive(val)) {
            continue;
        }

        // val es objeto o array => posible relación
        const child = toRelationOptions(val, seen);

        if (child === false) {
            res[key] = true;
            hasRelation = true;
        } else {
            res[key] = child;
            hasRelation = true;
        }
    }

    return hasRelation ? res : false;
}

export function findWithAutoMapper<T>(ctor: new () => T) {
    const obj = new ctor();
    return {
        select: toSelectOptions(obj),
        relations: toRelationOptions(obj)
    };
}
