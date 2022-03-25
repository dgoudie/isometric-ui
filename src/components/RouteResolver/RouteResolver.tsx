import React, { ReactNode, useEffect, useState } from 'react';

import RouteLoader from '../RouteLoader/RouteLoader';

type ResultMap = Record<PropertyKey, any>;

type PromiseMap<T extends ResultMap> = {
    [KEY in keyof T]: T[KEY] | Promise<T[KEY]>;
};

type Props<T extends ResultMap> = {
    promises: PromiseMap<T>;
    children: (result: T) => ReactNode;
};

export default function RouteResolver<T extends ResultMap>({
    children,
    promises,
}: Props<T>) {
    const [result, setResult] = useState<T>();

    useEffect(() => {
        const fn = async () => {
            setResult(undefined);
            const result = await resolveAllPromises(promises);
            setResult(result);
        };
        fn();
    }, [promises]);

    if (!result) {
        return <RouteLoader />;
    }

    return children(result);
}

const resolveAllPromises = <T extends ResultMap>(
    promises: PromiseMap<T>
): Promise<T> => {
    const promiseKeys = Object.keys(promises);
    const promiseValues: Promise<T[keyof T]>[] = Object.values(promises);

    return Promise.all(promiseValues).then((result) =>
        result.reduce(
            (acc, promise, index) => ({
                ...acc,
                [promiseKeys[index]]: promise,
            }),
            {} as T
        )
    );
};
