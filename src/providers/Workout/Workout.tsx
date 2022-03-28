import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { IWorkout } from '@dgoudie/isometric-types';
import { usePageVisibility } from 'react-page-visibility';

export const WorkoutContext = createContext<{
    workout?: IWorkout | null;
    startWorkout: () => void;
    endWorkout: () => void;
    discardWorkout: () => void;
}>({
    startWorkout: () => undefined,
    endWorkout: () => undefined,
    discardWorkout: () => undefined,
});

export default function WorkoutProvider({
    children,
}: React.PropsWithChildren<{}>) {
    const [workoutString, setWorkoutString] = useState<string | null>();
    const [workout, setWorkout] = useState<IWorkout | null>();

    const pageVisible: boolean = usePageVisibility();
    const { lastMessage, sendJsonMessage, readyState } = useWebSocket(
        process.env.REACT_APP_WS!,
        { shouldReconnect: () => true },
        pageVisible
    );

    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
            setWorkoutString(lastMessage?.data);
        }
    }, [lastMessage]);

    useEffect(() => {
        setWorkout(workoutString ? JSON.parse(workoutString) : workoutString);
    }, [workoutString]);

    const startWorkout = useCallback(() => {
        sendJsonMessage({ type: 'START' });
    }, [sendJsonMessage]);
    const endWorkout = useCallback(() => {
        sendJsonMessage({ type: 'END' });
    }, [sendJsonMessage]);
    const discardWorkout = useCallback(() => {
        sendJsonMessage({ type: 'DISCARD' });
    }, [sendJsonMessage]);

    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        if (typeof workout != 'undefined') {
            if (workout === null && pathname.startsWith('/workout')) {
                navigate('/home', { replace: true });
            } else if (workout !== null && !pathname.startsWith('/workout')) {
                navigate('/workout', { replace: true });
            }
        }
    }, [workout, navigate, pathname]);

    return (
        <WorkoutContext.Provider
            value={{
                workout,
                startWorkout,
                endWorkout,
                discardWorkout,
            }}
        >
            {children}
        </WorkoutContext.Provider>
    );
}
