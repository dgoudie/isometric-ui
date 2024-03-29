import * as Yup from 'yup';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { ExerciseType, IExercise } from '@dgoudie/isometric-types';
import {
  ReadableResource,
  emptyReadableResource,
  fetchFromApiAsReadableResource,
} from '../../utils/fetch-from-api';
import {
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import DurationInputField from '../../components/DurationInputField/DurationInputField';
import ExerciseTypePickerField from '../../components/ExerciseTypePickerField/ExerciseTypePickerField';
import MuscleGroupPickerField from '../../components/MuscleGroupPickerField/MuscleGroupPickerField';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import SetCountPickerField from '../../components/SetCountPickerField/SetCountPickerField';
import { SnackbarContext } from '../../providers/Snackbar/Snackbar';
import classNames from 'classnames';
import { getFormikInitiallyTouchedFields } from '../../utils/formik-initially-touched';
import styles from './index.module.scss';

Yup.addMethod(Yup.array, 'unique', function (message, mapper = (a: any) => a) {
  return this.test('unique', message, (list: any[] | undefined) => {
    if (!list) {
      return false;
    }
    if (list.every((item) => !item)) {
      return true;
    }
    return list.length === new Set(list.map(mapper)).size;
  });
});

const ExerciseSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  breakTimeInSeconds: Yup.number()
    .positive('Break Time must be more than zero')
    .max(300, 'Break Time must be less than 5 minutes')
    .required('Break Time is required'),
  setCount: Yup.number()
    .integer('Set Count must be a number')
    .positive('Set Count must be more than zero')
    .max(5, 'Set Count cannot be higher than 5')
    .required('Set Count is required'),
  primaryMuscleGroup: Yup.string().required('Primary Muscle Group is required'),
  secondaryMuscleGroups: Yup.array()
    .when(['primaryMuscleGroup'], (primaryMuscleGroup, schema) => {
      return schema.of(
        Yup.string()
          .optional()
          .notOneOf(
            [primaryMuscleGroup],
            !!primaryMuscleGroup ? 'All muscle groups must be unique\n' : ''
          )
      );
    })
    //@ts-ignore
    .unique('All muscle groups must be unique\n'),
  minimumRecommendedRepetitions: Yup.number()
    .integer('Minimum must be a number')
    .positive('Minimum must be more than zero')
    .when(
      ['exerciseType', 'maximumRecommendedRepetitions'],
      //@ts-ignore
      (
        exerciseType: ExerciseType,
        maximumRecommendedRepetitions: number,
        schema: Yup.NumberSchema
      ) => {
        schema = schema.max(
          maximumRecommendedRepetitions - 1,
          'Minimum must be less than maximum'
        );
        if (exerciseType === 'assisted' || exerciseType === 'weighted') {
          schema = schema.required('Minimum is required');
        }
        return schema;
      }
    ),
  maximumRecommendedRepetitions: Yup.number()
    .integer('Maximum must be a number')
    .positive('Maximum must be more than zero')
    .when(
      ['exerciseType'],
      //@ts-ignore
      (exerciseType: ExerciseType, schema: Yup.NumberSchema) => {
        if (exerciseType === 'assisted' || exerciseType === 'weighted') {
          schema = schema.required('Maximum is required');
        }
        return schema;
      }
    ),
  timePerSetInSeconds: Yup.number()
    .positive('Time Per Set must be more than zero')
    .max(18000, 'Time Per Set must be less than 5 hours')
    .when(
      ['exerciseType'],
      //@ts-ignore
      (exerciseType: ExerciseType, schema: Yup.NumberSchema) => {
        if (exerciseType === 'timed') {
          schema = schema.required('Time Per Set is required');
        }
        return schema;
      }
    ),
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

  const { openSnackbar } = useContext(SnackbarContext);

  const navigate = useNavigate();

  return (
    <div className={styles.root}>
      <Formik
        initialTouched={getFormikInitiallyTouchedFields(exercise)}
        initialValues={exercise}
        validationSchema={ExerciseSchema}
        onSubmit={async (values) => {
          values.secondaryMuscleGroups = values.secondaryMuscleGroups?.filter(
            (group) => !!group
          );
          if (
            values.exerciseType === 'timed' ||
            values.exerciseType === 'rep_based'
          ) {
            delete values.minimumRecommendedRepetitions;
            delete values.maximumRecommendedRepetitions;
          }
          await fetch(`/api/exercise`, {
            method: 'PUT',
            body: JSON.stringify(values),
            headers: { 'content-type': 'application/json' },
            credentials: 'same-origin',
          });
          openSnackbar('Exercise saved successfully.');
          navigate('/exercises');
        }}
      >
        {(formik) => {
          const {
            isValid,
            isSubmitting,
            resetForm,
            values,
            setFieldValue,
            validateForm,
          } = formik;

          useEffect(() => {
            if (
              values.exerciseType === 'timed' ||
              values.exerciseType === 'rep_based'
            ) {
              setFieldValue('minimumRecommendedRepetitions', '');
              setFieldValue('maximumRecommendedRepetitions', '');
              validateForm();
            }
            if (values.exerciseType !== 'timed') {
              setFieldValue('timePerSetInSeconds', undefined);
              validateForm();
            }
          }, [values.exerciseType]);

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
              <label htmlFor='setCount'>Primary Muscle Group</label>
              <MuscleGroupPickerField
                name='primaryMuscleGroup'
                disabled={isSubmitting}
                className={styles.muscleGroupPicker}
              />
              <ErrorMessage
                name='primaryMuscleGroup'
                component='span'
                className={styles.errorMessage}
              />
              <label htmlFor='setCount'>Secondary Muscle Groups</label>
              <MuscleGroupPickerField
                name='secondaryMuscleGroups[0]'
                disabled={isSubmitting}
                className={styles.muscleGroupPicker}
              />
              <MuscleGroupPickerField
                name='secondaryMuscleGroups[1]'
                disabled={isSubmitting}
                className={styles.muscleGroupPicker}
              />
              <ErrorMessage
                name='secondaryMuscleGroups'
                component='pre'
                className={styles.errorMessage}
              />
              <ErrorMessage
                name='secondaryMuscleGroups[0]'
                component='pre'
                className={styles.errorMessage}
              />
              <ErrorMessage
                name='secondaryMuscleGroups[1]'
                component='pre'
                className={styles.errorMessage}
              />
              <label htmlFor='breakTimeInSeconds'>
                Break Time Between Sets
              </label>
              <DurationInputField name='breakTimeInSeconds' />
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
              {(formik.values.exerciseType === 'assisted' ||
                formik.values.exerciseType === 'weighted') && (
                <>
                  <label htmlFor='minimumRecommendedRepetitions'>
                    Recommended Repetitions
                  </label>
                  <div className={styles.repetitions}>
                    <Field
                      type='number'
                      inputMode='decimal'
                      id='minimumRecommendedRepetitions'
                      name='minimumRecommendedRepetitions'
                      className={classNames('standard-form-input')}
                      disabled={isSubmitting}
                    />
                    <span>to</span>
                    <Field
                      type='number'
                      inputMode='decimal'
                      id='maximumRecommendedRepetitions'
                      name='maximumRecommendedRepetitions'
                      className={classNames('standard-form-input')}
                      disabled={isSubmitting}
                    />
                  </div>
                  <ErrorMessage
                    name='maximumRecommendedRepetitions'
                    component='span'
                    className={styles.errorMessage}
                  />
                  <ErrorMessage
                    name='minimumRecommendedRepetitions'
                    component='span'
                    className={styles.errorMessage}
                  />
                </>
              )}
              {formik.values.exerciseType === 'timed' && (
                <>
                  <label htmlFor='timePerSetInSeconds'>Time Per Set</label>
                  <DurationInputField name='timePerSetInSeconds' />
                  <ErrorMessage
                    name='timePerSetInSeconds'
                    component='span'
                    className={styles.errorMessage}
                  />
                </>
              )}
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
