export const storefrontContentDefinitions = [
  {key: 'home.hero.kicker', namespace: 'Home', messageKey: 'hero.kicker'},
  {key: 'home.hero.title', namespace: 'Home', messageKey: 'hero.title'},
  {key: 'home.hero.description', namespace: 'Home', messageKey: 'hero.description'},
  {key: 'home.hero.primary', namespace: 'Home', messageKey: 'hero.primary'},
  {key: 'home.hero.secondary', namespace: 'Home', messageKey: 'hero.secondary'},
  {key: 'home.hero.edition', namespace: 'Home', messageKey: 'hero.edition'},
  {key: 'home.categories.women.title', namespace: 'Home', messageKey: 'categories.women.title'},
  {key: 'home.categories.men.title', namespace: 'Home', messageKey: 'categories.men.title'},
  {key: 'home.categories.kids.title', namespace: 'Home', messageKey: 'categories.kids.title'},
  {key: 'home.values.craft.title', namespace: 'Home', messageKey: 'values.craft.title'},
  {key: 'home.values.craft.text', namespace: 'Home', messageKey: 'values.craft.text'},
  {key: 'home.values.comfort.title', namespace: 'Home', messageKey: 'values.comfort.title'},
  {key: 'home.values.comfort.text', namespace: 'Home', messageKey: 'values.comfort.text'},
  {key: 'home.values.service.title', namespace: 'Home', messageKey: 'values.service.title'},
  {key: 'home.values.service.text', namespace: 'Home', messageKey: 'values.service.text'},
  {key: 'home.signatureTitle', namespace: 'Home', messageKey: 'signatureTitle'},
  {key: 'footer.title', namespace: 'Footer', messageKey: 'title'},
  {key: 'footer.note', namespace: 'Footer', messageKey: 'note'}
] as const;

export type StorefrontContentKey = typeof storefrontContentDefinitions[number]['key'];

export function isStorefrontContentKey(value: string): value is StorefrontContentKey {
  return storefrontContentDefinitions.some((definition) => definition.key === value);
}
