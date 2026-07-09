import { beforeEach, describe, expect, it, vi } from 'vitest'
import { gptRobotApi } from '../gptRobotApi'
import { httpClient } from '../httpClient'

describe('gptRobotApi routing', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('routes conversation and message endpoints including versioned deletes', async () => {
    const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: {} } as never)
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: {} } as never)
    const putSpy = vi.spyOn(httpClient, 'put').mockResolvedValue({ data: {} } as never)
    const deleteSpy = vi.spyOn(httpClient, 'delete').mockResolvedValue({ data: {} } as never)

    await gptRobotApi.listConversations()
    await gptRobotApi.createConversation({})
    await gptRobotApi.getConversation(10)
    await gptRobotApi.updateConversation(10, {})
    await gptRobotApi.deleteConversation(10, 2)
    await gptRobotApi.getConversationPrompt(10)
    await gptRobotApi.updateConversationPrompt(10, {})
    await gptRobotApi.listMessages(10, { page: 1, size: 20 })
    await gptRobotApi.createMessage(10, {})
    await gptRobotApi.countMessages(10)
    await gptRobotApi.getMessage(10, 5)
    await gptRobotApi.updateMessage(10, 5, {})
    await gptRobotApi.deleteMessage(10, 5, 3)

    expect(getSpy).toHaveBeenNthCalledWith(1, '/bot/gpt-robot/conversations')
    expect(postSpy).toHaveBeenNthCalledWith(1, '/bot/gpt-robot/conversations', {})
    expect(getSpy).toHaveBeenNthCalledWith(2, '/bot/gpt-robot/conversations/10')
    expect(putSpy).toHaveBeenNthCalledWith(1, '/bot/gpt-robot/conversations/10', {})
    expect(deleteSpy).toHaveBeenNthCalledWith(1, '/bot/gpt-robot/conversations/10', {
      params: { version: 2 },
    })
    expect(getSpy).toHaveBeenNthCalledWith(3, '/bot/gpt-robot/conversations/10/prompt')
    expect(putSpy).toHaveBeenNthCalledWith(2, '/bot/gpt-robot/conversations/10/prompt', {})
    expect(getSpy).toHaveBeenNthCalledWith(4, '/bot/gpt-robot/conversations/10/messages', {
      params: { page: 1, size: 20 },
    })
    expect(postSpy).toHaveBeenNthCalledWith(2, '/bot/gpt-robot/conversations/10/messages', {})
    expect(getSpy).toHaveBeenNthCalledWith(5, '/bot/gpt-robot/conversations/10/messages/count')
    expect(getSpy).toHaveBeenNthCalledWith(6, '/bot/gpt-robot/conversations/10/messages/5')
    expect(putSpy).toHaveBeenNthCalledWith(3, '/bot/gpt-robot/conversations/10/messages/5', {})
    expect(deleteSpy).toHaveBeenNthCalledWith(2, '/bot/gpt-robot/conversations/10/messages/5', {
      params: { version: 3 },
    })
  })

  it('routes user chat and options endpoints', async () => {
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: {} } as never)
    const optionsSpy = vi.spyOn(httpClient, 'options').mockResolvedValue({ data: {} } as never)

    await gptRobotApi.sendUserChat({ text: 'salut' })
    await gptRobotApi.optionsGptRobot()

    expect(postSpy).toHaveBeenCalledWith('/bot/gpt-robot/user-chat', { text: 'salut' })
    expect(optionsSpy).toHaveBeenCalledWith('/bot/gpt-robot')
  })
})
