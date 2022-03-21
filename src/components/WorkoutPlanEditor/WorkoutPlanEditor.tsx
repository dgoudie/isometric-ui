import {
    DragDropContext,
    Draggable,
    DropResult,
    Droppable,
} from 'react-beautiful-dnd';
import { IExercise, IWorkoutScheduleDay } from '@dgoudie/isometric-types';
import { ObjectID, ObjectId } from 'bson';
import React, { useCallback, useState } from 'react';
import {
    deleteItemFromArray,
    moveItemInArray,
    replaceItemInArray,
} from '../../utils/array-helpers';

import CopyDayBottomSheet from '../CopyDayBottomSheet/CopyDayBottomSheet';
import ExercisePickerBottomSheet from '../ExercisePickerBottomSheet/ExercisePickerBottomSheet';
import MuscleGroupTag from '../MuscleGroupTag/MuscleGroupTag';
import styles from './WorkoutPlanEditor.module.scss';

interface Props {
    days: IWorkoutScheduleDay[];
    daysChanged: (days: IWorkoutScheduleDay[]) => void;
    exerciseMap: Map<string, IExercise>;
}

export default function WorkoutPlanEditor({
    days,
    exerciseMap,
    daysChanged,
}: Props) {
    const [copyDayVisible, setCopyDayVisible] = useState(false);

    const updateAndReportDays = useCallback(
        (updatedDays: typeof days) => {
            // setDays(updatedDays);
            daysChanged(updatedDays);
        },
        [daysChanged]
    );

    const onDragEnd = useCallback(
        ({ source, destination }: DropResult) => {
            if (!destination) {
                return;
            }
            if (destination.index === source.index) {
                return;
            }
            updateAndReportDays(
                moveItemInArray(days, source.index, destination.index)
            );
        },
        [days, updateAndReportDays]
    );

    const handleAdd = useCallback(() => {
        updateAndReportDays([
            ...days,
            { exercises: [], nickname: '', _id: new ObjectID().toString() },
        ]);
    }, [days, updateAndReportDays]);

    const handleDelete = useCallback(
        (index: number) => {
            updateAndReportDays(deleteItemFromArray(days, index));
        },
        [days, updateAndReportDays]
    );

    const dayChanged = useCallback(
        (day: IWorkoutScheduleDay, index: number) => {
            updateAndReportDays(replaceItemInArray(days, index, day));
        },
        [days, updateAndReportDays]
    );

    const onCopyDayResult = useCallback(
        (result: number | undefined) => {
            if (typeof result !== 'undefined') {
                const day = days[result];
                daysChanged([
                    ...days,
                    { ...day, _id: new ObjectId().toString() },
                ]);
            }
            setCopyDayVisible(false);
        },
        [days, daysChanged]
    );

    if (!days.length) {
        return (
            <div className={styles.noDays}>
                <span>
                    Here, you can build a workout schedule. Start by adding a
                    day, and adding some exercises.
                </span>
                <button
                    className={'standard-button primary'}
                    onClick={handleAdd}
                >
                    <i className='fa-solid fa-plus'></i>
                    Add Day
                </button>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId='workout_plan_days'>
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {days.map((day, index) => (
                                <Day
                                    key={day._id}
                                    day={day}
                                    dayChanged={(day) => dayChanged(day, index)}
                                    index={index}
                                    exerciseMap={exerciseMap}
                                    onDelete={() => handleDelete(index)}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <div className={styles.addDay}>
                <button
                    className={'standard-button'}
                    onClick={() => setCopyDayVisible(true)}
                >
                    <i className='fa-solid fa-copy'></i>
                    Copy Day
                </button>
                <button
                    className={'standard-button primary'}
                    onClick={handleAdd}
                >
                    <i className='fa-solid fa-plus'></i>
                    Add Day
                </button>
            </div>
            {copyDayVisible && (
                <CopyDayBottomSheet days={days} onResult={onCopyDayResult} />
            )}
        </div>
    );
}

interface DayProps {
    day: IWorkoutScheduleDay;
    dayChanged: (day: IWorkoutScheduleDay) => void;
    index: number;
    exerciseMap: Map<string, IExercise>;
    onDelete: () => void;
}

function Day({ day, dayChanged, index, exerciseMap, onDelete }: DayProps) {
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
        <Draggable draggableId={day._id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    className={styles.day}
                    {...provided.draggableProps}
                >
                    <div className={styles.dayHeader}>
                        <div
                            className={styles.dayHandle}
                            {...provided.dragHandleProps}
                        >
                            <i className='fa-solid fa-grip-lines'></i>
                        </div>
                        <div className={styles.dayNumber}>Day {index + 1}</div>
                        <div className={styles.nicknameInputWrapper}>
                            <input
                                placeholder='Enter a nickname for this day...'
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
                        <Droppable droppableId={day._id}>
                            {(provided) => (
                                <div
                                    className={styles.exercises}
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {day.exercises.map((exerciseId, index) => (
                                        <Exercise
                                            index={index}
                                            key={`day_${index}_${exerciseId}_${index}`}
                                            exerciseId={exerciseId}
                                            exerciseMap={exerciseMap}
                                            onDelete={() =>
                                                handleExerciseDelete(index)
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
                        className={styles.addExercise}
                        onClick={() => setExercisePickerVisible(true)}
                    >
                        <div className={styles.exerciseHandle}>
                            <i className='fa-solid fa-plus'></i>
                        </div>
                        <div className={styles.exerciseName}>Add Exercise</div>
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

interface ExerciseProps {
    index: number;
    exerciseId: string;
    exerciseMap: Map<string, IExercise>;
    onDelete: () => void;
}

function Exercise({ index, exerciseId, exerciseMap, onDelete }: ExerciseProps) {
    const deleteExerciseWrapped = useCallback(
        (event) => {
            event.stopPropagation();
            onDelete();
        },
        [onDelete]
    );

    const exercise = exerciseMap.get(exerciseId)!;
    return (
        <Draggable draggableId={exerciseId} index={index}>
            {(provided) => (
                <div
                    className={styles.exercise}
                    key={`${exerciseId}_${index}`}
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                >
                    <div
                        className={styles.exerciseHandle}
                        {...provided.dragHandleProps}
                    >
                        <i className='fa-solid fa-grip-lines'></i>
                    </div>
                    <div className={styles.exerciseName}>{exercise.name}</div>
                    <MuscleGroupTag muscleGroup={exercise.primaryMuscleGroup} />
                    <button
                        type='button'
                        onClick={deleteExerciseWrapped}
                        className={styles.deleteIcon}
                    >
                        <i className='fa-solid fa-xmark'></i>
                    </button>
                </div>
            )}
        </Draggable>
    );
}
