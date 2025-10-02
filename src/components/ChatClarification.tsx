import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import { AmbiguousTerm, Clarification } from '@/lib/ambiguousTerms';

interface Message {
  type: 'system' | 'user';
  content: string;
  options?: string[];
}

interface ChatClarificationProps {
  ambiguousTerms: AmbiguousTerm[];
  onClarificationsComplete: (clarifications: Clarification[]) => void;
  onCancel: () => void;
}

const ChatClarification = ({ 
  ambiguousTerms, 
  onClarificationsComplete,
  onCancel 
}: ChatClarificationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [clarifications, setClarifications] = useState<Clarification[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'system',
      content: `I detected ${ambiguousTerms.length} terms that need clarification. Let me ask you some questions to get more specific details.`
    },
    {
      type: 'system',
      content: ambiguousTerms[0]?.question || '',
      options: ambiguousTerms[0]?.options || []
    }
  ]);
  const [customAnswer, setCustomAnswer] = useState('');

  const handleOptionSelect = (option: string) => {
    recordAnswer(option);
  };

  const handleCustomAnswer = () => {
    if (customAnswer.trim()) {
      recordAnswer(customAnswer);
      setCustomAnswer('');
    }
  };

  const recordAnswer = (answer: string) => {
    const currentTerm = ambiguousTerms[currentIndex];
    
    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: answer
    }]);

    // Record clarification
    const newClarification: Clarification = {
      term: currentTerm.term,
      question: currentTerm.question,
      answer: answer,
      timestamp: new Date()
    };

    const updatedClarifications = [...clarifications, newClarification];
    setClarifications(updatedClarifications);

    // Move to next question or complete
    if (currentIndex < ambiguousTerms.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      setMessages(prev => [...prev, {
        type: 'system',
        content: ambiguousTerms[nextIndex].question,
        options: ambiguousTerms[nextIndex].options
      }]);
    } else {
      // All questions answered
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'Thank you! I have all the clarifications I need. Generating refined sketch...'
      }]);
      
      setTimeout(() => {
        onClarificationsComplete(updatedClarifications);
      }, 1000);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Description Clarification
        </CardTitle>
        <CardDescription>
          Question {currentIndex + 1} of {ambiguousTerms.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.options && message.options.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.options.map((option, optIndex) => (
                        <Button
                          key={optIndex}
                          variant="outline"
                          size="sm"
                          onClick={() => handleOptionSelect(option)}
                          className="text-xs"
                          disabled={index !== messages.length - 1}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {currentIndex < ambiguousTerms.length && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Or type your own answer:
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom description..."
                value={customAnswer}
                onChange={(e) => setCustomAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomAnswer()}
              />
              <Button onClick={handleCustomAnswer} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChatClarification;
