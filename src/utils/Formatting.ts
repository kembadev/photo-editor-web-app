interface CollapseListType {
  list: string[];
  type?: 'and' | 'or' | 'join';
  locales?: Intl.LocalesArgument
}

export class Formatting {
  static CollapseList ({ list, type = 'and', locales = 'en' }: CollapseListType): string {
    const formattingType: Intl.ListFormatType = type === 'and'
      ? 'conjunction'
      : type === 'or'
        ? 'disjunction'
        : 'unit'

    const formatter = new Intl.ListFormat(locales, {
      style: 'long',
      type: formattingType
    })

    return formatter.format(list)
  }

  static ParseString (text: string) {
    const $text = text.trim()

    return $text.endsWith('.')
      ? $text
      : $text + '.'
  }
}
