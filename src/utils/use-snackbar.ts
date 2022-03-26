import {
    SnackbarContext,
    defaultDuration,
} from '../components/Snackbar/Snackbar';

import { useContext } from 'react';

export const useSnackbar = () => {
    const { openSnackbar, closeSnackbar } = useContext(SnackbarContext);

    function open(content: string, duration = defaultDuration) {
        openSnackbar(content, duration);
    }

    // Returns methods in hooks array way
    return [open, closeSnackbar];
};
