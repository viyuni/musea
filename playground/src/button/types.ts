import type { Options, Size } from './enum';

export interface ButtonProps {
  /**
   * The button's size.
   */
  size?: Size;

  /**
   * The button's color.
   */
  color?: 'primary' | 'secondary';

  /**
   * The button's variant.
   */
  variant?: 'outlined' | 'contained' | 'text';

  /**
   * The button's disabled state.
   */
  disabled?: boolean;

  /**
   * The button's loading state.
   */
  loading?: boolean;

  /**
   * The button's icon.
   */
  icon?: string | null;

  /**
   * The button's label.
   */
  label?: string;

  /**
   * The button's href.
   */
  href?: string;

  /**
   * The button's target.
   */
  target?: string;

  /**
   * The button's rel.
   */
  rel?: string;

  /**
   * The button's type.
   */
  type?: string;

  count?: number;

  /** Options */
  options?: Options;

  /**
   * The button's array.
   */
  array?: number[];

  /**
   * The button's array.
   */
  array2?: Array<Options>;

  name?: number;
}

export interface ButtonEmits {
  update: [value: number, okk: string];
  click: [value: number];
}
