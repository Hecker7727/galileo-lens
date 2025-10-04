import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { User, Bot, Wand2 } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types/dataTypes';
import AnswerRichView from './AnswerRichView';

// Markdown formatting function
const formatMarkdown = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-foreground mt-4 mb-2">$1</h3>') // H3
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-foreground mt-4 mb-3">$1</h2>') // H2
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-semibold text-foreground mt-4 mb-3">$1</h1>') // H1
    .replace(/^\s*\*\s+(.*)$/gm, '<li class="ml-4 mb-1">$1</li>') // List items
    .replace(/^\s*(\d+)\.\s+(.*)$/gm, '<li class="ml-4 mb-1">$2</li>') // Numbered list items
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>') // Inline code
    .replace(/\n\n/g, '</p><p class="mb-3">') // Paragraphs
    .replace(/\n/g, '<br>'); // Line breaks
};

interface ChatMessageProps {
  message: ChatMessageType;
  onSuggestionClick?: (suggestion: string) => void;
}

export default function ChatMessage({ message, onSuggestionClick }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Handle system messages (spell corrections) differently
  if (isSystem) {
    return (
      <div className="flex gap-3 justify-center my-1">
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-1">
          <Wand2 className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          <span className="text-xs text-amber-700 dark:text-amber-300 italic">
            {message.text}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className={isUser ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 max-w-[80%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`space-y-2 ${isUser ? 'text-right' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {isUser ? 'You' : 'Research Assistant'}
            </span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>

          <div className={`rounded-lg p-4 ${
            isUser 
              ? 'bg-primary text-primary-foreground ml-8' 
              : 'bg-card border mr-8 shadow-sm'
          }`}>
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            ) : (
              <div 
                className="text-sm space-y-2 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: `<p class="mb-3">${formatMarkdown(message.text)}</p>` 
                }}
              />
            )}
          </div>

          {/* Rich content for AI responses */}
          {!isUser && message.richContent && (
            <div className="mr-8">
              <AnswerRichView 
                content={message.richContent} 
                onSuggestionClick={onSuggestionClick}
              />
            </div>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`space-y-2 ${isUser ? 'mr-8' : 'ml-8'}`}>
              {message.attachments.map((attachment: any, index: number) => (
                <Card key={index} className="w-fit">
                  <CardContent className="p-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{String(attachment.type || 'file')}</Badge>
                      <span>{String(attachment.name || 'Attachment')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}