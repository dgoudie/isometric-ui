import {} from '@dgoudie/isometric-types';

import axios, { AxiosError, AxiosResponse } from 'axios';

import React from 'react';
import { ServiceError } from '@dgoudie/service-error';
import { useWebSocketForUpdates } from './use-web-socket-for-updates';

export const fetchFromApi = <T>(
    path: string,
    params?: any,
    headers?: any
): Promise<AxiosResponse<T>> => {
    return axios.get<T>(path, {
        withCredentials: true,
        params,
        headers,
    });
};

interface UseFetchState<T> {
    response: AxiosResponse<T> | null;
    error: AxiosError<ServiceError> | null;
    loading: boolean;
}

export const useFetchFromApi = <T>(
    path: string,
    params?: any,
    headers?: any,
    skip = false,
    listenForWebsocketReload = false
): [AxiosResponse<T> | null, AxiosError<ServiceError> | null, boolean] => {
    const [state, setState] = React.useState<UseFetchState<T>>({
        response: null,
        error: null,
        loading: true,
    });
    let updateDate: number | null = useWebSocketForUpdates(path);
    if (!listenForWebsocketReload) {
        updateDate = null;
    }

    React.useEffect(() => {
        const fetchData = async () => {
            if (skip) {
                setState({ response: null, error: null, loading: false });
            } else {
                setState((state) => ({ ...state, loading: true }));
                try {
                    const response = await fetchFromApi<T>(
                        path,
                        params,
                        headers
                    );
                    setState({ response, error: null, loading: false });
                } catch (error: any) {
                    setState({ response: null, error, loading: false });
                }
            }
        };
        fetchData();
    }, [path, params, headers, skip, updateDate]);
    return [state.response, state.error, state.loading];
};

// export const markBeerOrLiquorInStock = (_id: string, inStock: boolean) =>
//     axios.post(
//         `${process.env.REACT_APP_API}/secure/beer-or-liquor/${_id}/mark-in-stock/${inStock}`,
//         null,
//         { withCredentials: true }
//     );

// export const saveBeerOrLiquor = (
//     id: string | null,
//     beerOrLiquor: BeerOrLiquorBrand
// ) =>
//     axios.put(
//         `${process.env.REACT_APP_API}/secure/beer-or-liquor${
//             !!id ? `/${id}` : ''
//         }`,
//         beerOrLiquor,
//         { withCredentials: true }
//     );

// export const deleteBeerOrLiquor = (_id: string) =>
//     axios.delete(`${process.env.REACT_APP_API}/secure/beer-or-liquor/${_id}`, {
//         withCredentials: true,
//     });

// export const saveMixedDrink = (
//     id: string | null,
//     mixedDrink: MixedDrinkRecipe
// ) =>
//     axios.put(
//         `${process.env.REACT_APP_API}/secure/mixed-drink${
//             !!id ? `/${id}` : ''
//         }`,
//         mixedDrink,
//         { withCredentials: true }
//     );

// export const deleteMixedDrink = (_id: string) =>
//     axios.delete(`${process.env.REACT_APP_API}/secure/mixed-drink/${_id}`, {
//         withCredentials: true,
//     });
