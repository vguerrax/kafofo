import type { useConfirmation } from './use-confirmation';
export function PendingNotice({
  state,
  canWrite,
  onCheck,
}: {
  state: ReturnType<typeof useConfirmation>;
  canWrite: boolean;
  onCheck: () => Promise<void>;
}) {
  if (!state.pending) return null;
  return (
    <section aria-label="Operação sem confirmação">
      <p role="status">
        A gravação ficou sem confirmação. Seus dados foram preservados. Confirme a mesma operação
        antes de alterar o preenchimento.
      </p>
      {state.expired ? (
        <>
          <p>
            A janela de 24 horas terminou. Atualize e confira o resultado antes de iniciar outra
            operação.
          </p>
          <button disabled={state.busy} onClick={() => void state.checked(onCheck)}>
            Atualizar para conferir
          </button>
          {state.reviewed && (
            <button disabled={state.busy} onClick={() => state.release()}>
              Conferi o resultado; liberar nova operação
            </button>
          )}
        </>
      ) : (
        <button disabled={state.busy || !canWrite} onClick={() => void state.retry()}>
          Tentar confirmar novamente
        </button>
      )}
    </section>
  );
}
