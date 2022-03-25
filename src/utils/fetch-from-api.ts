export interface ReadableResource<T> {
    read(): T;
}

function wrapPromise<T>(promise: Promise<T>): ReadableResource<T> {
    let status = 'pending';
    let result: T;
    let suspender = promise.then(
        (r) => {
            status = 'success';
            result = r;
        },
        (e) => {
            status = 'error';
            result = e;
        }
    );
    return {
        read() {
            if (status === 'pending') {
                throw suspender;
            } else if (status === 'error') {
                throw result;
            } else if (status === 'success') {
                return result;
            }
            throw new Error('unexpected promise state');
        },
    };
}

export const fetchFromApi2 = <T>(
    path: string,
    params?: URLSearchParams,
    headers?: HeadersInit
) => {
    return wrapPromise(
        fetch(`${path}?${params ? params.toString() : ''}`, {
            credentials: 'same-origin',
            headers,
        }).then((res) => res.json() as Promise<T>)
    );
};
