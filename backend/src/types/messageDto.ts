import type { ChatMessageDto, ConversationUiPhaseDto, PromptArtifactDto } from './conversationDto.js';

export interface SendMessageResponseDto {
  userMessage: ChatMessageDto;
  assistantMessage?: ChatMessageDto;
  conversationPhase?: ConversationUiPhaseDto;
  prompt?: PromptArtifactDto;
}
