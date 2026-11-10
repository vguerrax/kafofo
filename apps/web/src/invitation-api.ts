import { Type } from 'typebox';
import {
  InvitationInfoSchema,
  InvitationIssuedSchema,
  InvitationPreviewSchema,
  InvitationAcceptedSchema,
  type InvitationInfo,
  type InvitationIssued,
  type InvitationAccepted,
} from '@kafofo/contracts';
import { platformJson, platformRequest } from './context-api';
export const invitationApi = {
  list: (core: string) =>
    platformJson<InvitationInfo[]>(
      '/cores/' + core + '/invitations',
      Type.Array(InvitationInfoSchema),
    ),
  issue: (core: string) =>
    platformJson<InvitationIssued>(
      '/cores/' + core + '/invitations',
      InvitationIssuedSchema,
      'POST',
      {},
    ),
  revoke: (core: string, id: string) =>
    platformRequest('/cores/' + core + '/invitations/' + id, 'DELETE'),
  preview: (token: string) =>
    platformJson<{ name: string }>('/invitations/preview', InvitationPreviewSchema, 'POST', {
      token,
    }),
  accept: (token: string) =>
    platformJson<InvitationAccepted>('/invitations/accept', InvitationAcceptedSchema, 'POST', {
      token,
    }),
  register: (token: string, username: string, password: string) =>
    platformJson<InvitationAccepted>('/invitations/register', InvitationAcceptedSchema, 'POST', {
      token,
      username,
      password,
    }),
};
// Segredo transitório: não é persistido em storage, histórico ou parâmetros de redirecionamento.
export const invitationEntry = {
  token: '',
  opened: window.history.state?.invitationPending === true,
  coreId:
    typeof window.history.state?.invitationCoreId === 'string'
      ? window.history.state.invitationCoreId
      : '',
};
export function captureInvitation() {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  if (!fragment.has('invite')) return false;
  invitationEntry.token = fragment.get('invite') ?? '';
  invitationEntry.opened = true;
  window.history.replaceState(
    { invitationPending: true },
    '',
    window.location.pathname + window.location.search,
  );
  return true;
}
captureInvitation();
