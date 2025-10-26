import { Header } from '~/components/Header';
import { TextInput } from '~/components/TextInput';
import { MultilineTextInput } from '~/components/MultilineTextInput';
import { UploadArea, type UploadAreaProps } from '~/components/UploadArea';
import { type FormEventHandler, useEffect, useState } from 'react';
import type { Piano, PianoImage, Upload } from '@piano-man/backend';
import { Button } from '~/components/Button';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { service as pianoService } from '~/modules/piano';
import { hooks as authHooks } from '~/modules/auth';

export default function CreatePianosPage() {
  const { session } = authHooks.useSession();
  const [uploadedFiles, setUploadedFiles] = useState([] as Upload[]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate: doCreatePiano } = useMutation<Piano, Error, Partial<Piano> & { images: Pick<PianoImage, 'image_upload_id'>[] }>({
    mutationKey: ['createPiano'],
    mutationFn: (variables) => pianoService.createPiano(variables),
    onSuccess: async data => {
      await queryClient.invalidateQueries({
        queryKey: ['queryPianos']
      })
      await navigate(`/pianos/${data.id}`);
    },
  })

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
    doCreatePiano({
      model: formData.get('model') as string,
      description: formData.get('description') as string,
      images: uploadIds.map((u) => {
        return {
          image_upload_id: u as string,
        };
      })
    })
  };

  useEffect(() => {
    if (session === null) {
      navigate('/log-in');
      return;
    }
  }, [session]);

  if (!session) {
    return null;
  }

  return (
    <>
      <Header />
      <form id="uploadedFiles" onSubmit={doUploadedFileAction} />
      <main>
        <div className="max-w-xl px-4 mx-auto">
          <div className="my-8">
            <h1 className="text-3xl font-bold my-8">Create Piano</h1>
            <form onSubmit={createPiano}>
              <div className="flex flex-col justify-between gap-4">
                <fieldset className="contents">
                  <legend className="sr-only">
                    Details
                  </legend>
                  <div className="flex flex-col gap-4">
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
                    <div>
                      <UploadArea placeholder="Upload images here" onFileSelect={uploadFiles} />
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="h-64 overflow-auto">
                        <div className="flex flex-wrap gap-4">
                          {uploadedFiles.map((uploadFile, index) => (
                            <div key={uploadFile.id} className="h-24 w-24 relative rounded overflow-hidden border">
                              <input type="hidden" name="images.upload_id" value={uploadFile.id} />
                              <img src={`/api/uploads/${uploadFile.id}/binary`} alt={`Uploaded File #${index + 1}`} className="w-full h-full object-cover object-center" />
                              <div className="absolute top-0 right-0 p-2">
                                <button type="submit" name="delete" value={uploadFile.id} form="uploadedFiles" className="cursor-pointer h-8 w-8 rounded-full border bg-black/50 text-white">
                                  &times;
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </fieldset>
              </div>
              <div className="flex justify-end gap-4 my-8">
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
