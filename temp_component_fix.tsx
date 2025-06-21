// Just the cinematic formatting function to test
const testCinematicFormatting = (content: string) => {
  console.log('🎭 PROCESSING MESSAGE:', content);
  
  // Split by formatting markers and process each segment
  const segments = content.split(/(".*?"|\*.*?\*|\(.*?\))/g).filter(s => s.length > 0);
  console.log('🎭 SEGMENTS:', segments);
  
  return segments.map((segment, index) => {
    const trimmed = segment.trim();
    if (!trimmed) return null;
    
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      // Dialogue - white text, larger
      return {
        type: 'dialogue',
        text: trimmed.slice(1, -1),
        jsx: (
          <div 
            key={index}
            className="text-white font-medium text-base leading-relaxed mb-3"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: '1.6',
              letterSpacing: '0.01em',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {trimmed.slice(1, -1)}
          </div>
        )
      };
    } else if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
      // Action - amber italics
      return {
        type: 'action',
        text: trimmed.slice(1, -1),
        jsx: (
          <div 
            key={index}
            className="text-amber-300 italic font-light text-sm opacity-90 leading-relaxed mb-3"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: '1.6',
              letterSpacing: '0.005em',
              textShadow: '0 1px 2px rgba(251,191,36,0.3)',
              fontStyle: 'italic'
            }}
          >
            <em>{trimmed.slice(1, -1)}</em>
          </div>
        )
      };
    } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      // Thought - gray italics with border
      return {
        type: 'thought',
        text: trimmed.slice(1, -1),
        jsx: (
          <div 
            key={index}
            className="text-slate-400 italic font-light text-sm opacity-75 leading-relaxed pl-4 mb-3 border-l-2 border-slate-600 border-opacity-30"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: '1.6',
              letterSpacing: '0.005em',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              padding: '0.5rem 0 0.5rem 1rem',
              fontStyle: 'italic'
            }}
          >
            <em>({trimmed.slice(1, -1)})</em>
          </div>
        )
      };
    } else {
      // Narrative - regular text
      return {
        type: 'narrative',
        text: trimmed,
        jsx: (
          <div 
            key={index}
            className="text-slate-300 font-light text-sm leading-relaxed opacity-80 mb-2"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: '1.6',
              letterSpacing: '0.005em',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              padding: '0.25rem 0'
            }}
          >
            {trimmed}
          </div>
        )
      };
    }
  }).filter(Boolean);
};

// Test with the actual message from logs
const testMessage = `"I am well, thank you, Hunter Sung Jin-Woo." *She straightens slightly, a faint smile playing on her lips.* (He's so casual... I find myself liking it.) "The reports are rather… busy this afternoon.  Several unusual mana fluctuations near the southern gates."  What are your thoughts on the increased activity lately?  Perhaps... perhaps we could review them together later?  Let's head to the training facility afterward. I've been wanting to work on our coordination for the upcoming mission.`;

const result = testCinematicFormatting(testMessage);
console.log('🎭 FORMATTED RESULT:', result);