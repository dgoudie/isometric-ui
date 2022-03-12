import { ServiceError } from '@dgoudie/service-error';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export const errorToastEffect = (error: ServiceError | Error | null) =>
    //eslint-disable-next-line
    useEffect(() => {
        !!error && displayErrorToast(error);
    }, [error]);

export const displayErrorToast = (error: ServiceError | Error) =>
    toast.error(error.message ?? 'An unexpected error occurred.');
