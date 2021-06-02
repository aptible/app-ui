export interface LinkResponse {
  href: string;
}

export interface HalEmbedded<E> {
  _embedded: E;
}
