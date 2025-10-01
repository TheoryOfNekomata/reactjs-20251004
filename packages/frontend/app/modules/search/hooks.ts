import {useSearchParams} from 'react-router';

export const useSearch = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const processSearch = (form: HTMLElementTagNameMap['form']) => {
		const data = new FormData(form);
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set('q', data.get('q')?.toString() ?? '');
		newSearchParams.set('p', '1');
		setSearchParams(newSearchParams);
	};
	return { searchParams, processSearch };
};

export const usePagination = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const goToNextPage = (form: HTMLElementTagNameMap['form']) => {
		const data = new FormData(form);
		const currentPageStr = data.get('p')?.toString() ?? '1';
		const currentPage = Number(currentPageStr);
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set('p', (currentPage + 1).toString());
		setSearchParams(newSearchParams);
	};
	const goToPreviousPage = (form: HTMLElementTagNameMap['form']) => {
		const data = new FormData(form);
		const currentPageStr = data.get('p')?.toString() ?? '1';
		const currentPage = Number(currentPageStr);
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set('p', (currentPage - 1).toString());
		setSearchParams(newSearchParams);
	};
	return {goToNextPage, goToPreviousPage};
};
