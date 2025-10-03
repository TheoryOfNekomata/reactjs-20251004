import type {FC, HTMLProps} from 'react';

export interface TextInputProps extends Omit<HTMLProps<HTMLElementTagNameMap['input']>, 'type'> {}

export const TextInput: FC<TextInputProps> = ({
	...etcProps
}) => {
	return (
		<input className="h-12 w-full px-4 border rounded overflow-hidden" {...etcProps} type="text" />
	);
};
