import { Editor } from '@tiptap/react';
import React, { FC, useMemo, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { BaseButton } from '../button';
import { Flex } from '../flex';
import {
  FormatBoldIcon,
  FormatCodeIcon,
  FormatItalicIcon,
  FormatLinkIcon,
  FormatOrderedListIcon,
  FormatStrikeThroughIcon,
  FormatTitleIcon,
  FormatUnorderedListIcon,
} from '../icons/editor';

export const BubbleMenuContainer = styled(Flex)`
  background: #f2f2f2;
  border-radius: 6px;
  overflow: hidden;
`;

const BubbleMenuIconButton = styled(BaseButton)<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  transition: all 150ms ease-in-out;
  background-color: rgba(0, 0, 0, 0);
  > svg {
    height: 20px;
    width: 20px;
    opacity: ${(p) => (p.isActive ? 1 : 0.5)};
    transition: all 150ms ease-in-out;
    * {
      fill: black;
    }
  }
  :hover {
    background-color: rgba(0, 0, 0, 0.05);
    > svg {
      opacity: 1;
    }
  }
`;

export const AddContentMenu: FC<{ editor?: Editor }> = ({ editor }) => {
  if (!editor) {
    return null;
  }
  return (
    <>
      <BubbleMenuIconButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
      >
        <FormatTitleIcon />
      </BubbleMenuIconButton>
      <BubbleMenuIconButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      >
        <FormatUnorderedListIcon />
      </BubbleMenuIconButton>
      <BubbleMenuIconButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      >
        <FormatOrderedListIcon />
      </BubbleMenuIconButton>
    </>
  );
};

export const StandardMenu: FC<{
  editor?: Editor;
  toggleLinkMenu?: () => void;
}> = ({ editor, toggleLinkMenu }) => {
  if (!editor) {
    return null;
  }
  return (
    <>
      <BubbleMenuIconButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      >
        <FormatBoldIcon />
      </BubbleMenuIconButton>
      <BubbleMenuIconButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      >
        <FormatStrikeThroughIcon />
      </BubbleMenuIconButton>
      <BubbleMenuIconButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      >
        <FormatItalicIcon />
      </BubbleMenuIconButton>
      <BubbleMenuIconButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
      >
        <FormatCodeIcon />
      </BubbleMenuIconButton>
      <BubbleMenuIconButton
        onClick={() => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
          } else {
            editor.chain().focus().run();
            toggleLinkMenu?.();
          }
        }}
        isActive={editor.isActive('link')}
      >
        <FormatLinkIcon />
      </BubbleMenuIconButton>
    </>
  );
};

const Input = styled.input`
  outline: none;
  color: black;
  width: 100%;
  font-size: 12px;
  padding: 6px 12px;
  border: none;
  background: none;
  ::placeholder {
    color: black;
    opacity: 0.3;
  }
`;

export const LinkMenu: FC<{ editor?: Editor; toggleLinkMenu?: () => void }> = ({
  editor,
  toggleLinkMenu,
}) => {
  const [linkText, setLinkText] = useState('');
  const isValidLink = useMemo(
    () => linkText.startsWith('http://') || linkText.startsWith('https://'),
    [linkText],
  );

  if (!editor) {
    return null;
  }
  return (
    <>
      <Input
        onChange={(e) => setLinkText(e.target.value)}
        placeholder={'Paste link here'}
      />
      <BubbleMenuIconButton
        disabled={!isValidLink}
        onClick={() => {
          editor
            .chain()
            .focus()
            .toggleLink({ href: linkText, target: '_blank' })
            .run();
          toggleLinkMenu?.();
        }}
        isActive={editor.isActive('link')}
      >
        <FormatLinkIcon />
      </BubbleMenuIconButton>
    </>
  );
};

export const TipTapStyles = createGlobalStyle`
.ProseMirror {
  font-size: 14px;
  h1 {
    font-size: 24px;
    padding: 10px 0 4px 0;
    margin: 0;
  }
  a {
    color: rgba(0, 0, 0, 0.75);
  }
  p {
    line-height: 24px;
    margin: 0;
    padding: 4px 0;
  }
  code {
    background-color: rgba(0,0,0, 0.05);
    border-radius: 4px;
    padding: 2px 4px;
    font-family: 'Roboto Mono', monospace;
  }
}
.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.ProseMirror-focused {
  border: none;
  outline: none;
  p.is-editor-empty:first-child::before {
  content: '';
  }
}
`;
