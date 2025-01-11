const BASE_API_URL = "https://api.langflow.astra.datastax.com";
const LANGFLOW_ID = "396deb1c-aadd-4f18-bd9e-a350c13098df";
const FLOW_ID = "bca2b923-d854-4755-86a8-0b51c350c42b";

interface LangflowRequest {
  input_value: string;
  output_type: string;
  input_type: string;
  tweaks?: Record<string, unknown>;
}

const PROMPT_TEMPLATE = `
{context}  

---  

The user wants to post the following content:  
- Content Type: {content_type}  
- Post Theme: {post_theme}  
- Day of Posting: {post_day}  
- Time of Posting: {post_time}  

Based on the above inputs, analyze the dataset and provide insights on potential engagement.  

METRICS:
- Engagement Rate: {percentage}%
- Average Likes: {number}
- Average Shares: {number}
- Average Comments: {number}
- Average Views: {number}
- Primary Demographics: {age_range}, {gender_distribution}

FORMAT PERFORMANCE:
- Engagement Comparison: {format} posts have {percentage}% higher engagement than {comparison_format}
- Comment Rate: {format} drives {multiplier}x more comments than other formats
- Additional Insights: {any_other_format_specific_insights}

PREDICTED PERFORMANCE:
- Expected Likes: Around {number}
- Expected Shares: Around {number}
- Expected Comments: Around {number}
- Expected Views: Around {number}

ANALYSIS:
- Performance Factors: {explain_key_factors}
- Timing Impact: {explain_timing_impact}
- Audience Behavior: {explain_audience_behavior}

RECOMMENDATIONS:
1. Optimal Timing:
   - Best Time: {specific_time}
   - Best Day: {specific_day}
   - Reasoning: {timing_explanation}

2. Hashtag Strategy:
   - Primary Tags: {list_of_primary_hashtags}
   - Secondary Tags: {list_of_secondary_hashtags}

3. Content Optimization:
   - Key Focus: {main_content_recommendation}
   - Quality Tips: {specific_quality_tips}

4. Audience Targeting:
   - Primary Audience: {primary_demographic}
   - Secondary Audience: {secondary_demographic}
   - Targeting Tips: {specific_targeting_advice}

Question: {question}
`;

interface ParsedInsights {
  metrics: {
    likes: string;
    shares: string;
    comments: string;
    views: string;
    demographics: string;
    engagementRate: string;
  };
  formatPerformance: {
    reelEngagement: string;
    commentRate: string;
    additionalInsights: string[];
  };
  recommendations: {
    timing: {
      time: string;
      day: string;
      reason: string;
    };
    hashtags: string[];
    content: {
      quality: string;
      tips: string[];
    };
    audience: {
      primary: string;
      suggestions: string;
    };
  };
}

const parseResponse = (text: string): ParsedInsights => {
  const insights: ParsedInsights = {
    metrics: {
      likes: '0',
      shares: '0',
      comments: '0',
      views: '0',
      demographics: '',
      engagementRate: '0%'
    },
    formatPerformance: {
      reelEngagement: '',
      commentRate: '',
      additionalInsights: []
    },
    recommendations: {
      timing: {
        time: '',
        day: '',
        reason: ''
      },
      hashtags: [],
      content: {
        quality: '',
        tips: []
      },
      audience: {
        primary: '',
        suggestions: ''
      }
    }
  };

  try {
    // Parse Metrics section
    const metricsMatch = text.match(/Metrics:[\s\S]*?(?=\n\nFormat Insights)/);
    if (metricsMatch) {
      const metricsText = metricsMatch[0];
      insights.metrics = {
        engagementRate: metricsText.match(/engagement rate.*?around (\d+%)/i)?.[1] || '0%',
        likes: metricsText.match(/likes.*?around (\d+,?\d*)/i)?.[1] || '0',
        shares: metricsText.match(/shares.*?about (\d+,?\d*)/i)?.[1] || '0',
        comments: metricsText.match(/comments.*?approximately (\d+,?\d*)/i)?.[1] || '0',
        views: metricsText.match(/views.*?around (\d+,?\d*)/i)?.[1] || '0',
        demographics: metricsText.match(/demographic.*?(25-34.*?groups)/i)?.[1] || ''
      };
    }

    // Parse Format Insights
    const formatMatch = text.match(/Format Insights:[\s\S]*?(?=\n\nDirect Answer)/);
    if (formatMatch) {
      const formatText = formatMatch[0];
      insights.formatPerformance = {
        reelEngagement: formatText.match(/(\d+%\s*higher engagement)/i)?.[1] || '',
        commentRate: formatText.match(/(generate more comments.*?content)/i)?.[1] || '',
        additionalInsights: [
          formatText.match(/likely due to.*?content/i)?.[0] || ''
        ].filter(Boolean)
      };
    }

    // Parse Suggestions
    const suggestionMatch = text.match(/Suggestion:[\s\S]*$/);
    if (suggestionMatch) {
      const suggestionText = suggestionMatch[0];

      // Parse timing
      const timingMatch = suggestionText.match(/Optimal Posting Time:([^.]+)/);
      if (timingMatch) {
        const timingText = timingMatch[1];
        insights.recommendations.timing = {
          time: timingText.match(/at\s*([\d:]+\s*[AaPpMm]+)/)?.[1] || '',
          day: timingText.match(/on\s*(\w+)/)?.[1] || '',
          reason: timingText.match(/as\s*([^.]+)/)?.[1]?.trim() || ''
        };
      }

      // Parse hashtags
      const hashtagsMatch = suggestionText.match(/hashtags like([^.]+)/i);
      if (hashtagsMatch) {
        insights.recommendations.hashtags = hashtagsMatch[1]
          .match(/#\w+/g) || [];
      }

      // Parse content quality
      const contentMatch = suggestionText.match(/Content Quality:([^.]+)/);
      if (contentMatch) {
        const contentText = contentMatch[1];
        const tipsMatch = suggestionText.match(/Content Quality:[^.]+\.(.*?)(?=Target Audience:|$)/s);
        insights.recommendations.content = {
          quality: contentText.trim(),
          tips: tipsMatch ? 
            tipsMatch[1].split('.').map(tip => tip.trim()).filter(Boolean) : 
            []
        };
      }

      // Parse target audience
      const audienceMatch = suggestionText.match(/Target Audience:([^.]+)/);
      if (audienceMatch) {
        const audienceText = audienceMatch[1];
        const suggestionsMatch = suggestionText.match(/Target Audience:[^.]+\.(.*?)$/s);
        insights.recommendations.audience = {
          primary: audienceText.trim(),
          suggestions: suggestionsMatch?.[1]?.trim() || ''
        };
      }
    }

  } catch (error) {
    console.error('Error parsing response:', error);
  }

  return insights;
};

export const runFlow = async (message: string): Promise<any> => {
  const api_url = `/api/lf/${LANGFLOW_ID}/api/v1/run/${FLOW_ID}`;
  
  const token = import.meta.env.VITE_LANGFLOW_TOKEN;
  if (!token) {
    throw new Error('API token not found');
  }

  const payload = {
    input_value: message,
    output_type: "chat",
    input_type: "chat",
    prompt_template: PROMPT_TEMPLATE,
    tweaks: {
      "ChatInput-607TC": {},
      "ParseData-N1SbE": {},
      "Prompt-UkRo0": {},
      "SplitText-gMLdN": {},
      "ChatOutput-XjUer": {},
      "AstraDB-7D7if": {},
      "AstraDB-CFram": {},
      "File-KaGXk": {},
      "AzureOpenAIEmbeddings-27D3Q": {},
      "AzureOpenAIEmbeddings-aOEe5": {},
      "AzureOpenAIModel-8Uo4q": {}
    }
  };

  try {
    console.log('Using token:', token);
    const response = await fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}; 