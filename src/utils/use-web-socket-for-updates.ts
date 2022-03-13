import { useEffect, useRef, useState } from 'react';

import { WsBroadcastMessage } from '@dgoudie/isometric-types';
import { singletonHook } from 'react-singleton-hook';
import { usePageVisibility } from 'react-page-visibility';
import useWebSocket from 'react-use-websocket';

const useWebSocketSingleton = singletonHook<
    [WsBroadcastMessage | null, boolean]
>([null, false], () => {
    const pageVisible: boolean = usePageVisibility();
    const {
        lastJsonMessage: message,
    }: { lastJsonMessage: WsBroadcastMessage } = useWebSocket(
        process.env.REACT_APP_WS!,
        {
            shouldReconnect: () => true,
        },
        pageVisible
    );

    return [message, pageVisible];
});

export const useWebSocketForUpdates = (path: string) => {
    const [message, pageVisible] = useWebSocketSingleton();
    const previousPageVisibleRef = useRef(pageVisible);
    const [date, setDate] = useState(Date.now());

    useEffect(() => {
        if (message && message.type === 'UPDATE' && message.apiPath === path) {
            setDate(message.timestamp);
        } else if (pageVisible && !previousPageVisibleRef.current) {
            setDate(Date.now());
        }
    }, [message, path, pageVisible]);

    useEffect(() => {
        previousPageVisibleRef.current = pageVisible;
    }, [pageVisible]);
    return date;
};
