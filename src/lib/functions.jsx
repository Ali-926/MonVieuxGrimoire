/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable comma-dangle */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import React from 'react';
import styles from '../components/Books/BookItem/BookItem.module.css';

export function displayStars(rating) {
  const stars = [];
  for (let i = 0; i < 5; i += 1) {
    const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;

    stars.push(
      <span
        key={i}
        style={{
          position: 'relative',
          display: 'inline-block',
        }}
      >
        {/* étoile vide */}
        <FontAwesomeIcon
          icon={solid('star')}
          className={styles.empty}
        />

        {/* étoile pleine partielle */}
        {fillPercentage > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${fillPercentage}%`,
              overflow: 'hidden',
            }}
          >
            <FontAwesomeIcon
              icon={solid('star')}
              className={styles.full}
            />
          </span>
        )}
      </span>
    );
  }

  return stars;
}
export function generateStarsInputs(rating, register, readOnly = false) {
  const stars = [];
  for (let i = 1; i < 6; i += 1) {
    if (rating > 0 && i <= Math.round(rating)) {
      stars.push(
        readOnly ? (
          <FontAwesomeIcon
            key={`full-${i}`}
            icon={solid('star')}
            className={styles.full}
          />
        ) : (
          <label key={`full-${i}`} htmlFor={`rating${i}`}>
            <FontAwesomeIcon icon={solid('star')} className={styles.full} />
            <input type="radio" value={i} id={`rating${i}`} {...register('rating')} readOnly={readOnly} />
          </label>
        )
      );
    } else {
      stars.push(
        readOnly ? (
          <FontAwesomeIcon
            key={`empty-${i}`}
            icon={solid('star')}
            className={styles.empty}
          />
        ) : (
          <label key={`empty-${i}`} htmlFor={`rating${i}`}>
            <FontAwesomeIcon icon={solid('star')} className={styles.empty} />
            <input type="radio" value={i} id={`rating${i}`} {...register('rating')} />
          </label>
        )
      );
    }
  }
  return stars;
}
