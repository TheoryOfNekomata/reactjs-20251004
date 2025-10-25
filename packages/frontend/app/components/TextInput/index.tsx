import type {FC, HTMLProps} from 'react';

export interface TextInputProps extends Omit<HTMLProps<HTMLElementTagNameMap['input']>, 'type'> {}

export const TextInput: FC<TextInputProps> = ({
  className = '',
	...etcProps
}) => {
	return (
		<input {...etcProps} className={`h-12 w-full px-4 border rounded overflow-hidden ${className}`.trim()} type="text" />
	);
};
