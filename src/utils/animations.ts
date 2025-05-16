/**
 * Custom animations for page transitions
 */

/**
 * FadeBlur animation - combines fade and blur effects for smooth page transitions
 */
export const fadeBlur = {
  forwards: {
    old: [
      {
        name: 'fadeOut',
        duration: '300ms',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fillMode: 'both',
      },
      {
        name: 'blurOut',
        duration: '300ms',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fillMode: 'both',
      },
    ],
    new: [
      {
        name: 'fadeIn',
        duration: '300ms',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fillMode: 'both',
        delay: '100ms',
      },
      {
        name: 'blurIn',
        duration: '300ms',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fillMode: 'both',
        delay: '100ms',
      },
    ],
  },
  backwards: {
    old: [
      {
        name: 'fadeOut',
        duration: '300ms',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fillMode: 'both',
      },
      {
        name: 'blurOut',
        duration: '300ms',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fillMode: 'both',
      },
    ],
    new: [
      {
        name: 'fadeIn',
        duration: '300ms',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fillMode: 'both',
        delay: '100ms',
      },
      {
        name: 'blurIn',
        duration: '300ms',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fillMode: 'both',
        delay: '100ms',
      },
    ],
  },
};
