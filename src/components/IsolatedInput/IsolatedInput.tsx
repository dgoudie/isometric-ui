import React, { useCallback, useMemo, useRef, useState } from 'react';

import classNames from 'classnames';
import styles from './IsolatedInput.module.scss';

interface Props
    extends React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    > {
    onIsolatedInputSubmit?: (
        value: string | number | readonly string[] | undefined
    ) => void;
}

export default function IsolatedInput({
    onIsolatedInputSubmit,
    ...props
}: Props) {
    const initialValue = useMemo(
        () => props.defaultValue || props.value,
        [props.defaultValue, props.value]
    );
    const [value, setValue] = useState(initialValue);

    const detailsComponentRef = useRef<HTMLDetailsElement>(null);
    const inputComponentRef = useRef<HTMLInputElement>(null);

    const onDetailsToggle = useCallback(() => {
        inputComponentRef.current?.focus();
    }, [inputComponentRef]);

    const onCancel = useCallback(() => {
        if (!!inputComponentRef.current) {
            if (typeof initialValue === 'string') {
                inputComponentRef.current.value = initialValue;
            } else {
                inputComponentRef.current.value = '';
            }
        }
        if (!!detailsComponentRef.current) {
            detailsComponentRef.current.open = false;
        }
    }, [initialValue, detailsComponentRef, inputComponentRef]);

    const onFormSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
        (event) => {
            event.preventDefault();
            !!onIsolatedInputSubmit && onIsolatedInputSubmit(value);
        },
        [onIsolatedInputSubmit, value]
    );

    return (
        <div className={styles.root}>
            <details ref={detailsComponentRef} onToggle={onDetailsToggle}>
                <summary>
                    <span>{value}</span>
                    <i
                        className={classNames(
                            'fa-solid fa-pen',
                            styles.editIcon
                        )}
                    />
                </summary>
                <form onSubmit={onFormSubmit}>
                    <input {...props} ref={inputComponentRef} />
                    <section>
                        <button type='button' onClick={onCancel}>
                            <i className='fa-solid fa-xmark' />
                        </button>
                        <button type='submit'>
                            <i className='fa-solid fa-check' />
                        </button>
                    </section>
                </form>
            </details>
        </div>
    );
}
