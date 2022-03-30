import {
    IWorkout,
    IWorkoutExerciseSet,
    WSWorkoutUpdate,
} from '@dgoudie/isometric-types';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { usePageVisibility } from 'react-page-visibility';
import { verifyType } from '../../utils/verify-type';

export const WorkoutContext = createContext<{
    workout?: IWorkout | null;
    startWorkout: () => void;
    endWorkout: () => void;
    discardWorkout: () => void;
    persistSet: (
        exerciseIndex: number,
        setIndex: number,
        set: IWorkoutExerciseSet
    ) => void;
}>({
    startWorkout: () => undefined,
    endWorkout: () => undefined,
    discardWorkout: () => undefined,
    persistSet: () => undefined,
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
        sendJsonMessage(verifyType<WSWorkoutUpdate>({ type: 'START' }));
    }, [sendJsonMessage]);
    const endWorkout = useCallback(() => {
        sendJsonMessage(verifyType<WSWorkoutUpdate>({ type: 'END' }));
    }, [sendJsonMessage]);
    const discardWorkout = useCallback(() => {
        sendJsonMessage(verifyType<WSWorkoutUpdate>({ type: 'DISCARD' }));
    }, [sendJsonMessage]);
    const persistSet = useCallback(
        (exerciseIndex: number, setIndex: number, set: IWorkoutExerciseSet) => {
            sendJsonMessage(
                verifyType<WSWorkoutUpdate>({
                    type: 'PERSIST_SET',
                    exerciseIndex,
                    setIndex,
                    set,
                })
            );
        },
        [sendJsonMessage]
    );

    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        if (typeof workout != 'undefined') {
            if (workout === null && pathname === '/workout') {
                navigate('/home', { replace: true });
            } else if (workout !== null && pathname !== '/workout') {
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
                persistSet,
            }}
        >
            {children}
        </WorkoutContext.Provider>
    );
}
