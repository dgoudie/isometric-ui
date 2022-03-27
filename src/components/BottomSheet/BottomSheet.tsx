import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { CSSTransition } from 'react-transition-group';
import FocusLock from 'react-focus-lock';
import { Portal } from '@primer/react';
import styles from './BottomSheet.module.scss';
import { useSwipeable } from 'react-swipeable';

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

const TIMEOUT = 1000;

export default function BottomSheet<T extends unknown>({
    title,
    locked,
    onResult,
    children,
}: PropsLocked<T> | PropsNotLocked<T>) {
    const nodeRef = useRef<HTMLDivElement>(null);

    const [inProp, setInProp] = useState(false);

    const [distanceFrom0, setDistanceFrom0] = useState(0);
    const [dragDelta, setDragDelta] = useState(0);

    useEffect(() => {
        console.log('distanceFrom0', distanceFrom0, ', dragDelta', dragDelta);
    }, [distanceFrom0, dragDelta]);

    useEffect(() => {
        setInProp(true);
    }, [setInProp]);

    const onClosedNoResult = useCallback(() => {
        if (!locked) {
            setInProp(false);
            setTimeout(() => onResult(undefined), TIMEOUT);
        }
    }, [onResult, locked]);

    const onClosedWithResult = useCallback(
        (result: T) => {
            setInProp(false);
            setTimeout(() => onResult(result), TIMEOUT);
        },
        [onResult]
    );

    const handlers = useSwipeable({
        onSwiped: (eventData) =>
            setDistanceFrom0(distanceFrom0 + eventData.deltaY),
        onSwiping: (event) => setDragDelta(distanceFrom0 + event.deltaY),
        delta: 0,
        trackMouse: true,
    });

    return (
        <Portal>
            <CSSTransition
                nodeRef={nodeRef}
                in={inProp}
                classNames={{
                    enter: styles.rootEnter,
                    enterActive: styles.rootEnterActive,
                    enterDone: styles.rootEnterDone,
                }}
                timeout={250}
            >
                <div
                    className={styles.root}
                    onClick={onClosedNoResult}
                    ref={nodeRef}
                >
                    <FocusLock>
                        <div
                            className={styles.sheetRoot}
                            onClick={(e) => e.stopPropagation()}
                            // style={{
                            //     transform: dragDelta
                            //         ? `translateY(${dragDelta}px)`
                            //         : undefined,
                            // }}
                        >
                            {(title || !locked) && (
                                <div
                                    className={styles.sheetHeader}
                                    {...handlers}
                                >
                                    {title && (
                                        <div
                                            className={styles.sheetHeaderTitle}
                                        >
                                            {title}
                                        </div>
                                    )}
                                    {!locked && (
                                        <button
                                            className={
                                                styles.sheetHeaderDismiss
                                            }
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
            </CSSTransition>
        </Portal>
    );
}
