import MarkdownIt from 'markdown-it';
const md = new MarkdownIt({
    html: true,
    linkify: true,
});

import KianComment from './rendererAddons/comment';
KianComment(md);

export default function render (markdown) {
    return md.render(markdown);
}
