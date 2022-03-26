import { useCallback, useEffect, useState } from 'react';

import ConfirmationBottomSheet from '../BottomSheet/components/ConfirmationBottomSheet/ConfirmationBottomSheet';
import { swRegistration } from '../..';
import { usePageVisibility } from 'react-page-visibility';

export default function ServiceWorkerUpdater() {
    const [showUpdateAvailablePrompt, setShowUpdateAvailablePrompt] =
        useState(false);

    const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<
        ServiceWorkerRegistration | undefined
    >();

    const onUpdateAvailable = useCallback(() => {
        if (serviceWorkerRegistration?.active) {
            setShowUpdateAvailablePrompt(true);
        }
    }, [serviceWorkerRegistration]);

    useEffect(() => {
        swRegistration.then((registration) => {
            setServiceWorkerRegistration(registration);
        });
    }, []);

    useEffect(() => {
        !!serviceWorkerRegistration &&
            (serviceWorkerRegistration.onupdatefound = onUpdateAvailable);
        return () => {
            !!serviceWorkerRegistration &&
                (serviceWorkerRegistration.onupdatefound = null);
        };
    }, [onUpdateAvailable, serviceWorkerRegistration]);

    const pageVisible = usePageVisibility();

    useEffect(() => {
        if (!!pageVisible && !!serviceWorkerRegistration) {
            serviceWorkerRegistration.update();
        }
    }, [pageVisible, serviceWorkerRegistration]);

    const onPromptResult = useCallback((result: boolean) => {
        setShowUpdateAvailablePrompt(false);
        if (!!result) {
            window.location.reload();
        }
    }, []);

    if (showUpdateAvailablePrompt) {
        return (
            <ConfirmationBottomSheet
                onResult={onPromptResult}
                prompt='A new version of this app is available. Would you like to reload now?'
            />
        );
    }

    return null;
}
