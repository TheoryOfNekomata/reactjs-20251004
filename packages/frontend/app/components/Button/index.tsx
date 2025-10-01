import type {FC, HTMLProps} from 'react';

export interface ButtonProps extends Omit<HTMLProps<HTMLElementTagNameMap['button']>, 'className' | 'style' | 'type'> {
	type?: 'button' | 'reset' | 'submit';
}

export const Button: FC<ButtonProps> = ({
	...etcProps
}) => {
	return (
		<button {...etcProps} className="w-full uppercase font-bold rounded border h-12 px-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" />
	);
};
