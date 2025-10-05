import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder, theme, className = '' }) => {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const editorRef = useRef(null);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          setIsBold(!isBold);
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          setIsItalic(!isItalic);
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          setIsUnderline(!isUnderline);
          break;
        default:
          break;
      }
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className={`rich-text-editor border rounded-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
      {/* Toolbar */}
      <div className={`flex items-center p-2 border-b ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <button
          onClick={() => {
            formatText('bold');
            setIsBold(!isBold);
          }}
          className={`p-2 rounded ${isBold ? 'bg-blue-500 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => {
            formatText('italic');
            setIsItalic(!isItalic);
          }}
          className={`p-2 rounded ${isItalic ? 'bg-blue-500 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => {
            formatText('underline');
            setIsUnderline(!isUnderline);
          }}
          className={`p-2 rounded ${isUnderline ? 'bg-blue-500 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Underline (Ctrl+U)"
        >
          <Underline size={16} />
        </button>
        <div className={`w-px h-6 mx-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
        <button
          onClick={() => formatText('insertUnorderedList')}
          className={`p-2 rounded ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => formatText('insertOrderedList')}
          className={`p-2 rounded ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onPaste={handlePaste}
        className={`p-3 min-h-[120px] outline-none ${className} ${
          theme === 'dark' 
            ? 'text-gray-200 placeholder-gray-400' 
            : 'text-gray-900 placeholder-gray-500'
        }`}
        data-placeholder={placeholder}
        style={{
          '--tw-placeholder-opacity': '1',
          '--tw-placeholder-color': theme === 'dark' ? '#9ca3af' : '#6b7280'
        }}
      />
    </div>
  );
};

export default RichTextEditor;
