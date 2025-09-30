import type {FC, HTMLProps} from 'react';

export interface SearchTextInputProps extends Omit<HTMLProps<HTMLElementTagNameMap['input']>, 'type'> {}

export const SearchTextInput: FC<SearchTextInputProps> = ({
	...etcProps
}) => {
	return (
		<input className="h-12 w-full px-4 border rounded overflow-hidden" {...etcProps} type="search" />
	);
};
