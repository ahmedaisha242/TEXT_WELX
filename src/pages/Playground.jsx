import { useMemo, useRef, useState } from 'react'
import { Code, Download, Play, Save } from 'lucide-react'

const starterCodeByLanguage = {
  javascript: `// Welcome to Wel.X Coding Playground
console.log('Hello, World!');

// Try changing "Learner" to your own name
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('Learner'));`,
  python: `print('Hello, World!')

def greet(name):
    return f'Hello, {name}!'

print(greet('aisha'))`,
  java: `import java.util.Scanner;

public class HelloWorld {
  public static void main(String args[]) {
    Scanner input = new Scanner(System.in);

    System.out.println("What is your name?");
    String name = input.nextLine();

    System.out.println("How old are you?");
    int age = input.nextInt();

    System.out.println("Hello, " + name);
    System.out.println("You are " + age + " years old.");
  }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello, World!" << endl;
  return 0;
}`,
  html: `<!DOCTYPE html>
<html>

  <head>
    <title>My First Webpage</title>
  </head>

  <body>
    <h1>My First Webpage</h1>
    <p>This is a paragraph.</p>
  </body>

</html>`,
}

const languages = [
  { id: 'javascript', name: 'JavaScript', icon: 'JS' },
  { id: 'python', name: 'Python', icon: 'PY' },
  { id: 'java', name: 'Java', icon: 'JV' },
  { id: 'cpp', name: 'C++', icon: 'C+' },
  { id: 'html', name: 'HTML/CSS', icon: '<>' },
]

const examples = [
  { title: 'Calculator App', lang: 'javascript', label: 'JavaScript', difficulty: 'Easy' },
  { title: 'Todo List', lang: 'javascript', label: 'JavaScript', difficulty: 'Medium' },
  { title: 'Data Structures', lang: 'python', label: 'Python', difficulty: 'Hard' },
  { title: 'Web Scraper', lang: 'python', label: 'Python', difficulty: 'Medium' },
]

const comingSoonLanguages = new Set(['python', 'cpp'])

const htmlVoidTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

function getFriendlyJavaScriptError(error) {
  const message = error?.message || 'Unknown error'

  if (message.includes('Unexpected end of input')) {
    return 'Syntax Error: Something is not closed. Check for a missing }, ), ], quote, or backtick.'
  }

  if (message.includes('Invalid or unexpected token')) {
    return 'Syntax Error: JavaScript found an invalid symbol. Check your quotes, brackets, and punctuation.'
  }

  if (message.includes('Unexpected token')) {
    return `Syntax Error: JavaScript found something unexpected.\nDetails: ${message}`
  }

  if (message.includes('is not defined')) {
    return `Reference Error: A variable or function name is misspelled or has not been created.\nDetails: ${message}`
  }

  if (message.includes('is not a function')) {
    return `Type Error: Something is being called like a function, but JavaScript cannot run it that way.\nDetails: ${message}`
  }

  return `Error: ${message}`
}

function getLineLabel(index) {
  return `line ${index + 1}`
}

function hasUnclosedQuotes(line) {
  let single = 0
  let double = 0
  let backtick = 0
  let escaped = false

  for (const char of line) {
    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === "'") single += 1
    if (char === '"') double += 1
    if (char === '`') backtick += 1
  }

  return single % 2 !== 0 || double % 2 !== 0 || backtick % 2 !== 0
}

function shouldRequireSemicolon(line) {
  if (!line || line.startsWith('//')) return false
  if (/^(if|else|for|while|switch|try|catch|finally|function|class)\b/.test(line)) return false
  if (/^(import|export)\b/.test(line)) return false
  if (/[;{}:,]$/.test(line)) return false
  if (line.endsWith('(') || line.endsWith('[')) return false
  if (/^\s*<\/?[\w-]/.test(line)) return false

  return /^(const|let|var|return|console\.|[\w$.]+\(|[\w$]+\s*=)/.test(line)
}

function checkJavaScriptBeforeRun(code) {
  const lines = code.split('\n')
  let braces = 0
  let parentheses = 0
  let brackets = 0

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index]
    const line = rawLine.trim()

    if (!line || line.startsWith('//')) continue

    if (/\bconsol\.log\b|\bconsole\.(loog|lg)\b/.test(line)) {
      return `Spelling Error on ${getLineLabel(index)}: did you mean "console.log(...)"?`
    }

    if (/\bpritn\s*\(|\bprnt\s*\(/.test(line)) {
      return `Spelling Error on ${getLineLabel(index)}: did you mean "print" in Python, or "console.log" in JavaScript?`
    }

    if (/\bprint\s*\(/.test(line)) {
      return `Syntax Error on ${getLineLabel(index)}: JavaScript uses console.log(...), not print(...).`
    }

    if (hasUnclosedQuotes(rawLine)) {
      return `Syntax Error on ${getLineLabel(index)}: a quote is not closed.`
    }

    if (shouldRequireSemicolon(line)) {
      return `Syntax Error on ${getLineLabel(index)}: missing semicolon ";".`
    }

    for (const char of rawLine) {
      if (char === '{') braces += 1
      if (char === '}') braces -= 1
      if (char === '(') parentheses += 1
      if (char === ')') parentheses -= 1
      if (char === '[') brackets += 1
      if (char === ']') brackets -= 1

      if (braces < 0) return `Syntax Error on ${getLineLabel(index)}: extra closing curly brace "}".`
      if (parentheses < 0) return `Syntax Error on ${getLineLabel(index)}: extra closing bracket ")".`
      if (brackets < 0) return `Syntax Error on ${getLineLabel(index)}: extra closing square bracket "]".`
    }
  }

  if (braces > 0) return 'Syntax Error: missing closing curly brace "}".'
  if (parentheses > 0) return 'Syntax Error: missing closing bracket ")".'
  if (brackets > 0) return 'Syntax Error: missing closing square bracket "]".'

  return null
}

function getLineNumberFromIndex(code, index) {
  return code.slice(0, index).split('\n').length
}

function checkCssSyntax(css, startingLine = 1) {
  const lines = css.split('\n')
  let openBraces = 0

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = startingLine + index
    const line = lines[index].trim()

    if (!line || line.startsWith('/*') || line.startsWith('*') || line.endsWith('*/')) continue

    if (openBraces === 0 && line.includes(':') && !line.includes('{')) {
      return `CSS Error on line ${lineNumber}: CSS properties must be inside a selector block, like body { color: red; }.`
    }

    if (line.includes('{') && !line.split('{')[0].trim()) {
      return `CSS Error on line ${lineNumber}: missing selector before "{".`
    }

    for (const char of line) {
      if (char === '{') openBraces += 1
      if (char === '}') openBraces -= 1

      if (openBraces < 0) {
        return `CSS Error on line ${lineNumber}: extra closing curly brace "}".`
      }
    }

    if (line.includes('{') || line.includes('}') || line.startsWith('@')) continue

    if (openBraces > 0 && line.includes(':') && !line.endsWith(';')) {
      return `CSS Error on line ${lineNumber}: missing semicolon ";".`
    }

    if (openBraces > 0 && /^[a-z-]+\s+[^:;]+;?$/i.test(line)) {
      return `CSS Error on line ${lineNumber}: missing colon ":" between the property and value.`
    }
  }

  if (openBraces > 0) return 'CSS Error: missing closing curly brace "}".'

  return null
}

function checkCssDeclarations(css, startingLine = 1) {
  const blocks = css.matchAll(/([^{}]+)\{([^{}]*)\}/g)

  for (const block of blocks) {
    const selector = block[1].trim()
    const declarations = block[2]
    const blockLine = startingLine + css.slice(0, block.index).split('\n').length - 1
    const declarationLines = declarations.split('\n')

    if (!selector) return `CSS Error on line ${blockLine}: missing selector before "{".`

    for (let index = 0; index < declarationLines.length; index += 1) {
      const lineNumber = blockLine + index
      const line = declarationLines[index].trim()

      if (!line) continue

      const parts = line.split(';').map((part) => part.trim()).filter(Boolean)

      for (const part of parts) {
        if (!part.includes(':')) {
          return `CSS Error on line ${lineNumber}: missing colon ":" between the property and value.`
        }
      }

      if (line.includes(':') && !line.endsWith(';')) {
        return `CSS Error on line ${lineNumber}: missing semicolon ";".`
      }
    }
  }

  return null
}

function checkHtmlTagDelimiters(code) {
  let insideTag = false
  let quote = ''
  let tagStartLine = 1

  for (let index = 0; index < code.length; index += 1) {
    const char = code[index]

    if (insideTag && quote) {
      if (char === quote && code[index - 1] !== '\\') quote = ''
      continue
    }

    if (insideTag && (char === '"' || char === "'")) {
      quote = char
      continue
    }

    if (char === '<') {
      if (insideTag) {
        return `HTML Error on line ${tagStartLine}: missing closing ">" before starting a new tag.`
      }

      insideTag = true
      tagStartLine = getLineNumberFromIndex(code, index)
      continue
    }

    if (char === '>') {
      if (!insideTag) {
        return `HTML Error on line ${getLineNumberFromIndex(code, index)}: extra ">".`
      }

      insideTag = false
    }
  }

  if (insideTag) {
    return `HTML Error on line ${tagStartLine}: missing closing ">".`
  }

  return null
}

function checkHtmlCssSyntax(code) {
  const trimmedCode = code.trim()

  if (!trimmedCode) return 'HTML Error: write some HTML or CSS before running.'

  const delimiterError = checkHtmlTagDelimiters(code)

  if (delimiterError) return delimiterError

  const styleOpenCount = (code.match(/<style\b[^>]*>/gi) || []).length
  const styleCloseCount = (code.match(/<\/style>/gi) || []).length

  if (styleOpenCount > styleCloseCount) return 'HTML Error: missing closing </style> tag.'
  if (styleCloseCount > styleOpenCount) return 'HTML Error: extra closing </style> tag.'

  const styleBlockRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
  let styleMatch = styleBlockRegex.exec(code)

  while (styleMatch) {
    const styleStartLine = getLineNumberFromIndex(code, styleMatch.index)
    const cssError = checkCssSyntax(styleMatch[1], styleStartLine + 1)
    const cssDeclarationError = checkCssDeclarations(styleMatch[1], styleStartLine + 1)

    if (cssError) return cssError
    if (cssDeclarationError) return cssDeclarationError

    styleMatch = styleBlockRegex.exec(code)
  }

  if (!/<[a-z][\s\S]*>/i.test(code) && code.includes('{')) {
    const cssOnlyError = checkCssSyntax(code)
    const cssOnlyDeclarationError = checkCssDeclarations(code)
    return cssOnlyError || cssOnlyDeclarationError || 'CSS syntax check passed.'
  }

  if (!code.includes('<') || !code.includes('>')) return 'HTML Error: missing HTML tags.'

  const tagStack = []
  const tagRegex = /<\/?([a-zA-Z][\w-]*)(\s[^<>]*)?>/g
  let tagMatch = tagRegex.exec(code)

  while (tagMatch) {
    const fullTag = tagMatch[0]
    const tagName = tagMatch[1].toLowerCase()
    const lineNumber = getLineNumberFromIndex(code, tagMatch.index)
    const isClosingTag = fullTag.startsWith('</')
    const isSelfClosingTag = fullTag.endsWith('/>') || htmlVoidTags.has(tagName)
    const tagAttributes = tagMatch[2] || ''

    if (hasUnclosedQuotes(tagAttributes)) {
      return `HTML Error on line ${lineNumber}: an attribute quote is not closed.`
    }

    if (isClosingTag) {
      const lastOpenTag = tagStack.pop()

      if (!lastOpenTag) {
        return `HTML Error on line ${lineNumber}: extra closing </${tagName}> tag.`
      }

      if (lastOpenTag.tagName !== tagName) {
        return `HTML Error on line ${lineNumber}: expected </${lastOpenTag.tagName}> before </${tagName}>.`
      }
    } else if (!isSelfClosingTag) {
      tagStack.push({ tagName, lineNumber })
    }

    tagMatch = tagRegex.exec(code)
  }

  if (tagStack.length > 0) {
    const lastOpenTag = tagStack.pop()
    return `HTML Error on line ${lastOpenTag.lineNumber}: missing closing </${lastOpenTag.tagName}> tag.`
  }

  return 'HTML/CSS syntax check passed.'
}

function shouldRequireJavaSemicolon(line) {
  if (!line || line.startsWith('//')) return false
  if (/^(public|private|protected)?\s*(class|interface|enum)\b/.test(line)) return false
  if (/^(public|private|protected)?\s*(static\s+)?[\w<>[\]]+\s+\w+\s*\([^)]*\)\s*\{?$/.test(line)) return false
  if (/^(if|else|for|while|switch|try|catch|finally|do)\b/.test(line)) return false
  if (/[;{}]$/.test(line)) return false

  return /^(import\b|return\b|System\.out\.|Scanner\b|String\b|int\b|double\b|float\b|boolean\b|char\b|long\b|[\w]+\s*=)/.test(line)
}

function checkJavaBeforeRun(code) {
  const lines = code.split('\n')
  let braces = 0
  let parentheses = 0
  let brackets = 0

  if (!/\bpublic\s+class\s+\w+/.test(code)) {
    return 'Java Error: missing public class, for example public class HelloWorld.'
  }

  if (!/\bpublic\s+static\s+void\s+main\s*\(\s*String\s+(\w+\[\]|\[\]\s*\w+)\s*\)/.test(code)) {
    return 'Java Error: missing main method, for example public static void main(String args[]).'
  }

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index]
    const line = rawLine.trim()

    if (!line || line.startsWith('//')) continue

    if (line.includes('console.log')) {
      return `Java Error on ${getLineLabel(index)}: use System.out.println(...), not console.log(...).`
    }

    if (/\bSystem\.out\.(printn|prinln|printl)\b/.test(line)) {
      return `Spelling Error on ${getLineLabel(index)}: did you mean System.out.println(...)?`
    }

    if (/^\s*print\s*\(/.test(line)) {
      return `Java Error on ${getLineLabel(index)}: use System.out.println(...), not print(...).`
    }

    if (hasUnclosedQuotes(rawLine)) {
      return `Java Syntax Error on ${getLineLabel(index)}: a quote is not closed.`
    }

    if (shouldRequireJavaSemicolon(line)) {
      return `Java Syntax Error on ${getLineLabel(index)}: missing semicolon ";".`
    }

    for (const char of rawLine) {
      if (char === '{') braces += 1
      if (char === '}') braces -= 1
      if (char === '(') parentheses += 1
      if (char === ')') parentheses -= 1
      if (char === '[') brackets += 1
      if (char === ']') brackets -= 1

      if (braces < 0) return `Java Syntax Error on ${getLineLabel(index)}: extra closing curly brace "}".`
      if (parentheses < 0) return `Java Syntax Error on ${getLineLabel(index)}: extra closing bracket ")".`
      if (brackets < 0) return `Java Syntax Error on ${getLineLabel(index)}: extra closing square bracket "]".`
    }
  }

  if (braces > 0) return 'Java Syntax Error: missing closing curly brace "}".'
  if (parentheses > 0) return 'Java Syntax Error: missing closing bracket ")".'
  if (brackets > 0) return 'Java Syntax Error: missing closing square bracket "]".'

  return null
}

function splitJavaExpressionParts(expression) {
  const parts = []
  let current = ''
  let quote = ''
  let escaped = false

  for (const char of expression) {
    if (escaped) {
      current += char
      escaped = false
      continue
    }

    if (char === '\\') {
      current += char
      escaped = true
      continue
    }

    if (quote) {
      current += char
      if (char === quote) quote = ''
      continue
    }

    if (char === '"' || char === "'") {
      current += char
      quote = char
      continue
    }

    if (char === '+') {
      parts.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  if (current.trim()) parts.push(current.trim())

  return parts
}

function getJavaStatements(code) {
  return (
    code.match(
      /System\.out\.println\s*\([\s\S]*?\)\s*;|\b(String|int|double|float|boolean|char|long)\s+\w+\s*=\s*[^;]+;/g,
    ) || []
  )
}

function getJavaAssignmentValue(type, value, variables) {
  if (type === 'String' && /^".*"$/.test(value)) return value.slice(1, -1)
  if (type === 'char' && /^'.'$/.test(value)) return value.slice(1, -1)
  if (type === 'boolean' && /^(true|false)$/.test(value)) return value
  if (/^-?\d+(\.\d+)?$/.test(value)) return value
  if (Object.prototype.hasOwnProperty.call(variables, value)) return variables[value]

  return value
}

function evaluateJavaPrintExpression(expression, variables) {
  const parts = splitJavaExpressionParts(expression)

  return parts
    .map((part) => {
      if (/^".*"$/.test(part) || /^'.*'$/.test(part)) return part.slice(1, -1)
      if (Object.prototype.hasOwnProperty.call(variables, part)) return variables[part]
      if (/^[\d+*/ ().-]+$/.test(part)) return String(Function(`"use strict"; return (${part})`)())

      return part
    })
    .join('')
}

function continueJavaProgram(session, submittedValue = null) {
  const nextSession = {
    ...session,
    variables: { ...session.variables },
    lines: [...session.lines],
    waiting: null,
    inputError: '',
  }

  if (session.waiting && submittedValue !== null) {
    if (session.waiting.type !== 'String' && !/^-?\d+(\.\d+)?$/.test(submittedValue.trim())) {
      return {
        ...session,
        inputError: `${session.waiting.name} must be a number. Please enter numbers only.`,
      }
    }

    nextSession.variables[session.waiting.name] = submittedValue
    nextSession.lines.push(`> ${submittedValue}`)
  }

  while (nextSession.index < nextSession.statements.length) {
    const statement = nextSession.statements[nextSession.index]
    const inputAssignment = statement.match(
      /\b(String|int|double|float|boolean|char|long)\s+(\w+)\s*=\s*input\.(nextLine|next|nextInt|nextDouble|nextFloat|nextBoolean)\s*\(\s*\)\s*;/,
    )
    const normalAssignment = statement.match(/\b(String|int|double|float|boolean|char|long)\s+(\w+)\s*=\s*([^;]+);/)
    const printStatement = statement.match(/System\.out\.println\s*\(([\s\S]*?)\)\s*;/)

    nextSession.index += 1

    if (inputAssignment) {
      nextSession.waiting = {
        type: inputAssignment[1],
        name: inputAssignment[2],
      }
      return nextSession
    }

    if (normalAssignment) {
      const [, type, name, rawValue] = normalAssignment
      nextSession.variables[name] = getJavaAssignmentValue(type, rawValue.trim(), nextSession.variables)
      continue
    }

    if (printStatement) {
      nextSession.lines.push(evaluateJavaPrintExpression(printStatement[1], nextSession.variables))
    }
  }

  nextSession.completed = true

  if (nextSession.lines.length === 1) {
    nextSession.lines.push('Java syntax check passed, but nothing was printed.')
  }

  return nextSession
}

function checkOtherLanguage(code, selectedLanguage) {
  if (selectedLanguage === 'python') {
    if (code.includes('console.log')) return 'Python Error: use print(...), not console.log(...).'
    if (code.includes('{') || code.includes('}')) return 'Python Error: Python uses indentation instead of curly braces.'
    if (/^\s*(def|if|for|while|class)\b(?!.*:\s*$)/m.test(code)) {
      return 'Python Syntax Error: a def/if/for/while/class line needs a colon ":".'
    }
    return 'Python syntax check passed. Real Python execution needs a backend runner.'
  }

  if (selectedLanguage === 'cpp') {
    if (!code.includes('#include')) return 'C++ Error: missing #include statement.'
    if (!code.includes('main')) return 'C++ Error: missing main() function.'
    if (code.includes('console.log')) return 'C++ Error: use cout, not console.log(...).'
    return 'C++ syntax check passed. Real C++ execution needs a backend compiler.'
  }

  return 'Language check is not available yet.'
}

export default function Playground() {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [code, setCode] = useState(starterCodeByLanguage.javascript)
  const [output, setOutput] = useState('Run your code to see the output here...')
  const [outputType, setOutputType] = useState('text')
  const [javaSession, setJavaSession] = useState(null)
  const [terminalInput, setTerminalInput] = useState('')
  const lineNumbersRef = useRef(null)

  const lineNumbers = useMemo(() => {
    const lineCount = code.split('\n').length

    return Array.from({ length: lineCount }, (_, index) => index + 1).join('\n')
  }, [code])

  const fileExtension = useMemo(() => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
    }

    return extensions[selectedLanguage] || 'txt'
  }, [selectedLanguage])

  const selectLanguage = (languageId) => {
    setSelectedLanguage(languageId)
    setCode(starterCodeByLanguage[languageId])
    setOutput(
      comingSoonLanguages.has(languageId)
        ? `${languages.find((language) => language.id === languageId)?.name} sandbox is coming soon. We are preparing a smoother compiler experience for this language.`
        : 'Run your code to see the output here...',
    )
    setOutputType('text')
    setJavaSession(null)
    setTerminalInput('')

    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = 0
    }
  }

  const syncLineNumberScroll = (event) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = event.currentTarget.scrollTop
    }
  }

  const runCode = () => {
    setOutputType('text')
    setJavaSession(null)
    setTerminalInput('')

    if (comingSoonLanguages.has(selectedLanguage)) {
      setOutput(
        `${languages.find((language) => language.id === selectedLanguage)?.name} sandbox is coming soon.\n\nThis compiler is being prepared for Wel.X learners and will be available here soon.`,
      )
      return
    }

    if (selectedLanguage === 'html') {
      const htmlCssError = checkHtmlCssSyntax(code)

      if (htmlCssError.includes('Error')) {
        setOutput(htmlCssError)
        return
      }

      setOutput(code)
      setOutputType('html')
      return
    }

    if (selectedLanguage === 'java') {
      const javaError = checkJavaBeforeRun(code)

      if (javaError) {
        setOutput(javaError)
        return
      }

      const session = continueJavaProgram({
        statements: getJavaStatements(code),
        index: 0,
        variables: {},
        lines: ['Output:'],
        waiting: null,
        completed: false,
      })

      setJavaSession(session)
      setOutput(session.lines.join('\n'))
      return
    }

    if (selectedLanguage !== 'javascript') {
      setOutput(checkOtherLanguage(code, selectedLanguage))
      return
    }

    const preRunError = checkJavaScriptBeforeRun(code)

    if (preRunError) {
      setOutput(preRunError)
      return
    }

    const logs = []
    const originalLog = console.log

    try {
      console.log = (...args) => {
        logs.push(args.map(String).join(' '))
      }

      new Function(code)()

      setOutput(
        logs.length
          ? `Output:\n${logs.join('\n')}`
          : 'Code executed successfully, but nothing was printed.',
      )
    } catch (error) {
      setOutput(getFriendlyJavaScriptError(error))
    } finally {
      console.log = originalLog
    }
  }

  const submitJavaTerminalInput = (event) => {
    event.preventDefault()

    if (!javaSession?.waiting) return

    const session = continueJavaProgram(javaSession, terminalInput)
    setJavaSession(session)
    setOutput(session.lines.join('\n'))
    setTerminalInput('')
  }

  const saveCode = () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}')

    if (user.id) {
      const currentPoints = parseInt(localStorage.getItem(`welx_points_${user.id}`) || '0', 10)
      const newPoints = currentPoints + 40

      localStorage.setItem(`welx_points_${user.id}`, newPoints.toString())

      window.dispatchEvent(
        new CustomEvent('welxPointsUpdated', {
          detail: { userId: user.id, points: newPoints },
        }),
      )

      alert(`Code saved to your account! You earned 40 WelX points. Total: ${newPoints}`)
      return
    }

    alert('Code saved to your account!')
  }

  const downloadCode = () => {
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/plain' })

    element.href = URL.createObjectURL(file)
    element.download = `code.${fileExtension}`

    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    URL.revokeObjectURL(element.href)
  }

  return (
    <main className="playground">
      <section className="page-title">
        <p className="brand-kicker">
          <Code size={18} aria-hidden="true" />
          Wel.X Code Playground
        </p>
        <h1>Coding Playground</h1>
        <p>Write, test, and experiment with code in real-time</p>
      </section>

      <section className="workspace">
        <aside className="panel language-panel">
          <h2>Languages</h2>

          <div className="language-list">
            {languages.map((language) => (
              <button
                type="button"
                key={language.id}
                onClick={() => selectLanguage(language.id)}
                className={selectedLanguage === language.id ? 'language active' : 'language'}
              >
                <span aria-hidden="true">{language.icon}</span>
                {language.name}
              </button>
            ))}
          </div>
        </aside>

        <section className="editor-column">
          {comingSoonLanguages.has(selectedLanguage) ? (
            <div className="panel coming-soon-panel">
              <span className="coming-soon-badge">Coming Soon</span>
              <h2>{languages.find((language) => language.id === selectedLanguage)?.name} Compiler</h2>
              <p>
                This sandbox is being prepared for Wel.X learners. JavaScript, Java, and HTML/CSS are ready
                to use now, and this language will join them soon.
              </p>
            </div>
          ) : (
            <>
              <div className="panel editor-panel">
                <div className="panel-toolbar">
                  <h2>
                    <Code size={20} aria-hidden="true" />
                    Code Editor
                  </h2>

                  <div className="actions">
                    <button type="button" onClick={runCode} className="primary-action">
                      <Play size={16} aria-hidden="true" />
                      Run
                    </button>

                    <button type="button" onClick={saveCode} className="secondary-action">
                      <Save size={16} aria-hidden="true" />
                      Save (+40 WelX)
                    </button>

                    <button type="button" onClick={downloadCode} className="secondary-action">
                      <Download size={16} aria-hidden="true" />
                      Download
                    </button>
                  </div>
                </div>

                <div className="code-editor-shell">
                  <pre ref={lineNumbersRef} className="line-numbers" aria-hidden="true">
                    {lineNumbers}
                  </pre>
                  <textarea
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    onScroll={syncLineNumberScroll}
                    spellCheck="false"
                    className="code-editor"
                    aria-label={`${selectedLanguage} code editor`}
                    placeholder="Write your code here..."
                  />
                </div>
              </div>

              <div className="panel output-panel">
                <h2>Output</h2>
                {outputType === 'html' ? (
                  <iframe
                    title="HTML/CSS output preview"
                    className="html-preview"
                    sandbox=""
                    srcDoc={output}
                  />
                ) : (
                  <div className={output.includes('Error') ? 'output error' : 'output'}>
                    <pre>{output}</pre>
                    {javaSession?.waiting && (
                      <form className="terminal-form" onSubmit={submitJavaTerminalInput}>
                        <span aria-hidden="true">&gt;</span>
                        <input
                          value={terminalInput}
                          onChange={(event) => setTerminalInput(event.target.value)}
                          className="terminal-input"
                          aria-label={`Enter Java ${javaSession.waiting.name}`}
                          inputMode={javaSession.waiting.type === 'String' ? 'text' : 'numeric'}
                          pattern={javaSession.waiting.type === 'String' ? undefined : '[0-9.-]*'}
                          autoFocus
                        />
                        <button type="submit">Enter</button>
                      </form>
                    )}
                    {javaSession?.inputError && <p className="terminal-error">{javaSession.inputError}</p>}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="panel examples-panel">
            <h2>Example Projects</h2>

            <div className="examples-grid">
              {examples.map((project) => (
                <button
                  type="button"
                  key={project.title}
                  className="example-card"
                  onClick={() => selectLanguage(project.lang)}
                >
                  <strong>{project.title}</strong>
                  <span>
                    {project.label} - {project.difficulty}
                  </span>
                </button>
              ))}
            </div>

            <div className="points-callout">
              <h3>Earn WelX Points</h3>

              <ul>
                <li>Save a project: +40 WelX points</li>
                <li>Share your code: +20 WelX points</li>
                <li>Complete a coding challenge: +30 WelX points</li>
              </ul>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
