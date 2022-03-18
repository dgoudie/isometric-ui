import { useEffect, useRef, useState } from 'react';

export default function useDebounce<T>(value: T, delayInMs: number) {
    const [timeoutId, setTimeoutId] = useState<number | undefined>(undefined);
    const previousTimeoutId = useRef<number | undefined>(undefined);

    useEffect(() => {
        clearTimeout(previousTimeoutId.current);
        previousTimeoutId.current = timeoutId;
    }, [timeoutId]);

    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        if (!value) {
            setDebouncedValue(value);
        } else {
            setTimeoutId(
                setTimeout(() => {
                    setDebouncedValue(value);
                }, delayInMs) as unknown as number
            );
        }
        return () => {
            setTimeoutId(undefined);
        };
    }, [delayInMs, value]);
    return debouncedValue;
}
