import React from 'react';
import classNames from 'classnames';
import styles from './Button.module.scss';

interface Props
    extends React.PropsWithChildren<
        React.DetailedHTMLProps<
            React.ButtonHTMLAttributes<HTMLButtonElement>,
            HTMLButtonElement
        >
    > {
    primary?: boolean;
}

export default function Button({ primary = false, children, ...props }: Props) {
    return (
        <button
            {...props}
            className={classNames(primary && styles.primary, styles.root)}
        >
            {children}
        </button>
    );
}
