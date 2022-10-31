import Bold from '@tiptap/extension-bold';
import Code from '@tiptap/extension-code';
import Document from '@tiptap/extension-document';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Heading from '@tiptap/extension-heading';
import History from '@tiptap/extension-history';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Strike from '@tiptap/extension-strike';
import Text from '@tiptap/extension-text';
import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';
import { createGlobalStyle } from 'styled-components';
import { cleanMD } from '../../utils/cleanMD';
import { BubbleMenuContainer, LinkMenu, StandardMenu } from './common';

export const CommentTipTapStyles = createGlobalStyle`
.comment-tip-tap {
  .ProseMirror {
    p {
      padding: 4px 0;
      color: #808080;
      &::placeholder {
        color: #BFBFBF;
      }
    }
  }
}
`;

export const CommentTiptap: FC<{
  placeholder?: string;
  disabled?: boolean;
  defaultContent?: string;
  content?: string;
  onChange?: (html: string, text: string) => void;
}> = React.memo(({ placeholder, disabled, defaultContent, onChange }) => {
  const onUpdate = useCallback(
    ({ editor }) => {
      const html = (editor as Editor).getHTML();
      const text = (editor as Editor).getText();
      onChange?.(html, text);
    },
    [onChange],
  );

  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({
        levels: [1],
      }),
      Bold,
      Code,
      Strike,
      Dropcursor,
      Gapcursor,
      History,
      Italic,
      Link.configure({
        linkOnPaste: true,
        autolink: true,
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write something …',
      }),
    ],
    content: !!defaultContent ? cleanMD(defaultContent) : undefined,
    onUpdate,
    editable: !disabled,
  });

  const prevSelection = usePrevious(editor?.state.selection);

  useEffect(() => {
    const currentSelection = editor?.state.selection;
    if (
      prevSelection?.from === currentSelection?.from &&
      prevSelection?.to === currentSelection?.to
    ) {
      return;
    }
    setIsLinkMenuOpen(false);
  }, [prevSelection, editor?.state.selection]);

  return (
    <div className={'comment-tip-tap'}>
      {editor && (
        <BubbleMenu editor={editor}>
          <BubbleMenuContainer>
            {isLinkMenuOpen ? (
              <LinkMenu
                editor={editor}
                toggleLinkMenu={() => setIsLinkMenuOpen((s) => !s)}
              />
            ) : (
              <StandardMenu
                editor={editor}
                toggleLinkMenu={() => setIsLinkMenuOpen((s) => !s)}
              />
            )}
          </BubbleMenuContainer>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  );
});
