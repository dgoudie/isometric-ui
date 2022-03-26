import {
    DragDropContext,
    Draggable,
    DropResult,
    Droppable,
} from 'react-beautiful-dnd';
import { IExercise, IScheduleDay } from '@dgoudie/isometric-types';
import React, { useCallback, useState } from 'react';
import {
    deleteItemFromArray,
    moveItemInArray,
} from '../../../../utils/array-helpers';

import ExercisePickerBottomSheet from '../../../BottomSheet/components/ExercisePickerBottomSheet/ExercisePickerBottomSheet';
import { IScheduleDayWithId } from '../../WorkoutPlanEditor';
import WorkoutPlanDayExerciseEditor from '../WorkoutPlanDayExerciseEditor/WorkoutPlanDayExerciseEditor';
import classNames from 'classnames';
import styles from './WorkoutPlanDayEditor.module.scss';

interface Props {
    day: IScheduleDayWithId;
    dayChanged: (day: IScheduleDayWithId) => void;
    index: number;
    exerciseMap: Map<string, IExercise>;
    onDelete: () => void;
    dayReorderModeEnabled: boolean;
}

export default function WorkoutPlanDayEditor({
    day,
    dayChanged,
    index,
    exerciseMap,
    onDelete,
    dayReorderModeEnabled,
}: Props) {
    const [exercisePickerVisible, setExercisePickerVisible] = useState(false);

    const exercisesChanged = useCallback(
        (exercises: string[]) => dayChanged({ ...day, exercises }),
        [day, dayChanged]
    );

    const nicknameChanged = useCallback(
        (nickname: string) => dayChanged({ ...day, nickname }),
        [day, dayChanged]
    );

    const onExercisePickerResult = useCallback(
        (result: string | undefined) => {
            setExercisePickerVisible(false);
            if (!!result) {
                exercisesChanged([...day.exercises, result]);
            }
        },
        [day.exercises, exercisesChanged]
    );

    const deleteDayWrapped = useCallback(
        (event) => {
            event.stopPropagation();
            onDelete();
        },
        [onDelete]
    );

    const onDragEnd = useCallback(
        ({ source, destination }: DropResult) => {
            if (!destination) {
                return;
            }
            if (destination.index === source.index) {
                return;
            }
            exercisesChanged(
                moveItemInArray(day.exercises, source.index, destination.index)
            );
        },
        [day.exercises, exercisesChanged]
    );

    const handleExerciseDelete = useCallback(
        (index: number) => {
            exercisesChanged(deleteItemFromArray(day.exercises, index));
        },
        [day.exercises, exercisesChanged]
    );

    return (
        <Draggable draggableId={day.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    className={styles.day}
                    {...provided.draggableProps}
                >
                    <div className={styles.dayHeader}>
                        <div
                            className={classNames(
                                styles.dayHandle,
                                dayReorderModeEnabled && styles.reordering
                            )}
                            {...provided.dragHandleProps}
                        >
                            <i className='fa-solid fa-grip-lines'></i>
                        </div>
                        <div className={styles.dayNumber}>Day {index + 1}</div>
                        <div className={styles.nicknameInputWrapper}>
                            <input
                                placeholder='Enter a nickname...'
                                defaultValue={day.nickname}
                                onChange={(e) =>
                                    nicknameChanged(e.target.value)
                                }
                            />
                        </div>
                        <button
                            type='button'
                            onClick={deleteDayWrapped}
                            className={styles.deleteIcon}
                        >
                            <i className='fa-solid fa-trash'></i>
                        </button>
                    </div>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId={day.id}>
                            {(provided) => (
                                <div
                                    className={classNames(
                                        styles.exercises,
                                        dayReorderModeEnabled && styles.reorder
                                    )}
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {day.exercises.map((exerciseId, index) => (
                                        <WorkoutPlanDayExerciseEditor
                                            index={index}
                                            key={`day_${index}_${exerciseId}_${index}`}
                                            exerciseId={exerciseId}
                                            exerciseMap={exerciseMap}
                                            onDelete={() =>
                                                handleExerciseDelete(index)
                                            }
                                            dayReorderModeEnabled={
                                                dayReorderModeEnabled
                                            }
                                        />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    {day.exercises.length === 0 && (
                        <div className={styles.noExercises}>
                            Please add at least one exercise.
                        </div>
                    )}
                    <button
                        className={classNames(
                            styles.addExercise,
                            dayReorderModeEnabled && styles.reorder
                        )}
                        onClick={() => setExercisePickerVisible(true)}
                    >
                        <div className={styles.addExerciseHandle}>
                            <i className='fa-solid fa-plus'></i>
                        </div>
                        <div className={styles.addExerciseName}>
                            Add Exercise
                        </div>
                    </button>
                    {exercisePickerVisible && (
                        <ExercisePickerBottomSheet
                            onResult={onExercisePickerResult}
                        />
                    )}
                </div>
            )}
        </Draggable>
    );
}
