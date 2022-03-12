import { useEffect, useRef, useState } from 'react';

import { WsBroadcastMessage } from '@dgoudie/isometric-types';
import { singletonHook } from 'react-singleton-hook';
import { usePageVisibility } from 'react-page-visibility';
import useWebSocket from 'react-use-websocket';

const useWebSocketSingleton = singletonHook<
    [WsBroadcastMessage | null, boolean]
>([null, false], () => {
    let loc = window.location;
    let websocketUri: string;
    if (loc.protocol === 'https:') {
        websocketUri = 'wss:';
    } else {
        websocketUri = 'ws:';
    }
    websocketUri += '//' + loc.host;
    websocketUri += '/api';
    const pageVisible: boolean = usePageVisibility();
    const {
        lastJsonMessage: message,
    }: { lastJsonMessage: WsBroadcastMessage } = useWebSocket(
        websocketUri,
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
