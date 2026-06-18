export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  const lines = markdown.split('\n');
  const html: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 1. Handle Code Blocks
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        inCodeBlock = false;
        const escapedCode = escapeHtml(codeBlockContent.join('\n'));
        html.push(`<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-xs overflow-x-auto my-2 text-foreground"><code class="${codeLanguage ? 'language-' + codeLanguage : ''}">${escapedCode}</code></pre>`);
        codeBlockContent = [];
        codeLanguage = '';
      } else {
        // Open code block
        if (inList) {
          html.push(listType === 'ul' ? '</ul>' : '</ol>');
          inList = false;
          listType = null;
        }
        inCodeBlock = true;
        codeLanguage = trimmedLine.substring(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // 2. Handle Horizontal Rule
    if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
      if (inList) {
        html.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = null;
      }
      html.push('<hr class="my-3 border-t opacity-30" style="border-color: var(--border)" />');
      continue;
    }

    // 3. Handle Blockquotes
    if (trimmedLine.startsWith('>')) {
      if (inList) {
        html.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = null;
      }
      const quoteText = trimmedLine.substring(1).trim();
      html.push(`<blockquote class="border-l-4 border-purple-500 pl-4 py-1 my-2 italic text-muted-foreground">${parseInline(quoteText)}</blockquote>`);
      continue;
    }

    // 4. Handle Headers
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      if (inList) {
        html.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = null;
      }
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      
      let sizeClass = 'text-xs';
      if (level === 1) sizeClass = 'text-lg font-extrabold mt-4 mb-2';
      else if (level === 2) sizeClass = 'text-base font-bold mt-4 mb-1.5';
      else if (level === 3) sizeClass = 'text-sm font-bold mt-3 mb-1';
      else sizeClass = 'text-xs font-semibold mt-2 mb-1';

      html.push(`<h${level} class="${sizeClass} text-foreground" style="color: var(--foreground)">${parseInline(text)}</h${level}>`);
      continue;
    }

    // 5. Handle Unordered Lists
    const ulMatch = trimmedLine.match(/^([\-\*\+])\s+(.*)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) html.push(listType === 'ul' ? '</ul>' : '</ol>');
        html.push('<ul class="list-disc pl-5 my-2 flex flex-col gap-1 text-foreground" style="color: var(--foreground)">');
        inList = true;
        listType = 'ul';
      }
      html.push(`<li>${parseInline(ulMatch[2])}</li>`);
      continue;
    }

    // 6. Handle Ordered Lists
    const olMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      const startValue = parseInt(olMatch[1], 10);
      if (!inList || listType !== 'ol') {
        if (inList) html.push(listType === 'ul' ? '</ul>' : '</ol>');
        html.push(`<ol start="${startValue}" class="list-decimal pl-5 my-2 flex flex-col gap-1 text-foreground" style="color: var(--foreground)">`);
        inList = true;
        listType = 'ol';
      }
      html.push(`<li>${parseInline(olMatch[2])}</li>`);
      continue;
    }

    // Helper to check if next non-empty line starts with a list item of the current type
    const nextLineIsListItem = (index: number, type: 'ul' | 'ol'): boolean => {
      for (let k = index + 1; k < lines.length; k++) {
        const trimmed = lines[k].trim();
        if (trimmed === '') continue;
        if (type === 'ul') {
          return /^([\-\*\+])\s+(.*)$/.test(trimmed);
        } else {
          return /^(\d+)\.\s+(.*)$/.test(trimmed);
        }
      }
      return false;
    };

    // 7. Handle Empty Lines
    if (trimmedLine === '') {
      if (inList && !nextLineIsListItem(i, listType!)) {
        html.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = null;
      }
      continue;
    }

    // 8. Normal Paragraph Line
    if (inList) {
      html.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
      listType = null;
    }

    html.push(`<p class="mb-2 last:mb-0">${parseInline(trimmedLine)}</p>`);
  }

  if (inList) {
    html.push(listType === 'ul' ? '</ul>' : '</ol>');
  }
  if (inCodeBlock) {
    const escapedCode = escapeHtml(codeBlockContent.join('\n'));
    html.push(`<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-xs overflow-x-auto my-2 text-foreground"><code>${escapedCode}</code></pre>`);
  }

  return html.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseInline(text: string): string {
  let result = escapeHtml(text);

  // Bold **text** or __text__
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // Italics *text* or _text_
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
  result = result.replace(/_(.*?)_/g, '<em>$1</em>');

  // Inline code `code`
  result = result.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-xs text-purple-600 dark:text-purple-400 font-semibold">$1</code>');

  // Links [text](url)
  result = result.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-600 dark:text-purple-400 hover:underline font-semibold">$1</a>');

  return result;
}
