import type { Route } from './+types/edit.pianos.$id';
import { Header } from '~/components/Header';
import { TextInput } from '~/components/TextInput';
import { MultilineTextInput } from '~/components/MultilineTextInput';
import { type FormEventHandler } from 'react';
import { Button } from '~/components/Button';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {service as pianoService} from '~/modules/piano';


export default function EditPianosIdPage({ params }: Route.ComponentProps) {
  const { data: pianoData, isLoading: isLoadingPianoData } = useQuery({
    queryKey: ['getPianoById', params.id],
    queryFn: () => pianoService.getPianoById(params.id),
  });
  const navigate = useNavigate();

  const updatePiano: FormEventHandler<HTMLElementTagNameMap['form']> = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await fetch(`/api/pianos/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        model: formData.get('model'),
        description: formData.get('description')
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
