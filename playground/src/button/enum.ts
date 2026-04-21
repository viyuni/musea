export type Size = 'medium' | 'small' | 'large';

export interface CommonProps {
  size?: Size;
}

export type Options = {
  /** Button size. */
  size?: Size;

  /** Button color. */
  color?: 'primary' | 'secondary';

  /** Button variant. */
  variant?: 'outlined' | 'contained' | 'text';

  /** Button disabled. */
  common?: CommonProps;
};
