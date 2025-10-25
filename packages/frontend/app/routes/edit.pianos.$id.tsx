import { Header } from '~/components/Header';
import { TextInput } from '~/components/TextInput';
import { MultilineTextInput } from '~/components/MultilineTextInput';
import { type FormEventHandler } from 'react';
import { Button } from '~/components/Button';
import { useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {service as pianoService} from '~/modules/piano';
import type { Piano } from '@piano-man/backend';

export default function EditPianosIdPage() {
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

  return (
    <>
      <Header />
      <main>
        {!isLoadingPianoData && pianoData && (
          <div className="max-w-5xl px-4 mx-auto">
            <div className="my-8">
              <form onSubmit={updatePiano}>
                <div className="flex flex-col justify-between gap-4 md:flex-row">
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
        )}
      </main>
    </>
  );
}
