import type { ChangeEventHandler, FC, HTMLProps } from 'react';

export interface UploadAreaProps extends Omit<HTMLProps<HTMLElementTagNameMap['input']>, 'type'> {
  onFileSelect?(files: File[]): void;
}

export const UploadArea: FC<UploadAreaProps> = ({
  className = '',
  style,
  placeholder = '',
  onChange,
  onFileSelect,
  ...etcProps
}) => {
  const handleChange: ChangeEventHandler<HTMLElementTagNameMap['input']> = (e) => {
    e.preventDefault();
    const { files: filesRaw } = e.currentTarget;
    if (filesRaw === null) {
      return;
    }
    const files = Array.from(filesRaw);
    onFileSelect?.(files);
    e.currentTarget.value = '';
  };

  return (
    <label className={`cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-50 inline-block align-top rounded border overflow-hidden w-full min-h-32 min-w-32 relative ${className}`.trim()} style={style}>
      <input {...etcProps} onChange={(e) => {
        handleChange(e);
        onChange?.(e);
      }} type="file" className="sr-only" />
      <span className="flex absolute top-0 left-0 w-full h-full items-center justify-center p-4 text-center">
        {placeholder}
      </span>
    </label>
  );
};
