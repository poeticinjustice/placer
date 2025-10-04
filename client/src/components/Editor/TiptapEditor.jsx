import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useState } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import 'prosemirror-view/style/prosemirror.css'
import './TiptapEditor.css'

const MenuBar = ({ editor }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  if (!editor) {
    return null
  }

  const handleLinkSubmit = (e) => {
    e.preventDefault()
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim(), target: '_blank' }).run()
    }
    setLinkUrl('')
    setShowLinkDialog(false)
  }

  const handleLinkButtonClick = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
    } else {
      setShowLinkDialog(true)
    }
  }

  return (
    <>
      <div className="menu-bar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold"
          aria-label="Toggle bold formatting"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic"
          aria-label="Toggle italic formatting"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Heading"
          aria-label="Toggle heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="Subheading"
          aria-label="Toggle heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
          aria-label="Toggle bullet list"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Numbered List"
          aria-label="Toggle numbered list"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          title="Quote"
          aria-label="Toggle blockquote"
        >
          "
        </button>
        <button
          type="button"
          onClick={handleLinkButtonClick}
          className={editor.isActive('link') ? 'is-active' : ''}
          title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
          aria-label={editor.isActive('link') ? 'Remove link' : 'Add link'}
        >
          {editor.isActive('link') ? '🔗✕' : '🔗'}
        </button>
      </div>

      {showLinkDialog && (
        <div className="link-dialog-overlay" onClick={() => setShowLinkDialog(false)}>
          <div className="link-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Insert Link</h3>
            <form onSubmit={handleLinkSubmit}>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                autoFocus
                required
                aria-label="Enter URL"
              />
              <div className="link-dialog-buttons">
                <button type="submit" className="btn-primary">Insert</button>
                <button type="button" onClick={() => setShowLinkDialog(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

const TiptapEditor = ({ content, onChange, placeholder = 'Start typing...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false, // Disable the default link extension from StarterKit
      }),
      Placeholder.configure({
        placeholder
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      })
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor'
      }
    }
  })

  // Update editor content when the content prop changes (e.g., after clearing)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '')
    }
  }, [content, editor])

  return (
    <div className="tiptap-wrapper">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor
