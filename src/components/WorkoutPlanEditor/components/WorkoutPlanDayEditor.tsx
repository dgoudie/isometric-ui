import {
    DragDropContext,
    Draggable,
    DropResult,
    Droppable,
} from 'react-beautiful-dnd';
import { IExercise, IWorkoutScheduleDay } from '@dgoudie/isometric-types';
import { ObjectID, ObjectId } from 'bson';
import React, { useCallback, useState } from 'react';

import styles from './WorkoutPlanDayEditor.module.scss';

interface Props {
    day: IWorkoutScheduleDay;
    dayChanged: (day: IWorkoutScheduleDay) => void;
    index: number;
    exerciseMap: Map<string, IExercise>;
    onDelete: () => void;
}

export default function WorkoutPlanDayEditor({
    day,
    dayChanged,
    index,
    exerciseMap,
    onDelete,
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
