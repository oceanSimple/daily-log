import { h } from 'vue';

export const PlusIcon = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [h('path', { d: 'M12 5v14' }), h('path', { d: 'M5 12h14' })],
  );

export const EditIcon = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [
      h('path', { d: 'M12 20h9' }),
      h('path', {
        d: 'M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z',
      }),
    ],
  );

export const DeleteIcon = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [
      h('path', { d: 'M3 6h18' }),
      h('path', { d: 'M8 6V4h8v2' }),
      h('path', { d: 'M19 6l-1 14H6L5 6' }),
      h('path', { d: 'M10 11v6' }),
      h('path', { d: 'M14 11v6' }),
    ],
  );

export const CheckIcon = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [h('path', { d: 'M20 6 9 17l-5-5' })],
  );

export const CircleIcon = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [h('circle', { cx: '12', cy: '12', r: '8' })],
  );
