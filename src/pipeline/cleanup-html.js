const cheerio = require('cheerio')

module.exports.cleanupHTML = html => {
  const $ = cheerio.load(html)

  // Remove section divider which contains an <hr>
  $('.section--first > .section-divider').remove()

  // Remove the article title within body (Jekyll renders `title` as h1)
  $('.section--first h3.graf.graf--h3.graf--leading.graf--title').remove()

  // Escalate heading levels
  $('h3, h4, h5, h6').each((index, heading) => {
    const level = parseInt(/H(\d)/i.exec(heading.tagName)[1], 10)
    const newLevel = level - 1
    heading.tagName = `h${newLevel}`
  })

  // Remove <pre><br>
  $('pre > br, pre > code > br').replaceWith('\n')

  // Move <code> inside <pre> to the parent <pre>
  $('pre > code:only-child').each((index, code) => {
    $(code.parent).append(code.children)
    $(code).remove()
  })

  // Merge <pre /> + <pre /> to a single <pre>
  $('pre + pre').each((index, pre) => {
    const previousPre = pre.previousSibling

    $(previousPre).append('\n\n', pre.children)
    $(pre).remove()
  })

  // Wrap content of <pre><code> again so that Turndown can identify it as fenced code
  $('pre').each((index, pre) => {
    const code = $('<code />')
    $(code).append(pre.children)
    $(pre.children).remove()
    $(pre).append(code)
  })

  // Merge <blockquote /> + <blockquote /> to a single <blockquote>
  $('blockquote + blockquote').each((index, blockquote) => {
    const previousBlockquote = blockquote.previousSibling

    $(previousBlockquote).append('<br><br>', blockquote.children)
    $(blockquote).remove()
  })

  return $('section[data-field=body]').html()
}

