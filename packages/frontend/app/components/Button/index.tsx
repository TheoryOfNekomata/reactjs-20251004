import type {FC, HTMLProps} from 'react';

const BUTTON_VARIANT_CLASS_NAMES = {
	primary: 'bg-black text-white dark:bg-white dark:text-black',
	secondary: '',
} as const;

export interface ButtonProps extends Omit<HTMLProps<HTMLElementTagNameMap['button']>, 'className' | 'style' | 'type'> {
	type?: 'button' | 'reset' | 'submit';
	variant?: keyof typeof BUTTON_VARIANT_CLASS_NAMES;
}

export const Button: FC<ButtonProps> = ({
	variant = 'secondary' as const,
	...etcProps
}) => {
	return (
		<button {...etcProps} className={`w-full uppercase font-bold rounded border h-12 px-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANT_CLASS_NAMES[variant]}`} />
	);
};
