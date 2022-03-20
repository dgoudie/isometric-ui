import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { CSSTransition } from 'react-transition-group';
import FocusLock from 'react-focus-lock';
import styles from './BottomSheet.module.scss';

type PropsLocked<T> = {
    title: string;
    locked: true;
    onResult: (result: T) => void;
    children: (onResult: (result: T) => void) => ReactNode;
};

type PropsNotLocked<T> = {
    title: string;
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
    const nodeRef = useRef<HTMLDivElement>(null);

    const [inProp, setInProp] = useState(false);

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

    return (
        <CSSTransition
            nodeRef={nodeRef}
            in={inProp}
            classNames={{
                enter: styles.rootEnter,
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
                    >
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
                        <div className={styles.sheetBody}>
                            {children(onClosedWithResult)}
                        </div>
                    </div>
                </FocusLock>
            </div>
        </CSSTransition>
    );
}
