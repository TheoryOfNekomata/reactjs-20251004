import type {FC, HTMLProps} from 'react';

export interface MaskedTextInputProps extends Omit<HTMLProps<HTMLElementTagNameMap['input']>, 'type'> {}

export const MaskedTextInput: FC<MaskedTextInputProps> = ({
	...etcProps
}) => {
	return (
		<input className="h-12 w-full px-4 border rounded overflow-hidden" {...etcProps} type="password" />
	);
};
