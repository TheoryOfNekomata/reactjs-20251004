import { Header } from '~/components/Header';
import { TextInput } from '~/components/TextInput';
import { MultilineTextInput } from '~/components/MultilineTextInput';
import { type FormEventHandler, useEffect } from 'react';
import { Button } from '~/components/Button';
import { useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {service as pianoService} from '~/modules/piano';
import type { Piano } from '@piano-man/backend';
import { UploadArea } from '~/components/UploadArea';
import {hooks as authHooks} from '~/modules/auth';

export default function EditPianosIdPage() {
  const { session } = authHooks.useSession();
  const { id: idRaw } = useParams<{ id: string }>();
  const id = idRaw as string;
  const queryClient = useQueryClient();
  const { data: pianoData, isLoading: isLoadingPianoData } = useQuery({
    queryKey: ['getPianoById', id],
    queryFn: () => pianoService.getPianoById(id),
  });
  const navigate = useNavigate();
  const { mutate: doUpdatePiano } = useMutation<Piano, Error, Partial<Piano>>({
    mutationKey: ['updatePiano', id],
    mutationFn: (variables) => pianoService.updatePiano(id, variables),
    onSuccess: async (data) => {
      await Promise.allSettled([
        queryClient.refetchQueries({
          queryKey: ['queryPianos']
        }),
        queryClient.refetchQueries({
          queryKey: ['getPianoById', data.id],
        }),
      ]);
      await navigate(`/pianos/${data.id}`);
    }
  })

  const updatePiano: FormEventHandler<HTMLElementTagNameMap['form']> = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    doUpdatePiano({
      model: formData.get('model') as string,
      description: formData.get('description') as string
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
      <main>
        {!isLoadingPianoData && pianoData && (
          <div className="max-w-5xl px-4 mx-auto">
            <h1 className="text-3xl font-bold my-8">Edit Piano</h1>
            <form onSubmit={updatePiano}>
              <div className="flex flex-col justify-between gap-4">
                <fieldset className="contents">
                  <legend className="sr-only">
                    Details
                  </legend>
                  <div className="flex flex-col gap-4">
                    <div>
                      <TextInput defaultValue={pianoData.model} label="Model" name="model" required placeholder="Model" />
                    </div>
                    <div>
                      <MultilineTextInput defaultValue={pianoData.description} rows={5} label="Description" name="description" required placeholder="Description" />
                    </div>
                  </div>
                </fieldset>
                <fieldset className="contents">
                  <legend className="sr-only">
                    Images
                  </legend>
                  <div className="flex flex-col gap-4">
                    <div>
                      <UploadArea disabled placeholder="Upload images here" />
                    </div>
                    {pianoData.images.length > 0 && (
                      <div className="h-64 overflow-auto">
                        <div className="flex flex-wrap gap-4">
                          {pianoData.images.map((uploadFile, index) => (
                            <div key={uploadFile.id} className="h-24 w-24 relative rounded overflow-hidden border">
                              <input type="hidden" name="images.upload_id" value={uploadFile.id} />
                              <img src={`/api/uploads/${uploadFile.image_upload_id}/binary`} alt={`Uploaded File #${index + 1}`} className="w-full h-full object-cover object-center" />
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
        )}
      </main>
    </>
  );
}
