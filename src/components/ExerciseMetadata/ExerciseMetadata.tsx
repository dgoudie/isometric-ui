import { IExerciseExtended } from '@dgoudie/isometric-types';
import React from 'react';
import styles from './ExerciseMetadata.module.scss';

interface Props {
  exercise: IExerciseExtended;
}

const format = new Intl.DateTimeFormat('en-US');

export default function ExerciseMetadata({ exercise }: Props) {
  let itemMetaLineOne = (
    <li>
      PR: <span className={styles.metaNone}>None</span>
    </li>
  );
  if (!!exercise.bestSet) {
    switch (exercise.exerciseType) {
      case 'rep_based': {
        itemMetaLineOne = (
          <li>
            PR: {exercise.bestInstance!.totalRepsForInstance} reps (
            {format.format(new Date(exercise.bestInstance!.createdAt))})
          </li>
        );
        break;
      }
      case 'timed': {
        itemMetaLineOne = <></>;
        break;
      }
      default: {
        itemMetaLineOne = (
          <li>
            PR: {exercise.bestSet.resistanceInPounds} lbs (
            {format.format(new Date(exercise.bestInstance!.createdAt))})
          </li>
        );
      }
    }
  }

  let itemMetaLineTwo = (
    <li>
      Last Performed: <span className={styles.metaNone}>Never</span>
    </li>
  );

  if (!!exercise.lastPerformed) {
    itemMetaLineTwo = (
      <li>Last Performed: {format.format(new Date(exercise.lastPerformed))}</li>
    );
  }
  return (
    <ol className={styles.meta}>
      {itemMetaLineOne}
      {itemMetaLineTwo}
    </ol>
  );
}
