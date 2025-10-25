import { Header } from '~/components/Header';
import { TextInput } from '~/components/TextInput';
import { MultilineTextInput } from '~/components/MultilineTextInput';
import { UploadArea, type UploadAreaProps } from '~/components/UploadArea';
import { type FormEventHandler, useState } from 'react';
import type { Upload } from '@piano-man/backend';
import { Button } from '~/components/Button';
import { useNavigate } from 'react-router';

export default function CreatePianosPage() {
  const [uploadedFiles, setUploadedFiles] = useState([] as Upload[]);
  const navigate = useNavigate();

  const uploadFiles: UploadAreaProps['onFileSelect'] = async (files) => {
    await Promise.allSettled(files.map(async file => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });
      const upload = await response.json() as Upload;
      setUploadedFiles((oldUploadedFiles) => [
        ...oldUploadedFiles,
        upload,
      ]);
    }))
  };

  const doUploadedFileAction: FormEventHandler<HTMLElementTagNameMap['form']> = async (e) => {
    e.preventDefault();
    const { submitter } = e.nativeEvent as unknown as { submitter: HTMLElementTagNameMap['button'] };

    switch (submitter.name) {
      case 'delete': {
        const id = submitter.value;
        const response = await fetch(`/api/uploads/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setUploadedFiles((oldUploadedFiles) => oldUploadedFiles.filter((file) => file.id !== id));
        }

        return;
      }
      default:
        break;
    }
  };

  const createPiano: FormEventHandler<HTMLElementTagNameMap['form']> = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const uploadIds = formData.getAll('images.upload_id');
    const response = await fetch('/api/pianos', {
      method: 'POST',
      body: JSON.stringify({
        model: formData.get('model'),
        description: formData.get('description'),
        images: uploadIds.map((u) => {
          return {
            upload_id: u,
          };
        })
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json();
    if (response.ok) {
      navigate(`/pianos/${data.id}`);
    }
  };

  return (
    <>
      <Header />
      <form id="uploadedFiles" onSubmit={doUploadedFileAction} />
      <main>
        <div className="max-w-5xl px-4 mx-auto">
          <div className="my-8">
            <form onSubmit={createPiano}>
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <fieldset className="contents">
                  <legend className="sr-only">
                    Details
                  </legend>
                  <div className="flex flex-col gap-4 shrink-0">
                    <div>
                      <TextInput label="Model" name="model" required placeholder="Model" />
                    </div>
                    <div>
                      <MultilineTextInput rows={5} label="Description" name="description" required placeholder="Description" />
                    </div>
                  </div>
                </fieldset>
                <fieldset className="contents">
                  <legend className="sr-only">
                    Images
                  </legend>
                  <div className="flex flex-col gap-4">
                    <UploadArea placeholder="Upload images here" onFileSelect={uploadFiles} />
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {uploadedFiles.map((uploadFile, index) => (
                        <div>
                          <input type="hidden" name="images.upload_id" value={uploadFile.id} />
                          <img src={`/api/uploads/${uploadFile.id}/binary`} alt={`Uploaded File #${index + 1}`} />
                          <button type="submit" name="delete" value={uploadFile.id} form="uploadedFiles">
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </fieldset>
              </div>
              <div className="flex justify-end gap-4">
                <div>
                  <Button type="submit" variant="primary">
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
