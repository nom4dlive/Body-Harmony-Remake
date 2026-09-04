import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import styled from 'styled-components'

const EditorWrapper = styled.div`
  .ql-container {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    background: white;
    min-height: 150px;
    font-size: 1rem;
    font-family: 'Outfit', sans-serif; /* Match site font */
  }
  
  .ql-toolbar {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    background: #f8f9fa;
  }

  /* Custom overrides for specific looks if needed */
  .ql-editor strong {
    font-weight: 700;
  }
  
  .ql-editor span[style*="color: rgb(212, 175, 55)"] {
     /* Gold color match */
  }
`

const BRAND_COLORS = [
  "#1B4E6B", // Primary (Navy)
  "#DA8E3A", // Secondary (Gold)
  "#081B2B", // Dark
  "#333333", // Text
  "#56585E", // Text Light
  "#FFFFFF", // White
  "#FAFAFA", // Light Gray
  "#00B090", // Success
  "#FC5185", // Error
  "#000000"  // Black
]

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': BRAND_COLORS }, { 'background': BRAND_COLORS }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ],
}

// Compact toolbar for titles
const modulesTitle = {
  toolbar: [
    ['bold', 'italic', { 'color': BRAND_COLORS }],
    ['clean']
  ]
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'align',
  'list'
]

const RichTextEditor = ({ value, onChange, placeholder, isTitle = false }) => {
  return (
    <EditorWrapper>
      <ReactQuill 
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={isTitle ? modulesTitle : modules}
        formats={formats}
        placeholder={placeholder}
      />
    </EditorWrapper>
  )
}

export default RichTextEditor
