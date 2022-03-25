import {} from '@dgoudie/isometric-types';

import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios';

import React from 'react';

export const fetchFromApi = <T>(
    path: string,
    params?: URLSearchParams,
    headers?: AxiosRequestHeaders
): Promise<AxiosResponse<T>> => {
    return axios.get<T>(path, {
        withCredentials: true,
        params,
        headers,
    });
};

interface UseFetchState<T> {
    response: AxiosResponse<T> | null;
    loading: boolean;
}

export const useFetchFromApi = <T>(
    path: string,
    params?: URLSearchParams,
    headers?: AxiosRequestHeaders,
    skip = false
): AxiosResponse<T> | undefined => {
    const [state, setState] = React.useState<AxiosResponse<T> | undefined>(
        undefined
    );

    React.useEffect(() => {
        const fetchData = async () => {
            if (skip) {
                setState(undefined);
            } else {
                setState(undefined);
                try {
                    const response = await fetchFromApi<T>(
                        path,
                        params,
                        headers
                    );
                    setState(response);
                } catch (error: any) {
                    setState(undefined);
                }
            }
        };
        fetchData();
    }, [headers, params, path, skip]);
    return state;
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
