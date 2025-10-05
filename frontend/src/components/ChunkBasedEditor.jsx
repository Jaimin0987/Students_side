import React, { useState, useRef, useEffect } from 'react';
import { Bold, Underline, List, ListOrdered, ArrowDown } from 'lucide-react';
import './ChunkBasedEditor.css';

const ChunkBasedEditor = ({ value, onChange, placeholder, theme, className = '' }) => {
  const [chunks, setChunks] = useState([]);
  const [currentChunk, setCurrentChunk] = useState({ text: '', style: 'normal' });
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isList, setIsList] = useState(false);
  const [listType, setListType] = useState('ul');
  const editorRef = useRef(null);

  // Initialize chunks from value prop
  useEffect(() => {
    if (value && typeof value === 'string') {
      // Parse existing HTML content into chunks
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = value;
      const parsedChunks = parseHTMLToChunks(tempDiv);
      setChunks(parsedChunks);
    } else if (Array.isArray(value)) {
      setChunks(value);
    }
  }, [value]);

  // Update parent component when chunks change
  useEffect(() => {
    const htmlString = chunksToHTML(chunks);
    onChange(htmlString);
  }, [chunks, onChange]);

  const parseHTMLToChunks = (element) => {
    const chunks = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const parent = node.parentElement;
        let style = 'normal';
        
                 if (parent.tagName === 'STRONG' || parent.tagName === 'B') style = 'bold';
         else if (parent.tagName === 'U') style = 'underline';
        else if (parent.tagName === 'LI') {
          const listParent = parent.parentElement;
          style = listParent.tagName === 'OL' ? 'ordered-list' : 'unordered-list';
        }
        
        chunks.push({
          text: node.textContent,
          style: style
        });
      }
    }
    
    return chunks.length > 0 ? chunks : [{ text: '', style: 'normal' }];
  };

  const chunksToHTML = (chunkArray) => {
    if (!chunkArray || chunkArray.length === 0) return '';
    
    let html = '';
    let currentListType = null;
    let inList = false;
    
    chunkArray.forEach((chunk, index) => {
      if (chunk.text.trim() === '') return;
      
      let chunkHTML = chunk.text;
      
             // Apply formatting
       if (chunk.style === 'bold') chunkHTML = `<strong>${chunkHTML}</strong>`;
       else if (chunk.style === 'underline') chunkHTML = `<u>${chunkHTML}</u>`;
       else if (chunk.style === 'line-break') chunkHTML = '<br>';
      
      // Handle lists
      if (chunk.style === 'unordered-list' || chunk.style === 'ordered-list') {
        const newListType = chunk.style === 'unordered-list' ? 'ul' : 'ol';
        
        if (!inList || currentListType !== newListType) {
          if (inList) html += `</${currentListType}>`;
          html += `<${newListType}>`;
          inList = true;
          currentListType = newListType;
        }
        
        chunkHTML = `<li>${chunkHTML}</li>`;
      } else {
        if (inList) {
          html += `</${currentListType}>`;
          inList = false;
          currentListType = null;
        }
      }
      
      html += chunkHTML;
    });
    
    if (inList) {
      html += `</${currentListType}>`;
    }
    
    return html;
  };

  const addChunk = (text, style) => {
    if (text.trim() === '') return;
    
    // Handle list items - split by commas and create separate chunks
    if (style === 'unordered-list' || style === 'ordered-list') {
      const items = text.split(',').map(item => item.trim()).filter(item => item);
      items.forEach((item, index) => {
        const newChunk = { text: item, style };
        setChunks(prev => [...prev, newChunk]);
      });
    } else {
      const newChunk = { text: text.trim(), style };
      setChunks(prev => [...prev, newChunk]);
    }
    
    setCurrentChunk({ text: '', style });
  };

  const addLineBreak = () => {
    const lineBreakChunk = { text: '<br>', style: 'line-break' };
    setChunks(prev => [...prev, lineBreakChunk]);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          if (currentChunk.text.trim()) {
            addChunk(currentChunk.text, currentChunk.style);
          }
          handleStyleChange('bold');
          break;
        
        case 'u':
          e.preventDefault();
          if (currentChunk.text.trim()) {
            addChunk(currentChunk.text, currentChunk.style);
          }
          handleStyleChange('underline');
          break;
        case 'n':
          e.preventDefault();
          if (currentChunk.text.trim()) {
            addChunk(currentChunk.text, currentChunk.style);
          }
          handleStyleChange('normal');
          break;
        default:
          break;
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentChunk.text.trim()) {
        addChunk(currentChunk.text, currentChunk.style);
      }
      // Don't reset style on Enter, keep current style for next chunk
    }
  };

  const handleInput = (e) => {
    setCurrentChunk(prev => ({ ...prev, text: e.target.value }));
  };

  const handleStyleChange = (newStyle) => {
    if (currentChunk.text.trim()) {
      addChunk(currentChunk.text, currentChunk.style);
    }
    
    setCurrentChunk({ text: '', style: newStyle });
    
         // Update button states
     setIsBold(newStyle === 'bold');
     setIsUnderline(newStyle === 'underline');
     setIsList(newStyle === 'unordered-list' || newStyle === 'ordered-list');
     setListType(newStyle === 'ordered-list' ? 'ol' : 'ul');
  };

  const removeChunk = (index) => {
    setChunks(prev => prev.filter((_, i) => i !== index));
  };

  const editChunk = (index) => {
    const chunk = chunks[index];
    setCurrentChunk({ text: chunk.text, style: chunk.style });
    setChunks(prev => prev.filter((_, i) => i !== index));
    editorRef.current?.focus();
  };

  const clearAll = () => {
    setChunks([]);
         setCurrentChunk({ text: '', style: 'normal' });
     setIsBold(false);
     setIsUnderline(false);
     setIsList(false);
  };

  return (
    <div className={`chunk-based-editor border rounded-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
      {/* Toolbar */}
      <div className={`flex items-center p-2 border-b ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <button
          onClick={() => handleStyleChange('normal')}
          className={`p-2 rounded ${currentChunk.style === 'normal' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Normal (Ctrl+N)"
        >
          N
        </button>
        <button
          onClick={() => handleStyleChange('bold')}
          className={`p-2 rounded ${currentChunk.style === 'bold' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        
        <button
          onClick={() => handleStyleChange('underline')}
          className={`p-2 rounded ${currentChunk.style === 'underline' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Underline (Ctrl+U)"
        >
          <Underline size={16} />
        </button>
        <div className={`w-px h-6 mx-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
        <button
          onClick={() => handleStyleChange('unordered-list')}
          className={`p-2 rounded ${currentChunk.style === 'unordered-list' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
                 <button
           onClick={() => handleStyleChange('ordered-list')}
           className={`p-2 rounded ${currentChunk.style === 'ordered-list' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
           title="Numbered List"
         >
           <ListOrdered size={16} />
         </button>
         <div className={`w-px h-6 mx-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
         <button
           onClick={addLineBreak}
           className={`p-2 rounded ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
           title="Add Line Break"
         >
           <ArrowDown size={16} />
         </button>
        <div className={`w-px h-6 mx-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
        <button
          onClick={clearAll}
          className={`p-2 rounded ${theme === 'dark' ? 'text-red-400 hover:bg-gray-600' : 'text-red-500 hover:bg-gray-200'}`}
          title="Clear All"
        >
          Clear
        </button>
      </div>

      {/* Current Style Indicator */}
      <div className={`px-3 py-1 text-xs ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
        Current Style: <span className="font-semibold">{currentChunk.style}</span>
      </div>

      {/* Editor Area */}
      <div className="p-3 space-y-2">
                 {/* Existing Chunks */}
         {chunks.map((chunk, index) => (
           <div key={index} className="flex items-center space-x-2 chunk-item">
             {chunk.style === 'line-break' ? (
               <div className="flex-1 p-2 rounded bg-yellow-100 dark:bg-yellow-900 text-center">
                 <span className="text-xs opacity-60">[LINE BREAK]</span>
               </div>
             ) : (
               <div 
                 className={`flex-1 p-2 rounded cursor-pointer ${getChunkStyle(chunk.style, theme)}`}
                 onClick={() => editChunk(index)}
                 title="Click to edit"
               >
                 <span className="text-xs opacity-60 mr-2">[{chunk.style}]</span>
                 {chunk.text}
               </div>
             )}
             <button
               onClick={() => removeChunk(index)}
               className={`p-1 rounded ${theme === 'dark' ? 'text-red-400 hover:bg-gray-600' : 'text-red-500 hover:bg-gray-200'}`}
               title="Remove chunk"
             >
               ×
             </button>
           </div>
         ))}

                 {/* Current Input */}
         <div className="flex items-center space-x-2">
           <input
             ref={editorRef}
             type="text"
             value={currentChunk.text}
             onChange={handleInput}
             onKeyDown={handleKeyDown}
             placeholder={chunks.length === 0 ? placeholder : `Type ${currentChunk.style} text... (use commas to separate list items)`}
             className={`flex-1 p-2 rounded border ${getInputStyle(currentChunk.style, theme)}`}
           />
           {currentChunk.text.trim() && (
             <button
               onClick={() => addChunk(currentChunk.text, currentChunk.style)}
               className={`p-2 rounded ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
               title="Add chunk"
             >
               +
             </button>
           )}
         </div>
      </div>
    </div>
  );
};

const getChunkStyle = (style, theme) => {
  const baseStyle = theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800';
  
  switch (style) {
    case 'bold':
      return `${baseStyle} font-bold`;
    case 'underline':
      return `${baseStyle} underline`;
    case 'unordered-list':
      return `${baseStyle} ml-4 before:content-['•'] before:mr-2`;
    case 'ordered-list':
      return `${baseStyle} ml-4 before:content-['1.'] before:mr-2`;
    default:
      return baseStyle;
  }
};

const getInputStyle = (style, theme) => {
  const baseStyle = theme === 'dark' 
    ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400' 
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';
  
  switch (style) {
    case 'bold':
      return `${baseStyle} font-bold`;
    case 'underline':
      return `${baseStyle} underline`;
    default:
      return baseStyle;
  }
};

export default ChunkBasedEditor;
