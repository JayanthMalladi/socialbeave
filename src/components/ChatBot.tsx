import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { runFlow } from '../services/langflowService';
import { 
  Heart, Share, MessageSquare, Eye,
  Bot, User, Sparkles, Send, X 
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type ParsedInsights = {
  metrics: string[];
  formatInsights: string[];
  directAnswer: string[];
  explanation: string;
  suggestions: string[];
};

const parseResponse = (response: string): ParsedInsights => {
  const sections = response.split('\n\n');
  
  const parsed: ParsedInsights = {
    metrics: [],
    formatInsights: [],
    directAnswer: [],
    explanation: '',
    suggestions: []
  };

  sections.forEach(section => {
    if (section.startsWith('Metrics:')) {
      parsed.metrics = section.replace('Metrics:', '')
        .split('.')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    else if (section.startsWith('Format Insights:')) {
      parsed.formatInsights = section.replace('Format Insights:', '')
        .split('.')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    else if (section.startsWith('Direct Answer:')) {
      parsed.directAnswer = section.split('\n')
        .filter(line => line.includes('-'))
        .map(line => line.trim());
    }
    else if (section.startsWith('Explanation:')) {
      parsed.explanation = section.replace('Explanation:', '').trim();
    }
    else if (section.startsWith('Suggestion:')) {
      parsed.suggestions = section.split('\n')
        .filter(line => line.includes('-'))
        .map(line => line.trim());
    }
  });

  return parsed;
};

const MetricsCard = ({ 
  label, 
  value, 
  icon, 
  trend 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
  trend?: string;
}) => (
  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
    <div className="flex-shrink-0 p-2 rounded-full bg-blue-50">
      {icon}
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-lg font-semibold text-gray-900">{value}</p>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);

const InsightSection = ({ title, items, icon, color }: { 
  title: string; 
  items: string[]; 
  icon: React.ReactNode;
  color: string;
}) => (
  <div className={`mb-4 p-4 rounded-lg bg-white shadow-sm border-l-4 ${color} hover:shadow-md transition-shadow duration-200`}>
    <div className="flex items-center gap-2 mb-3">
      <div className={`p-2 rounded-full ${color.replace('border', 'bg')}/10`}>
        {icon}
      </div>
      <h4 className="font-semibold text-gray-800">{title}</h4>
    </div>
    <ul className="space-y-2 pl-4">
      {items.map((item, index) => (
        <li key={index} className="text-gray-600 text-sm flex items-start gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const extractMetrics = (text: string) => {
  const metrics: Record<string, string> = {};
  const metricsRegex = {
    likes: /Expected Likes:\s*Around ([\d,]+)/i,
    views: /Expected Views:\s*Approximately ([\d,]+)/i,
    shares: /Expected Shares:\s*Around ([\d,]+)/i,
    comments: /Expected Comments:\s*Around ([\d,]+)/i,
    engagement: /engagement rate.*?(\d+%)/i,
  };

  Object.entries(metricsRegex).forEach(([key, regex]) => {
    const match = text.match(regex);
    if (match) {
      metrics[key] = match[1];
    }
  });

  return metrics;
};

const renderInsights = (message: Message) => {
  if (message.role === 'user') {
    return (
      <div className="inline-block p-3 rounded-lg bg-blue-500 text-white max-w-[80%]">
        {message.content}
      </div>
    );
  }

  try {
    const insights = parseResponse(message.content);

    return (
      <div className="space-y-6 max-w-full bg-gray-50 rounded-lg p-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricsCard 
            label="Expected Views" 
            value={insights.metrics.views}
            icon={<Eye className="w-5 h-5 text-blue-500" />}
          />
          <MetricsCard 
            label="Expected Likes" 
            value={insights.metrics.likes}
            icon={<Heart className="w-5 h-5 text-red-500" />}
          />
          <MetricsCard 
            label="Expected Comments" 
            value={insights.metrics.comments}
            icon={<MessageSquare className="w-5 h-5 text-green-500" />}
          />
          <MetricsCard 
            label="Expected Shares" 
            value={insights.metrics.shares}
            icon={<Share className="w-5 h-5 text-purple-500" />}
          />
        </div>

        {/* Format Performance */}
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-full bg-blue-50">
              <BarChart2 className="w-5 h-5 text-blue-500" />
            </div>
            <h4 className="font-semibold text-gray-800">Format Performance</h4>
          </div>
          <div className="space-y-2">
            {insights.formatPerformance.engagementComparison && (
              <div className="text-sm text-gray-600 flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                <span>Engagement Comparison: {insights.formatPerformance.engagementComparison}</span>
              </div>
            )}
            {insights.formatPerformance.commentRate && (
              <div className="text-sm text-gray-600 flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                <span>Comment Rate: {insights.formatPerformance.commentRate}</span>
              </div>
            )}
            {insights.formatPerformance.additionalInsights && (
              <div className="text-sm text-gray-600 flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                <span>Additional Insights: {insights.formatPerformance.additionalInsights}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Timing */}
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-full bg-green-50">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <h4 className="font-semibold text-gray-800">Best Posting Times</h4>
            </div>
            <div className="space-y-2">
              {insights.recommendations.timing.bestTime && (
                <div className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mt-2" />
                  <span>Best Time: {insights.recommendations.timing.bestTime}</span>
                </div>
              )}
              {insights.recommendations.timing.bestDay && (
                <div className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mt-2" />
                  <span>Best Day: {insights.recommendations.timing.bestDay}</span>
                </div>
              )}
              {insights.recommendations.timing.reasoning && (
                <div className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mt-2" />
                  <span>Reasoning: {insights.recommendations.timing.reasoning}</span>
                </div>
              )}
            </div>
          </div>

          {/* Audience */}
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-full bg-purple-50">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <h4 className="font-semibold text-gray-800">Target Audience</h4>
            </div>
            <div className="text-sm text-gray-600">
              {insights.metrics.demographics}
            </div>
          </div>
        </div>

        {/* Hashtags */}
        {insights.recommendations.hashtags.primary.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-full bg-yellow-50">
                <Hash className="w-5 h-5 text-yellow-500" />
              </div>
              <h4 className="font-semibold text-gray-800">Primary Hashtags</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {insights.recommendations.hashtags.primary.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Secondary Hashtags */}
        {insights.recommendations.hashtags.secondary.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-pink-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-full bg-pink-50">
                <Hash className="w-5 h-5 text-pink-500" />
              </div>
              <h4 className="font-semibold text-gray-800">Secondary Hashtags</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {insights.recommendations.hashtags.secondary.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content Strategy */}
        {insights.recommendations.content.keyFocus && (
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-full bg-indigo-50">
                <Lightbulb className="w-5 h-5 text-indigo-500" />
              </div>
              <h4 className="font-semibold text-gray-800">Content Strategy</h4>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Key Focus:</strong> {insights.recommendations.content.keyFocus}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Quality Tips:</strong> {insights.recommendations.content.qualityTips}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error parsing insights:', error);
    return (
      <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
        {message.content}
      </div>
    );
  }
};

const InsightsDisplay = ({ insights }: { insights: ParsedInsights }) => {
  return (
    <div className="space-y-6 p-4 bg-white rounded-xl shadow-sm">
      {/* Performance Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.directAnswer.map((metric, idx) => {
          const [label, value] = metric.split(':').map(s => s.trim());
          const icons = {
            'Expected Likes': '👍',
            'Expected Views': '👀',
            'Expected Comments': '💬',
            'Expected Shares': '🔄'
          };
          return (
            <div key={idx} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{icons[label as keyof typeof icons] || '📊'}</span>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Predicted
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-600">{label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          );
        })}
      </div>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metrics Analysis */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-blue-100 rounded-lg">📊</span>
            <h3 className="font-semibold text-blue-900">Metrics Analysis</h3>
          </div>
          <div className="space-y-3">
            {insights.metrics.map((metric, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-blue-900">{metric}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Format Performance */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-purple-100 rounded-lg">🎯</span>
            <h3 className="font-semibold text-purple-900">Format Performance</h3>
          </div>
          <div className="space-y-3">
            {insights.formatInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-purple-900">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why It Works */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-amber-100 rounded-lg">💡</span>
            <h3 className="font-semibold text-amber-900">Why It Works</h3>
          </div>
          <div className="bg-white/80 p-4 rounded-lg">
            <p className="text-sm text-amber-900 leading-relaxed">{insights.explanation}</p>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-green-100 rounded-lg">✨</span>
            <h3 className="font-semibold text-green-900">Strategic Recommendations</h3>
          </div>
          <div className="space-y-3">
            {insights.suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-green-900">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-2 bg-gray-100 rounded-lg">📋</span>
          <h3 className="font-semibold text-gray-900">Next Steps</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.suggestions.slice(0, 3).map((suggestion, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-gray-900">Action Item</span>
              </div>
              <p className="text-sm text-gray-600">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type PromptTemplate = {
  title: string;
  description: string;
  example: string;
};

const promptTemplates: PromptTemplate[] = [
  {
    title: "Analyze Content Performance",
    description: "Get insights about specific content type performance",
    example: "How do reels about tech topics perform?"
  },
  {
    title: "Compare Formats",
    description: "Compare different content formats",
    example: "Which performs better: carousels or single images?"
  },
  {
    title: "Audience Insights",
    description: "Understand your audience demographics",
    example: "What age group engages most with fashion content?"
  }
];

const WelcomeScreen = ({ onTemplateClick }: { onTemplateClick: (example: string) => void }) => (
  <div className="text-center py-8 space-y-6">
    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-blue-100 
                    rounded-full flex items-center justify-center">
      <Bot className="w-10 h-10 text-green-600" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-gray-800">
        Welcome to AI Insights Assistant
      </h3>
      <p className="text-sm text-gray-600 max-w-md mx-auto">
        Get detailed analytics and recommendations for your social media content
      </p>
    </div>
    
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-700">Try these examples:</p>
      <div className="grid gap-3 max-w-lg mx-auto">
        {promptTemplates.map((template, idx) => (
          <button
            key={idx}
            onClick={() => onTemplateClick(template.example)}
            className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-green-500 
                     hover:shadow-lg transition-all duration-300 text-left space-y-2"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-500" />
              <span className="font-medium text-gray-900">{template.title}</span>
            </div>
            <p className="text-sm text-gray-600">{template.description}</p>
            <p className="text-xs text-green-600 group-hover:text-green-700">
              "{template.example}"
            </p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const renderMessage = (message: Message) => {
  if (message.role === 'assistant') {
    try {
      const parsedInsights = parseResponse(message.content);
      return (
        <div className="flex flex-col space-y-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">AI Assistant</span>
              <p className="text-xs text-gray-500">Analytics Expert</p>
            </div>
          </div>
          <div className="ml-13">
            <InsightsDisplay insights={parsedInsights} />
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">🤖</span>
          </div>
          <div className="flex-1 bg-white p-4 rounded-xl shadow-sm">
            <span className="font-medium text-gray-900 block mb-1">AI Assistant</span>
            <p className="text-gray-700">{message.content}</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl shadow-sm max-w-[80%]">
        <p className="text-white">{message.content}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
        <span className="text-blue-600 text-lg">👤</span>
      </div>
    </div>
  );
};

export function ChatBot({ isOpen = true, onClose }: ChatBotProps): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMessages([]);
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('ChatBot mounted');
    return () => console.log('ChatBot unmounted');
  }, []);

  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  const sendMessage = async (message: string) => {
    console.log('Sending message:', message);
    setIsLoading(true);
    
    const newMessages = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);
    
    try {
      const data = await runFlow(message);
      
      if (!data || !data.response) {
        throw new Error('Invalid response from API');
      }

      setMessages([...newMessages, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: "I'm having trouble connecting to the server. Please check your API configuration or try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
            style={{ 
              background: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              '-webkit-backdrop-filter': 'blur(12px)' // for Safari support
            }}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                     w-[95vw] h-[90vh] md:w-[800px] md:h-[735px] z-50 
                     flex flex-col bg-white/80 backdrop-blur-xl
                     rounded-2xl shadow-2xl overflow-hidden border border-white/20"
            style={{
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              '-webkit-backdrop-filter': 'blur(12px)'
            }}
          >
            {/* Header */}
            <div className="p-3 border-b bg-white/80 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-blue-500 
                               flex items-center justify-center shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">AI Assistant</h3>
                    <p className="text-xs text-gray-500">Analytics Expert</p>
                  </div>
                </div>
                {onClose && (
                  <button 
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <WelcomeScreen onTemplateClick={(example) => setInput(example)} />
                ) : (
                  messages.map((message, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={index}
                    >
                      {renderMessage(message)}
                    </motion.div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-center py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 border-t bg-white/80 backdrop-blur-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (input.trim()) {
                    sendMessage(input);
                    setInput('');
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-200 rounded-xl bg-white/50 
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                           placeholder:text-gray-400 text-gray-700 text-sm"
                  placeholder="Ask about your social media performance..."
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2.5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl
                           hover:from-green-600 hover:to-blue-600 disabled:opacity-50 
                           disabled:cursor-not-allowed transition-all duration-200 
                           shadow-lg hover:shadow-xl disabled:hover:shadow-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 