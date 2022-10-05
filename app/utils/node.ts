export class ConversationNode {
  constructor({ sender, message, bot_name }) {
    this.sender = sender
    this.message = message
    this.bot_name = bot_name
  }
  public addChild(node: Node) {
    this.child = node
  }
}
export type Node = {
  sender: string
  message: string
  bot_name: string
  child?: Node
}
