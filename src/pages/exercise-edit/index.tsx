import * as Yup from 'yup';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import {
  ReadableResource,
  emptyReadableResource,
  fetchFromApiAsReadableResource,
} from '../../utils/fetch-from-api';
import { Suspense, useEffect, useMemo, useState, useTransition } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import ExerciseTypePickerField from '../../components/ExerciseTypePickerField/ExerciseTypePickerField';
import { IExercise } from '@dgoudie/isometric-types';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import SetCountPickerField from '../../components/SetCountPickerField/SetCountPickerField';
import classNames from 'classnames';
import { getFormikInitiallyTouchedFields } from '../../utils/formik-initially-touched';
import styles from './index.module.scss';
import { useParams } from 'react-router-dom';

const ExerciseSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  breakTimeInSeconds: Yup.number()
    .integer('Break Time must be a whole number')
    .positive('Break Time must be more than zero')
    .max(300, 'Break Time must be less than 5 minutes')
    .required('Break Time is required'),
  setCount: Yup.number()
    .integer('Set Count must be a number')
    .positive('Set Count must be more than zero')
    .max(5, 'Set Count cannot be higher than 5')
    .required('Set Count is required'),
});

let initialExerciseResponse = emptyReadableResource();

export default function ExerciseEdit() {
  const { exerciseName } = useParams();

  const [exerciseResponse, setExerciseResponse] = useState(
    initialExerciseResponse
  );

  const [_isPending, startTransaction] = useTransition();

  useEffect(() => {
    startTransaction(() => {
      const updatedResponse = fetchFromApiAsReadableResource<IExercise>(
        `/api/exercise/${exerciseName}`
      );
      setExerciseResponse(updatedResponse);
    });
  }, [exerciseName]);

  return (
    <AppBarWithAppHeaderLayout pageTitle={exerciseName!}>
      <Suspense fallback={<RouteLoader />}>
        <ExerciseEditContent exerciseResponse={exerciseResponse} />
      </Suspense>
    </AppBarWithAppHeaderLayout>
  );
}

interface ExerciseContentProps {
  exerciseResponse: ReadableResource<IExercise>;
}

function ExerciseEditContent({ exerciseResponse }: ExerciseContentProps) {
  const exercise = exerciseResponse.read();

  const standardFormInputStyles = useMemo(
    () => classNames('standard-form-input', styles.input),
    []
  );
  return (
    <div className={styles.root}>
      <Formik
        initialTouched={getFormikInitiallyTouchedFields(exercise)}
        initialValues={exercise}
        validationSchema={ExerciseSchema}
        onSubmit={(values) => {
          console.log(values);
        }}
      >
        {(formik) => {
          const { isValid, isSubmitting, resetForm } = formik;
          return (
            <Form>
              <label htmlFor='name'>Name</label>
              <Field
                autoFocus
                id='name'
                name='name'
                className={standardFormInputStyles}
                disabled={isSubmitting}
              />
              <ErrorMessage
                name='name'
                component='span'
                className={styles.errorMessage}
              />
              <label htmlFor='breakTimeInSeconds'>
                Break Time Between Sets (In Seconds)
              </label>
              <Field
                type='number'
                inputMode='decimal'
                id='breakTimeInSeconds'
                name='breakTimeInSeconds'
                className={standardFormInputStyles}
                disabled={isSubmitting}
              />
              <ErrorMessage
                name='breakTimeInSeconds'
                component='span'
                className={styles.errorMessage}
              />
              <label htmlFor='setCount'>Set Count</label>
              <SetCountPickerField name='setCount' disabled={isSubmitting} />
              <ErrorMessage
                name='setCount'
                component='span'
                className={styles.errorMessage}
              />
              <label htmlFor='exerciseType'>Exercise Type</label>
              <ExerciseTypePickerField
                name='exerciseType'
                disabled={isSubmitting}
              />
              {/* <label htmlFor='minimumRecommendedRepetitions'>
                                Recommended Repetitions
                            </label>
                            <Field
                                type='number'
                                inputMode="decimal"
                                id='minimumRecommendedRepetitions'
                                name='minimumRecommendedRepetitions'
                                className={classNames(
                                    'standard-form-input'
                                )}
                                disabled={isSubmitting}
                            />
                            <ErrorMessage
                                name='minimumRecommendedRepetitions'
                                component='span'
                                className={styles.errorMessage}
                            />
                            <Field
                                type='number'
                                inputMode="decimal"
                                id='maximumRecommendedRepetitions'
                                name='maximumRecommendedRepetitions'
                                className={classNames(
                                    'standard-form-input'
                                )}
                                disabled={isSubmitting}
                            />
                            <ErrorMessage
                                name='maximumRecommendedRepetitions'
                                component='span'
                                className={styles.errorMessage}
                            /> */}
              <div className={styles.buttonBar}>
                <button
                  type='button'
                  className='standard-button'
                  onClick={() => resetForm()}
                  disabled={isSubmitting}
                >
                  <i className='fa-solid fa-rotate-left'></i>
                  Reset
                </button>
                <button
                  className='standard-button primary'
                  type='submit'
                  disabled={!isValid || isSubmitting}
                >
                  <i className='fa-solid fa-floppy-disk'></i>
                  Save
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
