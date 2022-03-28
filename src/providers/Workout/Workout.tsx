import React, { createContext, useCallback, useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { IWorkout } from '@dgoudie/isometric-types';
import { usePageVisibility } from 'react-page-visibility';

export const WorkoutContext = createContext<{
    workout: IWorkout | null;
    startWorkout: () => void;
}>({
    workout: null,
    startWorkout: () => undefined,
});

export default function WorkoutProvider({
    children,
}: React.PropsWithChildren<{}>) {
    const [workout, setWorkout] = useState<string | null>(null);

    const pageVisible: boolean = usePageVisibility();
    const { lastMessage, sendMessage, readyState } = useWebSocket(
        process.env.REACT_APP_WS!,
        { shouldReconnect: () => true },
        pageVisible
    );

    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
            setWorkout(lastMessage?.data);
        }
    }, [lastMessage]);

    const startWorkout = useCallback(() => {
        sendMessage('START');
    }, [sendMessage]);

    return (
        <WorkoutContext.Provider
            value={{
                workout: workout ? JSON.parse(workout) : null,
                startWorkout,
            }}
        >
            {children}
        </WorkoutContext.Provider>
    );
}
