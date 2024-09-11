interface CollapseListProps {
  list: string[];
  type?: 'and' | 'or' | 'join';
  locales?: Intl.LocalesArgument
}

export class Formatting {
  public static collapseList ({ list, type = 'and', locales = 'en' }: CollapseListProps) {
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
}
