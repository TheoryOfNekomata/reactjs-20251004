import type {FC, HTMLProps} from 'react';

export interface MultilineTextInputProps extends Omit<HTMLProps<HTMLElementTagNameMap['textarea']>, 'type'> {}

export const MultilineTextInput: FC<MultilineTextInputProps> = ({
  className = '',
  style = {},
  rows = 1,
	...etcProps
}) => {
	return (
		<textarea {...etcProps} style={{ ...style, height: 48 + ((rows - 1) * 24) }} className={`min-h-12 w-full px-4 py-3 border rounded overflow-hidden resize-y ${className}`.trim()} />
	);
};
