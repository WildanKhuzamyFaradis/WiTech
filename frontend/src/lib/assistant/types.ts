import type { Division, Project, Event, FAQ, Member } from "../types"

export type AssistantResponseType = "direct" | "out_of_scope" | "needs_ai" | "not_found"

export interface AssistantAction {
  label: string

  payload: string
}

export interface AssistantResponse {
  type: AssistantResponseType

  text: string

  items?: {
    divisions?: Division[]

    projects?: Project[]

    events?: Event[]

    members?: Member[]

    faqs?: FAQ[]
  }

  actions?: AssistantAction[]
}

export interface ChatMessage {
  id: string

  role: "user" | "assistant"

  content: string

  timestamp: string

  responseMeta?: AssistantResponse
}
