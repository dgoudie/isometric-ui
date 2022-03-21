import BottomSheet from '../BottomSheet/BottomSheet';
import { IWorkoutScheduleDay } from '@dgoudie/isometric-types';
import styles from './CopyDayBottomSheet.module.scss';

interface Props {
    days: IWorkoutScheduleDay[];
    onResult: (result: number | undefined) => void;
}

export default function CopyDayBottomSheet({ days, onResult }: Props) {
    return (
        <BottomSheet onResult={onResult} title='Select a Day to Copy'>
            {(onResult) => {
                const dayElements = days.map((day, index) => (
                    <CopyDayBottomSheetButton
                        key={index}
                        day={day}
                        index={index}
                        onSelected={() => onResult(index)}
                    />
                ));
                return <div className={styles.root}>{dayElements}</div>;
            }}
        </BottomSheet>
    );
}

interface CopyDayBottomSheetButtonProps {
    index: number;
    day: IWorkoutScheduleDay;
    onSelected: () => void;
}

function CopyDayBottomSheetButton({
    index,
    day,
    onSelected,
}: CopyDayBottomSheetButtonProps) {
    return (
        <button type='button' onClick={onSelected}>
            <div>
                Day {index + 1} -{' '}
                {!!day.nickname ? (
                    day.nickname
                ) : (
                    <span className={styles.noNickname}>No Name</span>
                )}
            </div>
        </button>
    );
}
