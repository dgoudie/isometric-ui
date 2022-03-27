import React, {
    MouseEvent,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import { CSSTransition } from 'react-transition-group';
import { CupertinoPane } from 'cupertino-pane';
import FocusLock from 'react-focus-lock';
import { Portal } from '@primer/react';
import styles from './BottomSheet.module.scss';

type PropsLocked<T> = {
    title?: string;
    locked: true;
    onResult: (result: T) => void;
    children: (onResult: (result: T) => void) => ReactNode;
};

type PropsNotLocked<T> = {
    title?: string;
    locked?: false;
    onResult: (result: T | undefined) => void;
    children: (onResult: (result: T) => void) => ReactNode;
};

const TIMEOUT = 250;

export default function BottomSheet<T extends unknown>({
    title,
    locked,
    onResult,
    children,
}: PropsLocked<T> | PropsNotLocked<T>) {
    const paneRef = useRef<CupertinoPane>();
    const paneDivRef = useRef<HTMLDivElement>(null);
    const headerDivRef = useRef<HTMLDivElement>(null);

    const onClosedNoResult = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            event.stopPropagation();
            if (!locked) {
                paneRef.current?.hide();
                paneRef.current?.destroy({ animate: true });
                setTimeout(() => onResult(undefined), TIMEOUT);
            }
        },
        [onResult, locked, paneRef]
    );

    const paneDismissed = useCallback(() => {
        !locked && onResult(undefined);
    }, [paneRef, locked, onResult]);

    const onClosedWithResult = useCallback(
        (result: T) => {
            paneRef.current?.hide();
            paneRef.current?.destroy({ animate: true });
            setTimeout(() => onResult(result), TIMEOUT);
        },
        [onResult, paneRef]
    );

    useEffect(() => {
        if (!paneDivRef.current || !!paneRef.current) {
            return;
        }
        paneRef.current = new CupertinoPane(paneDivRef.current, {
            fitHeight: true,
            buttonDestroy: false,
            showDraggable: false,
            bottomClose: true,
            animationDuration: TIMEOUT,
            backdrop: true,
            cssClass: styles.pane,
            dragBy: [`.${styles.sheetHeader}`],
            bottomOffset: 32,
            onDidDismiss: paneDismissed,
        });
        paneRef.current.present({ animate: true });
        if (!!locked) {
            paneRef.current.preventDismiss(true);
        }
    }, [paneDivRef, paneRef]);

    return (
        <Portal>
            <div onClick={onClosedNoResult} className={styles.backdrop}>
                <FocusLock>
                    <div
                        ref={paneDivRef}
                        onClick={(event) => event.stopPropagation()}
                    >
                        {(title || !locked) && (
                            <div className={styles.sheetHeader}>
                                <div className={styles.sheetHeaderTitle}>
                                    {title}
                                </div>
                                {!locked && (
                                    <button
                                        className={styles.sheetHeaderDismiss}
                                        type='button'
                                        onClick={onClosedNoResult}
                                    >
                                        <i className='fa-solid fa-xmark'></i>
                                    </button>
                                )}
                            </div>
                        )}
                        <div>{children(onClosedWithResult)}</div>
                    </div>
                </FocusLock>
            </div>
        </Portal>
    );
}
