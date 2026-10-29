import { appConfig } from '@/config';
import type { AppPorts } from '@/adapters/types';
import { mockAuthAdapter } from '@/adapters/mock/mockAuthAdapter';
import { mockUserAdapter } from '@/adapters/mock/mockUserAdapter';
import { mockConversationAdapter } from '@/adapters/mock/mockConversationAdapter';
import { mockMessageAdapter } from '@/adapters/mock/mockMessageAdapter';
import { mockFileAdapter } from '@/adapters/mock/mockFileAdapter';
import { mockPromptAdapter } from '@/adapters/mock/mockPromptAdapter';
import { apiAuthAdapter } from '@/adapters/api/apiAuthAdapter';
import { apiUserAdapter } from '@/adapters/api/apiUserAdapter';
import { apiConversationAdapter } from '@/adapters/api/apiConversationAdapter';
import { apiMessageAdapter } from '@/adapters/api/apiMessageAdapter';
import { apiFileAdapter } from '@/adapters/api/apiFileAdapter';
import { apiPromptAdapter } from '@/adapters/api/apiPromptAdapter';

const mockPorts: AppPorts = {
  auth: mockAuthAdapter,
  user: mockUserAdapter,
  conversations: mockConversationAdapter,
  messages: mockMessageAdapter,
  files: mockFileAdapter,
  prompts: mockPromptAdapter,
};

const apiPorts: AppPorts = {
  auth: apiAuthAdapter,
  user: apiUserAdapter,
  conversations: apiConversationAdapter,
  messages: apiMessageAdapter,
  files: apiFileAdapter,
  prompts: apiPromptAdapter,
};

export function getPorts(): AppPorts {
  return appConfig.useMock ? mockPorts : apiPorts;
}
